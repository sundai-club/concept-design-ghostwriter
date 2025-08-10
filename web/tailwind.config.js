/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: "#0b1020",
                panel: "#0f1630",
                border: "#1b2340",
                text: "#e6e9f5",
                subtext: "#98a2c3",
                brand: "#5b8cff",
            },
        },
    },
    plugins: [],
};


