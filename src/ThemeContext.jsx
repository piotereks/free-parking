import React, { createContext, useContext, useState, useEffect } from 'react';

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

export const useTheme = () => useContext(ThemeContext);
