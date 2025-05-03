import { createContext, useState, useEffect, useContext } from "react";

// Create theme context
export const ThemeContext = createContext({
    theme: "light",
    toggleTheme: () => {},
});

// Theme provider component
export function ThemeProvider({ children }) {
    // Initialize theme from local storage or default to light
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        // Check for saved theme or system preference
        return (
            savedTheme ||
            (window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light")
        );
    });

    // Toggle theme function
    const toggleTheme = () => {
        setTheme((prevTheme) => {
            const newTheme = prevTheme === "light" ? "dark" : "light";
            localStorage.setItem("theme", newTheme);
            return newTheme;
        });
    };

    // Update document class when theme changes
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Custom hook for using theme
export function useTheme() {
    return useContext(ThemeContext);
}
