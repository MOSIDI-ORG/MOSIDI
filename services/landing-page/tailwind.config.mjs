/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {},
		colors: {
			transparent: "transparent",
			current: "currentColor",
			black: "#000",
			white: "#fff",
			set: {
				1: {
					100: "#FFFFCD",
					200: "#B2D9B4",
					300: "#41B6C4",
					400: "#2C7FB8",
					500: "#2E3790",
				},
				2: {
					100: "#F0F9E8",
					200: "#BAE4BC",
					300: "#7BCCC4",
					400: "#43A2CA",
					500: "#2E3790",
				},
			},
			gray: {
				0: "#fff",
				100: "#F7F8F9",
				200: "#F1F2F4",
				300: "#DCDFE4",
				400: "#B9BFC9",
				500: "#99A0AD",
				600: "#7D8695",
				700: "#697282",
				800: "#535E70",
				900: "#3F4A5C",
				1000: "#283345",
				1100: "#151F30",
				alpha: {
					100: "rgba(9, 30, 66, 0.0314)",
					200: "rgba(9, 30, 66, 0.0588)",
					300: "rgba(9, 30, 66, 0.1412)",
					400: "rgba(9, 30, 66, 0.3098)",
					500: "rgba(9, 30, 66, 0.4902)",
				},
			},
		},
		fontFamily: {
			manrope: ["Manrope Variable", "sans-serif"],
			speziaMono: ["Spezia Mono", "monospace"],
		},
		screens: {
			md: "768px",
			lg: "1024px",
		},
	},
	plugins: [],
};
