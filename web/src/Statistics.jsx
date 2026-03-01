import React, { useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import Header from './Header';
import { useTheme } from './ThemeContext';
import { sliceWithConnectors } from '../../shared/src/dataTransforms.js';
import { useParkingStore, refreshParkingData } from './store/parkingStore';

const PALETTES = {
    neon: { gd: '#05ffa1', uni: '#01beff' },
    classic: { gd: '#3b82f6', uni: '#f59e0b' },
    cyberpunk: { gd: '#00d9ff', uni: '#ff00cc' },
    modern: { gd: '#10b981', uni: '#6366f1' }
};

const Statistics = ({ setView }) => {
    const historyData = useParkingStore((state) => state.historyData);
    const historyLoading = useParkingStore((state) => state.historyLoading);
    const [palette, setPalette] = React.useState('neon');
    const [showSymbols, setShowSymbols] = React.useState(false);
    const { isLight } = useTheme();

    // Persistent zoom state to prevent reset on palette change
    // Default to full range on first render so chart isn't zoomed in by default
    const [zoom, setZoom] = useState({ start: 0, end: 100 });
    const chartRef = useRef(null);

    const chartOption = useMemo(() => {
        if (!historyData || historyData.length === 0) return null;

        const textColor = isLight ? '#1e293b' : '#8b95c9';
        const gridColor = isLight ? '#cbd5e1' : '#2d3b6b';
        const isMobile = window.innerWidth <= 600;

        const greenDayMap = new Map();
        const uniFreeMap = new Map();

        historyData.forEach(row => {
            const findKey = (name) => Object.keys(row).find(k => k.trim().toLowerCase() === name);
            const gdTimeKey = findKey('gd_time');
            const gdFreeKey = findKey('greenday free');
            const uniTimeKey = findKey('uni_time');
            const uniFreeKey = findKey('uni free');

            if (gdTimeKey && gdFreeKey && row[gdTimeKey] && row[gdFreeKey]) {
                const ts = row[gdTimeKey].trim();
                const val = parseFloat(row[gdFreeKey]);
                if (!isNaN(val)) greenDayMap.set(ts, val);
            }
            if (uniTimeKey && uniFreeKey && row[uniTimeKey] && row[uniFreeKey]) {
                const ts = row[uniTimeKey].trim();
                const val = parseFloat(row[uniFreeKey]);
                if (!isNaN(val)) uniFreeMap.set(ts, val);
            }
        });

        const getRawData = (map) => {
            return Array.from(map.entries())
                .map(([t, v]) => ({ t: new Date(t), v, raw: t }))
                .filter(item => !isNaN(item.t.getTime()))
                .sort((a, b) => a.t - b.t);
        };

        let rawGD = getRawData(greenDayMap);
        let rawUni = getRawData(uniFreeMap);

        // Deduplicate entries by timestamp + value so identical rows aren't plotted twice
        const dedupeByRawAndValue = (arr) => {
            const seen = new Set();
            return arr.filter(item => {
                const key = `${item.raw}|${item.v}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        };

        rawGD = dedupeByRawAndValue(rawGD);
        rawUni = dedupeByRawAndValue(rawUni);

        // If one series' first (earliest) data point is much older than the other's
        // (e.g. Uni only has an old single point), align the older first point's
        // timestamp to the newer series' first timestamp so it displays near the
        // recent data instead of as a long-out-of-range flat line.
        if (rawGD.length > 0 && rawUni.length > 0) {
            const gdFirst = rawGD[0].t.getTime();
            const uniFirst = rawUni[0].t.getTime();

            // If uni is older than gd, move uni first timestamp to gd first
            if (uniFirst < gdFirst) {
                rawUni[0].t = new Date(gdFirst);
                rawUni[0].raw = rawGD[0].raw;
            }

            // Conversely, if gd is older than uni, align gd to uni
            if (gdFirst < uniFirst) {
                rawGD[0].t = new Date(uniFirst);
                rawGD[0].raw = rawUni[0].raw;
            }
        }

        // Find global min/max timestamp across all series
        const allTimestamps = [...rawGD.map(d => d.t.getTime()), ...rawUni.map(d => d.t.getTime())];
        const maxTime = allTimestamps.length > 0 ? Math.max(...allTimestamps) : null;
        const minTime = allTimestamps.length > 0 ? Math.min(...allTimestamps) : null;

        // compute visible window in ms based on zoom percentages (0-100)
        let visibleStartMs = null;
        let visibleEndMs = null;
        if (minTime != null && maxTime != null && maxTime > minTime) {
            const span = maxTime - minTime;
            visibleStartMs = Math.round(minTime + (zoom.start / 100) * span);
            visibleEndMs = Math.round(minTime + (zoom.end / 100) * span);
        }

        // Find the raw string associated with this global max
        let globalMaxRaw = null;
        if (maxTime) {
            const foundGD = rawGD.find(d => d.t.getTime() === maxTime);
            const foundUni = rawUni.find(d => d.t.getTime() === maxTime);
            globalMaxRaw = (foundGD || foundUni)?.raw;
        }

        const processMapWithProjections = (raw, maxT, maxR, vStartMs, vEndMs) => {
            if (raw.length === 0) return { solid: [], gaps: [], projections: [] };

            const solid = [];
            const gaps = [];
            const projections = [];
            // const GAP_LIMIT = 40 * 60 * 1000;

            // Optionally slice to visible window but include connector points
            let toIterate = raw;
            if (vStartMs != null && vEndMs != null) {
                toIterate = sliceWithConnectors(raw, vStartMs, vEndMs);
            }

            for (let i = 0; i < toIterate.length; i++) {
                solid.push([toIterate[i].raw, toIterate[i].v]);
                // if (i < toIterate.length - 1 && (toIterate[i + 1].t - toIterate[i].t) > GAP_LIMIT) {
                //     solid.push([toIterate[i + 1].raw, null]);
                //     gaps.push([toIterate[i].raw, toIterate[i].v], [toIterate[i + 1].raw, toIterate[i + 1].v], [toIterate[i + 1].raw, null]);
                // }
            }

            // Correct projection logic: only if this line ends significantly before the global max
            const lastPoint = raw[raw.length - 1];
            if (lastPoint && maxT && (maxT - lastPoint.t.getTime()) > 1000) {
                // Add the connection point to ensure no gap between solid and projection
                projections.push([lastPoint.raw, lastPoint.v]);
                projections.push([maxR, lastPoint.v]);
            }

            return { solid, gaps, projections };
        };

        const gd = processMapWithProjections(rawGD, maxTime, globalMaxRaw, visibleStartMs, visibleEndMs);
        const uni = processMapWithProjections(rawUni, maxTime, globalMaxRaw, visibleStartMs, visibleEndMs);
        const colors = PALETTES[palette];

        // Dynamic legend names
        const gdName = rawGD.length > 0 ? 'GreenDay' : 'GreenDay - not found';
        const uniName = rawUni.length > 0 ? 'Uni Wroc' : 'Uni Wroc - not found';

        return {
            backgroundColor: 'transparent',
            animation: true,
            animationDuration: 300,
            tooltip: { trigger: 'axis', confine: true, axisPointer: { type: 'cross' } },
            legend: {
                data: [gdName, uniName],
                top: 5,
                textStyle: { color: textColor }
            },
            grid: { left: isMobile ? 10 : 15, right: isMobile ? 10 : 15, bottom: isMobile ? 80 : 50, top: 40, containLabel: true },
            xAxis: {
                type: 'time',
                axisLabel: { color: textColor, margin: 10 },
                axisLine: { lineStyle: { color: gridColor } },
                splitLine: { show: false }
            },
            yAxis: {
                type: 'value',
                min: -5,
                max: 200,
                splitLine: { lineStyle: { color: gridColor, opacity: 0.3 } },
                axisLabel: {
                    color: textColor,
                    formatter: (val) => val < 0 ? '' : val
                }
            },
            dataZoom: [
                { type: 'inside', start: zoom.start, end: zoom.end, filterMode: 'none' },
                {
                    type: 'slider',
                    start: zoom.start,
                    end: zoom.end,
                    bottom: isMobile ? 40 : 10,
                    height: isMobile ? 30 : 25,
                    textStyle: { color: textColor, fontSize: isMobile ? 11 : 12 },
                    filterMode: 'none',
                    handleSize: isMobile ? '180%' : '100%',
                    borderColor: textColor,
                    fillerColor: 'rgba(100, 149, 237, 0.3)',
                    dataBackground: {
                        lineStyle: { color: textColor, opacity: 0.5 },
                        areaStyle: { color: textColor, opacity: 0.2 }
                    },
                    moveHandleSize: isMobile ? 10 : 7,
                    emphasis: {
                        handleStyle: {
                            borderWidth: 2
                        }
                    }
                }
            ],
            series: [
                // GreenDay
                {
                    name: gdName, type: 'line', data: gd.solid, showSymbol: showSymbols,
                    lineStyle: { width: 3, color: colors.gd }, itemStyle: { color: colors.gd },
                    areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: `${colors.gd}33` }, { offset: 1, color: `${colors.gd}00` }]) },
                    markLine: {
                        symbol: 'none',
                        data: [{
                            yAxis: 187,
                            lineStyle: { color: colors.gd, type: 'dotted', opacity: 1 },
                            label: { position: 'start', formatter: '187', color: colors.gd, fontWeight: 'bold', fontSize: 13 }
                        }]
                    }
                },
                { name: gdName, type: 'line', data: gd.gaps, showSymbol: false, lineStyle: { width: 2, color: colors.gd, type: 'dashed', opacity: 0.4 }, tooltip: { show: false } },
                {
                    name: gdName, type: 'line', data: gd.projections, showSymbol: false,
                    lineStyle: { width: 1.5, color: colors.gd, type: [5, 5], opacity: 0.5 },
                    tooltip: { show: false }
                },

                // Uni Wroc
                {
                    name: uniName, type: 'line', data: uni.solid, showSymbol: showSymbols,
                    lineStyle: { width: 3, color: colors.uni }, itemStyle: { color: colors.uni },
                    areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: `${colors.uni}33` }, { offset: 1, color: `${colors.uni}00` }]) },
                    markLine: {
                        symbol: 'none',
                        data: [{
                            yAxis: 41,
                            lineStyle: { color: colors.uni, type: 'dotted', opacity: 1 },
                            label: { position: 'start', formatter: '41', color: colors.uni, fontWeight: 'bold', fontSize: 13 }
                        }]
                    }
                },
                { name: uniName, type: 'line', data: uni.gaps, showSymbol: false, lineStyle: { width: 2, color: colors.uni, type: 'dashed', opacity: 0.4 }, tooltip: { show: false } },
                {
                    name: uniName, type: 'line', data: uni.projections, showSymbol: false,
                    lineStyle: { width: 1.5, color: colors.uni, type: [5, 5], opacity: 0.5 },
                    tooltip: { show: false }
                }
            ]
        };
    }, [historyData, palette, showSymbols, isLight, zoom]);

    const onChartEvents = {
        'datazoom': (params) => {
            if (params.batch && params.batch[0]) {
                setZoom({ start: params.batch[0].start, end: params.batch[0].end });
            } else if (params.start !== undefined && params.end !== undefined) {
                setZoom({ start: params.start, end: params.end });
            }
        }
    };

    return (
        <div className="page-wrapper">
            <Header
                title="Parking History"
                shortTitle="Hist"
                icon="📈"
                onRefresh={refreshParkingData}
                updateStatus={historyLoading ? 'Updating...' : 'Ready'}
                currentView="stats"
                setView={setView}
            >
                <div className="palette-group">
                    <span className="palette-label">Palette:</span>
                    {Object.keys(PALETTES).map(p => (
                        <div
                            key={p}
                            className={`palette-btn ${palette === p ? 'active' : ''}`}
                            style={{ background: `linear-gradient(135deg, ${PALETTES[p].gd} 50%, ${PALETTES[p].uni} 50%)` }}
                            onClick={() => setPalette(p)}
                            title={p.charAt(0).toUpperCase() + p.slice(1)}
                        />
                    ))}
                    <button className="palette-toggle-btn" onClick={() => setShowSymbols(!showSymbols)}>
                        Dots: {showSymbols ? 'Off' : 'On'}
                    </button>
                </div>
            </Header>
            <main className="stats-container">
                {historyLoading && historyData.length === 0 ? (
                    <div className="loader">Loading history data...</div>
                ) : (
                    chartOption ? (
                        <ReactECharts
                            ref={chartRef}
                            option={chartOption}
                            style={{ height: '100%', width: '100%', touchAction: 'none' }}
                            onEvents={onChartEvents}
                            notMerge={false}
                            lazyUpdate={true}
                            opts={{ renderer: 'canvas' }}
                        />
                    ) : (
                        <div className="loader">No data available to display.</div>
                    )
                )}
            </main>
        </div>
    );
};

Statistics.propTypes = {
  setView: PropTypes.func.isRequired
};

export default Statistics;
