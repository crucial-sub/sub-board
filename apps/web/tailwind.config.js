/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/app/**/*.{ts,tsx}",
		"./src/components/**/*.{ts,tsx}",
		"./src/features/**/*.{ts,tsx}",
		"./src/hooks/**/*.{ts,tsx}",
		"./src/lib/**/*.{ts,tsx}",
	],
	theme: {
		container: {
			center: true,
			padding: "1rem",
			screens: {
				sm: "100%",
				md: "100%",
				lg: "960px",
				xl: "1120px",
			},
		},
		borderRadius: {
			none: "0px",
			sm: "var(--radius-sm)",
			md: "var(--radius-md)",
			lg: "var(--radius-lg)",
			xl: "var(--radius-xl)",
			"2xl": "var(--radius-2xl)",
			full: "9999px",
		},
		extend: {
			fontFamily: {
				sans: [
					"Pretendard Variable",
					"Pretendard",
					"system-ui",
					"-apple-system",
					"BlinkMacSystemFont",
					'"Segoe UI"',
					"sans-serif",
				],
				mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
			},
			colors: {
				bg: {
					app: "var(--bg-app)",
					surface: "var(--bg-surface)",
				},
				text: {
					primary: "var(--text-primary)",
					secondary: "var(--text-secondary)",
					subtle: "var(--text-subtle)",
				},
				border: {
					DEFAULT: "var(--border-default)",
					muted: "var(--border-muted)",
				},
				brand: {
					DEFAULT: "var(--brand)",
					hover: "var(--brand-hover)",
					weak: "var(--brand-weak)",
				},
			},
			boxShadow: {
				card: "var(--shadow-card)",
				popover: "var(--shadow-popover)",
			},
		},
	},
	plugins: [],
};
