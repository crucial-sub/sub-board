import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,

	// 성능 최적화
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
	},

	// 번들 최적화
	experimental: {
		optimizePackageImports: ["framer-motion", "@tanstack/react-query"],
	},

	// 이미지 최적화 설정 (향후 사용)
	images: {
		formats: ["image/avif", "image/webp"],
		minimumCacheTTL: 60,
	},
};

export default nextConfig;
