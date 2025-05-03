/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Custom colors for both light and dark modes
                primary: {
                    light: "#8b5cf6", // Purple for light mode
                    dark: "#a78bfa", // Lighter purple for dark mode
                },
                background: {
                    light: "#f8fafc", // Light bg
                    dark: "#0f172a", // Dark bg
                },
                card: {
                    light: "#ffffff", // Light card bg
                    dark: "#1e293b", // Dark card bg
                },
            },
        },
    },
    plugins: [require("@tailwindcss/typography")],
};
