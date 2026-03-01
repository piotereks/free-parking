# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.4.0](https://github.com/piotereks/free-parking/compare/v2.3.1...v2.4.0) (2026-03-01)


### Features

* **mobile:** add parking statistics chart screen for Android ([4b34b8d](https://github.com/piotereks/free-parking/commit/4b34b8dc4dde467d99336132d6e57692c635be26))
* **mobile:** add progress bar and % free to dashboard tiles and summary ([7d41546](https://github.com/piotereks/free-parking/commit/7d41546c6897bb78811835bc7fa50c11bd1cfd2e))
* **mobile:** add zoom (×1 ×2 ×4) and pan (◀ ▶) controls to StatisticsChart ([e844699](https://github.com/piotereks/free-parking/commit/e8446998a4f759c9a281f7aed2d97ea15cb2d1f4))
* **mobile:** banner in stats, palette strip separated, header maxWidth, hide summary on short landscape ([d9caf83](https://github.com/piotereks/free-parking/commit/d9caf83c86dfc947dfac9777bca90ba68b4ca578))
* **mobile:** increase x-axis time markers on statistics chart ([9b734a6](https://github.com/piotereks/free-parking/commit/9b734a66b31feabd16f66f7ec680cc50d90578ff))
* **mobile:** match StatisticsScreen header to dashboard header dimensions ([ce6bd75](https://github.com/piotereks/free-parking/commit/ce6bd753e0420bff7795542bf352165efc19012f))
* **mobile:** replace bar chart with line graph matching web Statistics view ([84d78ab](https://github.com/piotereks/free-parking/commit/84d78ab0f79e912da12fb20d3275146f1bcc870b))


### Bug Fixes

* **mobile:** bar color by free %, blank-line placeholder, summary bar width ([11be2aa](https://github.com/piotereks/free-parking/commit/11be2aa1513326e3da65b3ac7c1c7cb2d28c0daf))
* **mobile:** constrain landscape chart to panel, shorten status messages to ≤4 words ([adf2591](https://github.com/piotereks/free-parking/commit/adf25912f4a14edeb4a639e8e0ceb71f4a11d6cf))
* **mobile:** hide landscape parking tiles when screenHeight < 400 ([88e2d92](https://github.com/piotereks/free-parking/commit/88e2d92051d20c31cc23567c2e56cc4ab0c2c63c))
* **mobile:** move summaryBarColor after statusColorClass declaration in App.js ([63d0a43](https://github.com/piotereks/free-parking/commit/63d0a43c1f96f742ec421866a8831faa1302e5a9))
* **mobile:** project chart line segments to viewport edges when zoomed/panned ([1a4cb11](https://github.com/piotereks/free-parking/commit/1a4cb11dee06e3d81cf9e704cace2c385a67fd2c))
* **mobile:** remove landscape chart vertical scroll; hide subtitle on small height ([de69bda](https://github.com/piotereks/free-parking/commit/de69bda64f932a06b69e0d3b2a126d42b3df996b))
* **mobile:** replace victory-native with pure-RN bar chart to fix Expo bundler error ([edbaf93](https://github.com/piotereks/free-parking/commit/edbaf938800d42382afd3794e880db52325736bc))
* **mobile:** UI oversize fixes for issues [#125](https://github.com/piotereks/free-parking/issues/125) and [#138](https://github.com/piotereks/free-parking/issues/138) ([06a4214](https://github.com/piotereks/free-parking/commit/06a4214dbfec2fc5d2d7e46160c623d05048a0f2))
* remove double-zoom in Statistics.jsx and correct buildEdgeSeg inner-segment case in StatisticsChart ([149dfd4](https://github.com/piotereks/free-parking/commit/149dfd466f3ffd0ffb4559ac05a5116f27ac7fc4))
* **stats:** chart full visible. ([29238e3](https://github.com/piotereks/free-parking/commit/29238e36cb54d09251c402ef97f6f8ced55019e4))
* time-based windowing in mobile StatisticsChart prevents line loss at viewport boundaries ([86fc76e](https://github.com/piotereks/free-parking/commit/86fc76e2e1735399d060313282ff959ded194300))

### [2.3.1](https://github.com/piotereks/free-parking/compare/v2.3.0...v2.3.1) (2026-02-28)


### Bug Fixes

* **mobile:** add manifest-merger overrides for third-party screenOrientation restrictions ([e7359ad](https://github.com/piotereks/free-parking/commit/e7359ad247622d3e25056ac0ab72b8c50d6c4c64))
* **mobile:** decrease Real-time GD-Uni label font size for small landscape screens ([7cd0559](https://github.com/piotereks/free-parking/commit/7cd05597c7ee6cf826e13676818ea586d6b04b9f))
* **mobile:** remove screenOrientation restriction for Android 16+ large-screen compliance ([a282a85](https://github.com/piotereks/free-parking/commit/a282a8585e2713221ed39fc8c31b3808650a1f51))

## [2.3.0](https://github.com/piotereks/free-parking/compare/v2.2.1...v2.3.0) (2026-02-24)


### Features

* **mobile:** add android:resizeableActivity=true for Android 16+ large-screen support ([25e00db](https://github.com/piotereks/free-parking/commit/25e00db5abfe444be1e4de1dc8c8ad056ca02ced))

### [2.2.1](https://github.com/piotereks/free-parking/compare/v1.1.5...v2.2.1) (2026-02-24)


### Bug Fixes

* deprecated-edge-to-edge-apis ([0dfaeb2](https://github.com/piotereks/free-parking/commit/0dfaeb23b19b7ac4929697f9a2dea1ce5587c669))
* replace deprecated react-native StatusBar with expo-status-bar for Android 15 compatibility ([3a6f4f9](https://github.com/piotereks/free-parking/commit/3a6f4f9236d8c5d1d65f0f108f98069605b8e7b7))

## [2.2.0](https://github.com/piotereks/free-parking/compare/v1.1.2...v2.2.0) (2026-02-22)


### Features

* change narrow screen breakpoint from 600px to 700px ([e011b5e](https://github.com/piotereks/free-parking/commit/e011b5eff0e5d5f7286a4a387b677417c1ec0439))
* **header:** add version marker ([ee9b11b](https://github.com/piotereks/free-parking/commit/ee9b11bb1c9b967de2b6405e53e2440204d31c3d))
* improve narrow screen header layout for web dashboard and stats view ([c9c971a](https://github.com/piotereks/free-parking/commit/c9c971ae82329fce32abc5f557dc5cfc34fc8002))
* make coffee button always rightmost by moving it after theme toggle in JSX ([945a519](https://github.com/piotereks/free-parking/commit/945a51991a603c5a8ea587aca007a576dbc8a35f))
* narrow screen - coffee btn after theme toggle, emoji-only, Parking short title ([dff63b2](https://github.com/piotereks/free-parking/commit/dff63b287c159d5f4961fd03bb2f98e96e014d17))

## [2.1.0](https://github.com/piotereks/free-parking/compare/v2.0.0...v2.1.0) (2026-02-21)


### Features

* **mobile:** 70% larger parking value digits; fix doubled SafeAreaView system-bar padding ([3fb51a8](https://github.com/piotereks/free-parking/commit/3fb51a89f8e7076f1a86c19427041d842ffb2599))
* **mobile:** add Buy me ☕ donate button to portrait and landscape headers ([f2732e7](https://github.com/piotereks/free-parking/commit/f2732e7ea1fc6a7be7477f001d44c72fe24f0e79))
* **mobile:** add landscape mode runtime orientation support ([aa808c6](https://github.com/piotereks/free-parking/commit/aa808c64a66b01a65b12eb9f7f3e936ac55dbd92))
* **mobile:** add Real-time • GD-Uni Wrocław subtitle below title in landscape header ([5dda236](https://github.com/piotereks/free-parking/commit/5dda23665edea7cde0185ffb9215f7f951b6e648))
* **mobile:** AdTile container adapts to actual loaded ad dimensions ([e525f16](https://github.com/piotereks/free-parking/commit/e525f164ce08fca0a33db96106c3397c3498ae6e))
* **mobile:** cap AdTile width at 2/5 of screen width (AD_TILE_MAX_WIDTH_RATIO) ([3a9ae12](https://github.com/piotereks/free-parking/commit/3a9ae12a02e528e8868b4b50deddc1343e696983))
* **mobile:** landscape header 25% width, tile value 2/3, orig/age aligned in right column ([b4bad8a](https://github.com/piotereks/free-parking/commit/b4bad8a4174de03973dd92f4b0c0d1f1934c3b1f))
* **mobile:** landscape header column inline with parking tiles ([4832983](https://github.com/piotereks/free-parking/commit/48329839cb91cf62a79c5f5aef8f2b2eb1f712e3))
* **mobile:** landscape header title and tile names 50% bigger (12→18px, 14→21px) ([05eb846](https://github.com/piotereks/free-parking/commit/05eb84606483ab0b632408d841f7e59f14c6c256))
* **mobile:** landscape inline ad tile at left of parking tiles (INLINE_ADAPTIVE_BANNER) ([32c1bb0](https://github.com/piotereks/free-parking/commit/32c1bb093b43ec8b3b7b0aa052e65f6f6f9fe416))
* **mobile:** landscape refresh in header, row-oriented tiles, single-page flex layout ([c602a60](https://github.com/piotereks/free-parking/commit/c602a60da775551d0307cc35f2adcfd02d44f22d))
* **mobile:** landscape skyscraper ad on left side (160x600) ([869bde9](https://github.com/piotereks/free-parking/commit/869bde9f308642ae9fd501361378e5de576cc28e))
* **mobile:** landscape uses same BANNER as portrait, remove inline ad tile from tiles row ([4e1cc5a](https://github.com/piotereks/free-parking/commit/4e1cc5a1b6bc15467fe8287f290bfbb23b896526))
* **mobile:** move landscape status message between tiles row and summary card ([8f5f40e](https://github.com/piotereks/free-parking/commit/8f5f40ee56a7e47b6e2d68f63c0943368032575d))
* **mobile:** row-oriented landscape layout — status top, tiles row, summary row ([5fde1b5](https://github.com/piotereks/free-parking/commit/5fde1b5019af428ba6511475317aac533301f731))
* persistence implementation ([9ed07ac](https://github.com/piotereks/free-parking/commit/9ed07ac76616ab1842cc0a4310c49ede1b85f9c3))


### Bug Fixes

* devcontainer folder entry ([cfa355e](https://github.com/piotereks/free-parking/commit/cfa355e36e23643cc310e766b7e6ae85f9d9c416))
* **mobile:** button borders use same border-border color as tile borders in light mode ([1547693](https://github.com/piotereks/free-parking/commit/1547693a56d936ac1e83db28573ebcea2651c6a2))
* **mobile:** increase landscape subtitle font 70% (8px → 14px) ([dafbde4](https://github.com/piotereks/free-parking/commit/dafbde47b5a139e3188f9fdd9fa528dcc6e070fb))
* **mobile:** landscape buttons reordered — theme, reload, Buy me ☕ (full text) ([1af552b](https://github.com/piotereks/free-parking/commit/1af552b2fea539e64d773de40e55290c9a9f14b4))
* **mobile:** landscape header — logo icon and title on same row ([5b0e828](https://github.com/piotereks/free-parking/commit/5b0e8285d7d5289ec5bb4f62afd68f85913836d7))
* **mobile:** landscape header — theme toggle and reload on same row, Buy me ☕ below ([095cd65](https://github.com/piotereks/free-parking/commit/095cd65f3096f42de2d6dedd4fdc192018166db6))
* **mobile:** move banner inside themed SafeAreaView so it matches app background ([7f66c82](https://github.com/piotereks/free-parking/commit/7f66c82f82edd83b1f958fbeb47cf69cd8867edd))
* **mobile:** portrait total tile shows orig on separate line below value ([24fc8ce](https://github.com/piotereks/free-parking/commit/24fc8ce1c8c697bffa6908e5973fb257083a44a0))
* **mobile:** revert portrait parking tile font to original text-6xl ([59a7d1d](https://github.com/piotereks/free-parking/commit/59a7d1d7d5be4a45a49c65162992558ea283e03e))
* **mobile:** show (orig: total) inline with total value in summary card ([fb54457](https://github.com/piotereks/free-parking/commit/fb54457067ac062ef70b7bbc4949cba81837696e))
* **mobile:** switch landscape ad from WIDE_SKYSCRAPER to ADAPTIVE_BANNER, fill screen height ([cc160b6](https://github.com/piotereks/free-parking/commit/cc160b6c5612c59c22db1b011debd4a5b2c787cb))

## [2.0.0](https://github.com/piotereks/free-parking/compare/v1.2.1...v2.0.0) (2026-02-21)

### [1.2.1](https://github.com/piotereks/free-parking/compare/v1.2.0...v1.2.1) (2026-02-21)

## [1.2.0](https://github.com/piotereks/free-parking/compare/v1.1.1...v1.2.0) (2026-02-21)


### Features

* mode switch working ([6f5e041](https://github.com/piotereks/free-parking/commit/6f5e041a0444dbd304cb817214397d90085f2486))
* working color change with parameter ([1d0bc9c](https://github.com/piotereks/free-parking/commit/1d0bc9cbd91a438c7fcb27d62f3999be55ec8341))


### Bug Fixes

* **hooks:** reinstated work ([231032d](https://github.com/piotereks/free-parking/commit/231032dfa425f3af5414e0caacbc40bd4844e118))
* spacing of parking tiles. ([5883f4f](https://github.com/piotereks/free-parking/commit/5883f4f523f36cb10cb402f640fc4ff507df14df))
* working dark mode ([ca4962b](https://github.com/piotereks/free-parking/commit/ca4962b148b5b214bc24571d84cb8898790a4d84))

## [2.0.0](https://github.com/piotereks/free-parking/compare/v1.1.0...v2.0.0) (2026-02-20)

## [1.1.0](https://github.com/piotereks/free-parking/compare/v0.1.0-alpha.0...v1.1.0) (2026-02-20)


### Features

* **AdComponent:** add PropTypes for slot and style props validation ([c5792ab](https://github.com/piotereks/free-parking/commit/c5792ab34fad2d86b68416761d2dca8eb66713d9))
* **header:** show app version below last update in header ([31faa60](https://github.com/piotereks/free-parking/commit/31faa60633cd5dff1938a3179e1dcfd46c251dc7))
* mode switch working ([6f5e041](https://github.com/piotereks/free-parking/commit/6f5e041a0444dbd304cb817214397d90085f2486))
* working color change with parameter ([1d0bc9c](https://github.com/piotereks/free-parking/commit/1d0bc9cbd91a438c7fcb27d62f3999be55ec8341))


### Bug Fixes

* **header:** but ->buy me - label tweak ([2aee192](https://github.com/piotereks/free-parking/commit/2aee192366c54f3f62f7bbab74be7fa890bd001d))
* **header:** replace invalid Tailwind class text-2xs with text-xs ([d38466e](https://github.com/piotereks/free-parking/commit/d38466e0073a5494875464b26060a97e0daffd03))
* **hooks:** reinstated work ([231032d](https://github.com/piotereks/free-parking/commit/231032dfa425f3af5414e0caacbc40bd4844e118))
* spacing of parking tiles. ([5883f4f](https://github.com/piotereks/free-parking/commit/5883f4f523f36cb10cb402f640fc4ff507df14df))
* working dark mode ([ca4962b](https://github.com/piotereks/free-parking/commit/ca4962b148b5b214bc24571d84cb8898790a4d84))
