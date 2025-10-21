"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { AuthResponse } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/state/auth-store";
import { fetchUserStats, type UserStats } from "@/features/users/api";

type Props = {
	initialUser: AuthResponse["user"] | null;
	initialStats: UserStats | null;
};

// Animation variants
const fadeInUp = {
	hidden: { opacity: 0, y: 60 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
	},
};

const scaleIn = {
	hidden: { opacity: 0, scale: 0.9 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
	},
};

const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.15,
		},
	},
};

// Reusable animated section component - 단순 래퍼로 변경
function AnimatedSection({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return <section className={className}>{children}</section>;
}

export function HomePageClient({ initialUser, initialStats }: Props) {
	const user = useAuthStore((state) => state.user);
	const hasHydrated = useAuthStore((state) => state.hasHydrated);

	const { data: userStats, isLoading: isStatsLoading } = useQuery({
		queryKey: ["user-stats", user?.id],
		queryFn: fetchUserStats,
		enabled: Boolean(hasHydrated && user?.id),
		initialData:
			initialUser && initialUser.id === user?.id
				? initialStats ?? undefined
				: undefined,
		staleTime: 60_000,
	});

	const heroRef = useRef(null);
	const { scrollYProgress } = useScroll({
		target: heroRef,
		offset: ["start start", "end start"],
	});

	const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
	const heroOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);

	if (hasHydrated && user) {
		return (
			<div className="relative -mx-4 -my-10 sm:-mx-6 lg:-mx-8">
				{/* Welcome Hero Section */}
				<AnimatedSection className="section-sky py-24">
					<div className="container mx-auto max-w-6xl px-6">
						<motion.div
							initial="hidden"
							animate="visible"
							variants={staggerContainer}
							className="relative overflow-hidden surface-card px-8 py-12"
						>
							<div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[var(--accent-cyan)]/40 blur-[120px]" />
							<div className="pointer-events-none absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-[var(--accent-pink)]/35 blur-[110px]" />
							<div className="space-y-6">
								<motion.p
									variants={fadeInUp}
									className="text-xs font-semibold uppercase tracking-[0.45em] text-brand"
								>
									Welcome Back
								</motion.p>
								<motion.h1
									variants={fadeInUp}
									className="text-4xl font-semibold text-text-primary sm:text-5xl"
								>
									<span className="gradient-text block">
										{user.nickname}님과 함께하는 오늘의 Sub Board
									</span>
								</motion.h1>
								<motion.p
									variants={fadeInUp}
									className="max-w-2xl text-lg text-text-secondary"
								>
									맞춤 태그로 큐레이션된 최신 게시글을 살펴보고, 영감이 떠오를 때
									바로 새 글을 발행해 보세요.
								</motion.p>
								<motion.div
									variants={fadeInUp}
									className="flex flex-wrap gap-3"
								>
									<Link href="/posts" className="btn-gradient">
										최신 게시글 탐색
									</Link>
									<Link href="/posts/new" className="btn-outline">
										아이디어 작성하기
									</Link>
									<Link href="/search" className="btn-outline">
										검색하기
									</Link>
								</motion.div>
							</div>
						</motion.div>
					</div>
				</AnimatedSection>

				{/* User Stats Section */}
				<AnimatedSection className="section-lime py-24">
					<div className="container mx-auto max-w-6xl px-6">
						<motion.div
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, amount: 0.3 }}
							variants={fadeInUp}
							className="mb-12 text-center"
						>
							<h2 className="text-4xl font-bold text-text-primary sm:text-5xl">
								나의 <span className="gradient-text">활동 통계</span>
							</h2>
							<p className="mt-4 text-lg text-text-secondary">
								Sub Board에서의 여정을 한눈에 확인하세요
							</p>
						</motion.div>
						<motion.div
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, amount: 0.3 }}
							variants={staggerContainer}
							className="grid gap-6 sm:grid-cols-3"
						>
							<motion.div
								variants={scaleIn}
								whileHover={{ scale: 1.01, y: -2 }}
								transition={{ duration: 0.3, ease: "easeOut" }}
								className="feature-card"
							>
								<p className="text-xs uppercase tracking-wide text-text-subtle">
									내 활동
								</p>
								<p className="mt-4 text-3xl font-bold text-text-primary">
									{isStatsLoading ? (
										<span className="inline-block h-8 w-24 animate-pulse rounded bg-border-muted" />
									) : (
										`${userStats?.postCount ?? 0}건`
									)}
								</p>
								<p className="mt-2 text-sm text-text-secondary">
									{isStatsLoading ? (
										<span className="inline-block h-4 w-40 animate-pulse rounded bg-border-muted" />
									) : userStats?.lastPost ? (
										<>
											최근: {userStats.lastPost.title.slice(0, 20)}
											{userStats.lastPost.title.length > 20 ? "..." : ""}
										</>
									) : (
										"첫 게시글을 작성해보세요!"
									)}
								</p>
							</motion.div>

							<motion.div
								variants={scaleIn}
								whileHover={{ scale: 1.01, y: -2 }}
								transition={{ duration: 0.3, ease: "easeOut" }}
								className="feature-card"
							>
								<p className="text-xs uppercase tracking-wide text-text-subtle">
									남긴 댓글
								</p>
								<p className="mt-4 text-3xl font-bold text-text-primary">
									{isStatsLoading ? (
										<span className="inline-block h-8 w-24 animate-pulse rounded bg-border-muted" />
									) : (
										`${userStats?.commentCount ?? 0}건`
									)}
								</p>
								<p className="mt-2 text-sm text-text-secondary">
									토론에 남긴 발자취를 확인해 보세요.
								</p>
							</motion.div>

							<motion.div
								variants={scaleIn}
								whileHover={{ scale: 1.01, y: -2 }}
								transition={{ duration: 0.3, ease: "easeOut" }}
								className="feature-card"
							>
								<p className="text-xs uppercase tracking-wide text-text-subtle">
									자주 사용하는 태그
								</p>
								<div className="mt-4 min-h-[48px]">
									{isStatsLoading ? (
										<div className="flex gap-2">
											<span className="h-6 w-16 animate-pulse rounded-full bg-border-muted" />
											<span className="h-6 w-16 animate-pulse rounded-full bg-border-muted" />
										</div>
									) : userStats?.topTags?.length ? (
										<div className="flex flex-wrap gap-2">
											{userStats.topTags.slice(0, 3).map((tag) => (
												<Link
													key={tag.name}
													href={`/search?tag=${tag.name}`}
													className="tag"
												>
													#{tag.name} · {tag.count}
												</Link>
											))}
										</div>
									) : (
										<p className="text-sm text-text-secondary">
											태그를 사용해보세요!
										</p>
									)}
								</div>
							</motion.div>
						</motion.div>
					</div>
				</AnimatedSection>

				{/* Quick Actions Section */}
				<AnimatedSection className="section-lavender py-24">
					<div className="container mx-auto max-w-6xl px-6">
						<motion.div
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, amount: 0.3 }}
							variants={fadeInUp}
							className="mb-12 text-center"
						>
							<h2 className="text-4xl font-bold text-text-primary sm:text-5xl">
								<span className="gradient-text">빠른 작업</span>
							</h2>
							<p className="mt-4 text-lg text-text-secondary">
								자주 사용하는 기능을 빠르게 실행하세요
							</p>
						</motion.div>
						<motion.div
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, amount: 0.3 }}
							variants={staggerContainer}
							className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
						>
							<motion.div variants={scaleIn}>
								<Link
									href="/posts/new"
									className="testimonial-card group block text-center"
								>
									<motion.div
										className="text-4xl mb-3"
										whileHover={{ scale: 1.1, rotate: 5 }}
										transition={{ duration: 0.3, ease: "easeOut" }}
									>
										✍️
									</motion.div>
									<h3 className="font-semibold text-text-primary group-hover:text-brand transition">
										새 글 작성
									</h3>
								</Link>
							</motion.div>
							<motion.div variants={scaleIn}>
								<Link
									href="/posts"
									className="testimonial-card group block text-center"
								>
									<motion.div
										className="text-4xl mb-3"
										whileHover={{ scale: 1.1, rotate: -5 }}
										transition={{ duration: 0.3, ease: "easeOut" }}
									>
										📚
									</motion.div>
									<h3 className="font-semibold text-text-primary group-hover:text-brand transition">
										게시글 보기
									</h3>
								</Link>
							</motion.div>
							<motion.div variants={scaleIn}>
								<Link
									href="/search"
									className="testimonial-card group block text-center"
								>
									<motion.div
										className="text-4xl mb-3"
										whileHover={{ scale: 1.1, rotate: 5 }}
										transition={{ duration: 0.3, ease: "easeOut" }}
									>
										🔎
									</motion.div>
									<h3 className="font-semibold text-text-primary group-hover:text-brand transition">
										검색
									</h3>
								</Link>
							</motion.div>
							<motion.div variants={scaleIn}>
								<Link
									href="/profile"
									className="testimonial-card group block text-center"
								>
									<motion.div
										className="text-4xl mb-3"
										whileHover={{ scale: 1.1, rotate: -5 }}
										transition={{ duration: 0.3, ease: "easeOut" }}
									>
										👤
									</motion.div>
									<h3 className="font-semibold text-text-primary group-hover:text-brand transition">
										프로필
									</h3>
								</Link>
							</motion.div>
						</motion.div>
					</div>
				</AnimatedSection>
			</div>
		);
	}

	return (
		<div className="relative -mx-4 -my-10 sm:-mx-6 lg:-mx-8">
			{/* Hero Section with Parallax */}
			<section
				ref={heroRef}
				className="landing-section relative overflow-hidden bg-gradient-to-br from-[#f7f9fd] via-[#edf1f8] to-[#f9fbff]"
			>
				<motion.div
					style={{ y: heroY, opacity: heroOpacity }}
					className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 bg-[var(--accent-cyan)]/30 blur-[150px]"
				/>
				<motion.div
					style={{ y: heroY, opacity: heroOpacity }}
					className="pointer-events-none absolute right-1/4 bottom-0 h-96 w-96 bg-[var(--accent-pink)]/25 blur-[150px]"
				/>

				<div className="container relative z-10 mx-auto max-w-6xl px-6 py-20 text-center">
					<motion.div
						initial="hidden"
						animate="visible"
						variants={staggerContainer}
					>
						<motion.p
							variants={fadeInUp}
							className="text-xs font-semibold uppercase tracking-[0.5em] text-brand"
						>
							Next-gen Community Board
						</motion.p>
						<motion.h1
							variants={fadeInUp}
							className="mt-6 text-5xl font-bold leading-tight text-text-primary sm:text-6xl md:text-7xl lg:text-8xl"
						>
							배움을 기록하고
							<br />
							<span className="gradient-text">공유하는 서브 보드</span>
						</motion.h1>
						<motion.p
							variants={fadeInUp}
							className="mx-auto mt-8 max-w-2xl text-lg text-text-secondary sm:text-xl"
						>
							Next.js, React Query, Tailwind CSS로 완성한 커뮤니티 공간입니다.
							<br />
							아이디어를 자유롭게 나누고, 관심 있는 주제를 직접 큐레이션해
							보세요.
						</motion.p>
						<motion.div
							variants={fadeInUp}
							className="mt-10 flex flex-wrap justify-center gap-4"
						>
							<motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.95 }}>
								<Link href="/posts" className="btn-gradient text-base px-8 py-3">
									게시글 둘러보기
								</Link>
							</motion.div>
							{hasHydrated ? (
								<motion.div
									whileHover={{ scale: 1.01 }}
									whileTap={{ scale: 0.95 }}
								>
									<Link
										href="/login"
										className="btn-outline text-base px-8 py-3"
									>
										탐험을 시작할게요
									</Link>
								</motion.div>
							) : (
								<span
									className="btn-outline text-base px-8 py-3 invisible pointer-events-none select-none"
									aria-hidden="true"
								>
									탐험을 시작할게요
								</span>
							)}
						</motion.div>

						{/* Hero Stats with Scale Animation */}
						<motion.div
							variants={staggerContainer}
							className="mt-20 grid gap-8 sm:grid-cols-3"
						>
							{[
								{ id: "posts", number: "500+", label: "커뮤니티 게시글" },
								{ id: "members", number: "100+", label: "활동 중인 멤버" },
								{ id: "tags", number: "50+", label: "다양한 주제 태그" },
							].map((stat) => (
								<motion.div
									key={stat.id}
									variants={scaleIn}
									whileHover={{ scale: 1.01, y: -2 }}
									transition={{ duration: 0.3, ease: "easeOut" }}
									className="surface-glass p-6 cursor-default"
								>
									<div className="stats-number">{stat.number}</div>
									<p className="mt-2 text-sm font-medium text-text-secondary">
										{stat.label}
									</p>
								</motion.div>
							))}
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Features Section */}
			<AnimatedSection className="section-lime py-24">
				<div className="container mx-auto max-w-6xl px-6">
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.3 }}
						variants={fadeInUp}
						className="text-center"
					>
						<h2 className="text-4xl font-bold text-text-primary sm:text-5xl">
							강력한 기능으로{" "}
							<span className="gradient-text">완성하는 커뮤니티</span>
						</h2>
						<p className="mt-6 text-lg text-text-secondary">
							모던 웹 기술로 만든 빠르고 편리한 게시판 경험
						</p>
					</motion.div>
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.3 }}
						variants={staggerContainer}
						className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
					>
						{[
							{
								id: "realtime-notifications",
								emoji: "⚡",
								title: "실시간 알림",
								desc: "SSE 기반 실시간 알림으로 새 게시글과 댓글을 즉시 확인하세요.",
							},
							{
								id: "smart-search",
								emoji: "🔍",
								title: "스마트 검색",
								desc: "태그와 키워드로 원하는 게시글을 빠르게 찾아보세요.",
							},
							{
								id: "intuitive-editor",
								emoji: "📝",
								title: "직관적 에디터",
								desc: "마크다운 지원으로 아름다운 글을 쉽게 작성할 수 있어요.",
							},
							{
								id: "tag-system",
								emoji: "🏷️",
								title: "태그 시스템",
								desc: "관심사별로 태그를 등록하고 맞춤 콘텐츠를 큐레이션하세요.",
							},
							{
								id: "active-discussion",
								emoji: "💬",
								title: "활발한 토론",
								desc: "댓글과 대댓글로 깊이 있는 대화를 이어가세요.",
							},
							{
								id: "stats-dashboard",
								emoji: "📊",
								title: "통계 대시보드",
								desc: "내 활동을 한눈에 확인하고 인사이트를 얻어보세요.",
							},
						].map((feature) => (
							<motion.div
								key={feature.id}
								variants={scaleIn}
								whileHover={{ scale: 1.01, y: -3 }}
								transition={{ duration: 0.3, ease: "easeOut" }}
								className="feature-card cursor-default"
							>
								<motion.div
									className="text-4xl mb-4"
									whileHover={{ scale: 1.1, rotate: 8 }}
									transition={{ duration: 0.3, ease: "easeOut" }}
								>
									{feature.emoji}
								</motion.div>
								<h3 className="text-xl font-semibold text-text-primary">
									{feature.title}
								</h3>
								<p className="mt-3 text-text-secondary">{feature.desc}</p>
							</motion.div>
						))}
					</motion.div>
				</div>
			</AnimatedSection>

			{/* Community Section */}
			<AnimatedSection className="section-sky py-24">
				<div className="container mx-auto max-w-6xl px-6">
					<div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
						<motion.div
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, amount: 0.3 }}
							variants={staggerContainer}
						>
							<motion.h2
								variants={fadeInUp}
								className="text-4xl font-bold text-text-primary sm:text-5xl"
							>
								함께 성장하는
								<br />
								<span className="gradient-text">개발자 커뮤니티</span>
							</motion.h2>
							<motion.p
								variants={fadeInUp}
								className="mt-6 text-lg text-text-secondary leading-relaxed"
							>
								Sub Board는 개발자들이 지식을 공유하고 함께 성장하는 공간입니다.
								코드 스니펫부터 기술 블로그, 프로젝트 경험담까지 다양한 주제로
								소통할 수 있어요.
							</motion.p>
							<motion.ul variants={staggerContainer} className="mt-8 space-y-4">
								{[
									{
										id: "tech-stack",
										text: "Next.js 15와 React Query로 구현한 최신 아키텍처",
									},
									{
										id: "design",
										text: "글래스모피즘 디자인과 부드러운 애니메이션",
									},
									{
										id: "rendering",
										text: "SSR/CSR 하이브리드 렌더링으로 빠른 로딩 속도",
									},
								].map((item) => (
									<motion.li
										key={item.id}
										variants={fadeInUp}
										className="flex items-start gap-3"
									>
										<span className="mt-1 text-brand text-xl">✓</span>
										<span className="text-text-secondary">{item.text}</span>
									</motion.li>
								))}
							</motion.ul>
						</motion.div>
						<motion.div
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, amount: 0.3 }}
							variants={staggerContainer}
							className="grid gap-4"
						>
							{[
								{
									id: "clear-goal",
									emoji: "🎯",
									title: "명확한 목표",
									desc: "지식 공유와 성장을 최우선으로 하는 커뮤니티",
								},
								{
									id: "respect-culture",
									emoji: "🤝",
									title: "존중하는 문화",
									desc: "건설적인 피드백과 따뜻한 응원이 함께하는 공간",
								},
								{
									id: "continuous-growth",
									emoji: "🚀",
									title: "지속적 발전",
									desc: "피드백을 반영하여 계속 진화하는 플랫폼",
								},
							].map((value) => (
								<motion.div
									key={value.id}
									variants={scaleIn}
									whileHover={{ scale: 1.02, x: 8 }}
									transition={{ duration: 0.3, ease: "easeOut" }}
									className="surface-card p-6 cursor-default"
								>
									<div className="text-2xl mb-2">{value.emoji}</div>
									<h4 className="font-semibold text-text-primary">
										{value.title}
									</h4>
									<p className="mt-2 text-sm text-text-secondary">
										{value.desc}
									</p>
								</motion.div>
							))}
						</motion.div>
					</div>
				</div>
			</AnimatedSection>

			{/* Testimonials Section */}
			<AnimatedSection className="section-lavender py-24">
				<div className="container mx-auto max-w-6xl px-6">
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.3 }}
						variants={fadeInUp}
						className="text-center mb-16"
					>
						<h2 className="text-4xl font-bold text-text-primary sm:text-5xl">
							<span className="gradient-text">커뮤니티 멤버</span>들의 이야기
						</h2>
					</motion.div>
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.3 }}
						variants={staggerContainer}
						className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
					>
						{[
							{
								id: "testimonial-junsu",
								text: "실시간 알림 기능 덕분에 내 글에 달린 댓글을 바로 확인할 수 있어서 정말 편리해요. 소통이 훨씬 활발해졌습니다!",
								author: "준수",
								role: "프론트엔드 개발자",
								initial: "J",
								gradient: "from-brand to-accent-cyan",
							},
							{
								id: "testimonial-minji",
								text: "태그 시스템이 정말 유용해요. 관심 있는 주제만 모아서 볼 수 있어서 시간을 효율적으로 사용할 수 있습니다.",
								author: "민지",
								role: "백엔드 개발자",
								initial: "M",
								gradient: "from-accent-cyan to-brand",
							},
							{
								id: "testimonial-hyunwoo",
								text: "UI가 정말 아름답고 사용하기 편해요. 글 작성하는 게 즐거워졌어요. 디자인과 성능 모두 만족스럽습니다!",
								author: "현우",
								role: "풀스택 개발자",
								initial: "H",
								gradient: "from-brand to-accent-pink",
							},
						].map((testimonial) => (
							<motion.div
								key={testimonial.id}
								variants={scaleIn}
								whileHover={{ y: -6, scale: 1.02 }}
								transition={{ duration: 0.3, ease: "easeOut" }}
								className="testimonial-card cursor-default"
							>
								<p className="text-text-secondary italic">
									"{testimonial.text}"
								</p>
								<div className="mt-4 flex items-center gap-3">
									<motion.div
										whileHover={{ scale: 1.1, rotate: 360 }}
										transition={{ duration: 0.6, ease: "easeInOut" }}
										className={`h-10 w-10 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-semibold`}
									>
										{testimonial.initial}
									</motion.div>
									<div>
										<p className="font-semibold text-text-primary">
											{testimonial.author}
										</p>
										<p className="text-xs text-text-subtle">
											{testimonial.role}
										</p>
									</div>
								</div>
							</motion.div>
						))}
					</motion.div>
				</div>
			</AnimatedSection>

			{/* CTA Section */}
			<AnimatedSection className="section-vanilla py-24">
				<div className="container mx-auto max-w-4xl px-6 text-center">
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.3 }}
						variants={staggerContainer}
					>
						<motion.h2
							variants={fadeInUp}
							className="text-4xl font-bold text-text-primary sm:text-5xl"
						>
							지금 바로 <span className="gradient-text">시작하세요</span>
						</motion.h2>
						<motion.p
							variants={fadeInUp}
							className="mt-6 text-lg text-text-secondary"
						>
							Sub Board와 함께 지식을 공유하고 성장하는 여정을 시작해보세요.
							<br />
							가입은 무료이며, 몇 초면 완료됩니다.
						</motion.p>
						<motion.div
							variants={fadeInUp}
							className="mt-10 flex flex-wrap justify-center gap-4"
						>
							{hasHydrated ? (
								<motion.div
									whileHover={{ scale: 1.01 }}
									whileTap={{ scale: 0.95 }}
								>
									<Link
										href="/register"
										className="btn-gradient text-base px-8 py-3"
									>
										회원가입하고 시작하기
									</Link>
								</motion.div>
							) : (
								<span
									className="btn-gradient text-base px-8 py-3 invisible pointer-events-none select-none"
									aria-hidden="true"
								>
									회원가입하고 시작하기
								</span>
							)}
							<motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.95 }}>
								<Link
									href="/posts"
									className="btn-outline text-base px-8 py-3"
								>
									게시글 먼저 둘러보기
								</Link>
							</motion.div>
						</motion.div>
					</motion.div>
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.3 }}
						variants={scaleIn}
						whileHover={{ scale: 1.01 }}
						transition={{ duration: 0.3, ease: "easeOut" }}
						className="mt-16 surface-card p-8 cursor-default"
					>
						<div className="grid gap-8 sm:grid-cols-3">
							{[
								{
									id: "free",
									label: "Free",
									desc: "완전 무료로 제공되는 서비스",
								},
								{ id: "open", label: "Open", desc: "모두에게 열린 커뮤니티" },
								{
									id: "modern",
									label: "Modern",
									desc: "최신 웹 기술로 구현",
								},
							].map((item) => (
								<motion.div
									key={item.id}
									whileHover={{ y: -4 }}
									transition={{ duration: 0.3, ease: "easeOut" }}
								>
									<div className="text-3xl font-bold text-brand">
										{item.label}
									</div>
									<p className="mt-2 text-sm text-text-secondary">
										{item.desc}
									</p>
								</motion.div>
							))}
						</div>
					</motion.div>
				</div>
			</AnimatedSection>
		</div>
	);
}
