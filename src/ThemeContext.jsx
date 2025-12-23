/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isLight, setIsLight] = useState(
        localStorage.getItem('parking_theme') === 'light'
    );

    useEffect(() => {
        if (isLight) {
            document.body.classList.remove('dark');
            localStorage.setItem('parking_theme', 'light');
        } else {
            document.body.classList.add('dark');
            localStorage.setItem('parking_theme', 'dark');
        }
    }, [isLight]);

    const toggleTheme = () => setIsLight(!isLight);

    return (
        <ThemeContext.Provider value={{ isLight, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export const useTheme = () => useContext(ThemeContext);
