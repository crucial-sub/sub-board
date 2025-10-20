export function SiteFooter() {
	const year = new Date().getFullYear();
	return (
		<footer className="border-t border-white/70 bg-white/75 py-10 text-sm text-text-secondary backdrop-blur-2xl">
			<div className="container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
				<div>
					<p className="text-lg font-semibold text-text-primary">
						함께 만드는 부드러운 커뮤니티 공간
					</p>
					<p className="text-xs text-text-subtle">
						Made with Next.js, Tailwind CSS, and React Query.
					</p>
				</div>
				<p className="text-xs text-text-subtle">
					&copy; {year} Sub Board. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
