"use client";

import type { AuthResponse } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/state/auth-store";
import { fetchUserStats, type UserStats } from "@/features/users/api";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { forwardRef, useRef } from "react";

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

// Reusable animated section component - forwardRef로 변경
const AnimatedSection = forwardRef<
	HTMLElement,
	{
		children: React.ReactNode;
		className?: string;
	}
>(({ children, className = "" }, ref) => {
	return (
		<section ref={ref} className={className}>
			{children}
		</section>
	);
});
AnimatedSection.displayName = "AnimatedSection";

export function HomePageClient({ initialUser, initialStats }: Props) {
	const user = useAuthStore((state) => state.user);
	const hasHydrated = useAuthStore((state) => state.hasHydrated);
	const shouldShowLanding = !(hasHydrated && user);

	const { data: userStats, isLoading: isStatsLoading } = useQuery({
		queryKey: ["user-stats", user?.id],
		queryFn: fetchUserStats,
		enabled: Boolean(hasHydrated && user?.id),
		initialData:
			initialUser && initialUser.id === user?.id
				? (initialStats ?? undefined)
				: undefined,
		staleTime: 60_000,
	});

	const heroRef = useRef<HTMLElement | null>(null);
	const { scrollYProgress } = useScroll({
		target: shouldShowLanding ? heroRef : undefined,
		offset: ["start start", "end start"],
	});

	const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
	const heroOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);

	// Features 섹션용 스크롤 진행도
	const featuresRef = useRef<HTMLElement | null>(null);
	const { scrollYProgress: featuresProgress } = useScroll({
		target: shouldShowLanding ? featuresRef : undefined,
		offset: ["start end", "end start"],
	});

	const featuresY = useTransform(featuresProgress, [0, 0.5, 1], [50, 0, -50]);
	const featuresOpacity = useTransform(
		featuresProgress,
		[0, 0.3, 0.7, 1],
		[0, 1, 1, 0],
	);

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
									맞춤 태그로 큐레이션된 최신 게시글을 살펴보고, 영감이 떠오를
									때 바로 새 글을 발행해 보세요.
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
							<motion.div variants={scaleIn} className="feature-card">
								<p className="text-sm font-bold uppercase tracking-wide text-brand">
									내 활동
								</p>
								<p className="mt-4 text-3xl font-bold text-text-primary">
									{isStatsLoading ? (
										<span
											className="inline-block h-8 w-24 animate-pulse rounded bg-border-muted"
											role="status"
											aria-label="통계 로딩 중"
										/>
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

							<motion.div variants={scaleIn} className="feature-card">
								<p className="text-sm font-bold uppercase tracking-wide text-brand">
									남긴 댓글
								</p>
								<p className="mt-4 text-3xl font-bold text-text-primary">
									{isStatsLoading ? (
										<span
											className="inline-block h-8 w-24 animate-pulse rounded bg-border-muted"
											role="status"
											aria-label="통계 로딩 중"
										/>
									) : (
										`${userStats?.commentCount ?? 0}건`
									)}
								</p>
								<p className="mt-2 text-sm text-text-secondary">
									토론에 남긴 발자취를 확인해 보세요.
								</p>
							</motion.div>

							<motion.div variants={scaleIn} className="feature-card">
								<p className="text-sm font-bold uppercase tracking-wide text-brand">
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
													href={`/posts?tag=${encodeURIComponent(tag.name)}`}
													className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-brand/10 to-accent-cyan/10 border border-brand/20 px-2.5 py-1 text-xs font-semibold text-brand transition hover:from-brand/20 hover:to-accent-cyan/20 hover:border-brand/40"
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

				{/* 날아다니는 장식 요소들 - KOTA 스타일 */}
				<div className="pointer-events-none absolute inset-0 z-0">
					<div className="float-slow absolute left-[10%] top-[20%] h-20 w-20 rounded-2xl bg-gradient-to-br from-brand/20 to-accent-cyan/20 backdrop-blur-sm" />
					<div className="float-diagonal absolute right-[15%] top-[35%] h-24 w-24 rounded-full bg-gradient-to-br from-accent-pink/20 to-brand/20 backdrop-blur-sm" />
					<div className="float-gentle absolute left-[70%] top-[15%] h-16 w-16 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-pink/20 backdrop-blur-sm" />
					<div
						className="float-slow absolute right-[25%] bottom-[25%] h-14 w-14 rounded-full bg-gradient-to-br from-brand/15 to-accent-pink/15 backdrop-blur-sm"
						style={{ animationDelay: "1s" }}
					/>
					<div
						className="float-diagonal absolute left-[20%] bottom-[30%] h-18 w-18 rounded-2xl bg-gradient-to-br from-accent-cyan/15 to-brand/15 backdrop-blur-sm"
						style={{ animationDelay: "2s" }}
					/>
				</div>

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
							Real-time Learning Board
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
							실시간 알림과 즉각적인 피드백으로 살아있는 커뮤니티를 경험하세요.
							<br />
							Next.js 15, React Query, SSE로 구현한 타임라인 피드입니다.
						</motion.p>
						<motion.div
							variants={fadeInUp}
							className="mt-10 flex flex-wrap justify-center gap-4"
						>
							<motion.div whileTap={{ scale: 0.95 }}>
								<Link
									href="/posts"
									className="btn-gradient text-base px-8 py-3"
								>
									라이브 피드 보기
								</Link>
							</motion.div>
							{hasHydrated ? (
								<motion.div whileTap={{ scale: 0.95 }}>
									<Link
										href="/login"
										className="btn-outline text-base px-8 py-3"
									>
										시작하기
									</Link>
								</motion.div>
							) : (
								<span
									className="btn-outline text-base px-8 py-3 invisible pointer-events-none select-none"
									aria-hidden="true"
								>
									시작하기
								</span>
							)}
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Features Section */}
			<AnimatedSection
				ref={featuresRef}
				className="section-lime py-24 relative overflow-hidden"
			>
				{/* 스크롤에 따라 움직이는 배경 장식 */}
				<motion.div
					style={{ y: featuresY, opacity: featuresOpacity }}
					className="pointer-events-none absolute right-[10%] top-[10%] h-32 w-32 rounded-full bg-gradient-to-br from-accent-cyan/20 to-brand/15 blur-[60px]"
				/>
				<motion.div
					style={{ y: featuresY, opacity: featuresOpacity }}
					className="pointer-events-none absolute left-[5%] bottom-[15%] h-40 w-40 rounded-full bg-gradient-to-br from-brand/15 to-accent-pink/20 blur-[70px]"
				/>
				<div className="container mx-auto max-w-6xl px-6">
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.3 }}
						variants={fadeInUp}
						className="text-center"
					>
						<h2 className="text-4xl font-bold text-text-primary sm:text-5xl">
							<span className="gradient-text">실시간 커뮤니티</span>를 위한 기술
						</h2>
						<p className="mt-6 text-lg text-text-secondary">
							즉각적인 피드백과 부드러운 사용 경험
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
								desc: "SSE로 구현한 서버 푸시 알림. 새 글과 댓글이 등록되면 즉시 확인할 수 있어요.",
							},
							{
								id: "timeline-feed",
								emoji: "📍",
								title: "타임라인 피드",
								desc: "시간 순서로 배열된 학습 기록. NEW 배지로 최신 글을 한눈에 파악하세요.",
							},
							{
								id: "react-query",
								emoji: "🔄",
								title: "자동 캐시 무효화",
								desc: "React Query로 데이터 변경 시 자동으로 최신 상태를 반영합니다.",
							},
							{
								id: "tag-curation",
								emoji: "🏷️",
								title: "태그 큐레이션",
								desc: "사이드바에서 주제별로 필터링. 관심 있는 학습 내용만 모아 보세요.",
							},
							{
								id: "optimistic-ui",
								emoji: "🚀",
								title: "낙관적 업데이트",
								desc: "글 작성 시 즉시 화면에 반영. 기다림 없는 빠른 경험을 제공합니다.",
							},
							{
								id: "ssr-hydration",
								emoji: "⚙️",
								title: "SSR + CSR 하이브리드",
								desc: "서버 렌더링으로 빠른 초기 로딩, 클라이언트 렌더링으로 부드러운 인터랙션.",
							},
						].map((feature) => (
							<motion.div
								key={feature.id}
								variants={scaleIn}
								className="feature-card cursor-default"
							>
								<motion.div
									className="text-4xl mb-4"
									whileHover={{ scale: 1.1, rotate: 8 }}
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
								실시간으로 연결되는
								<br />
								<span className="gradient-text">학습 커뮤니티</span>
							</motion.h2>
							<motion.p
								variants={fadeInUp}
								className="mt-6 text-lg text-text-secondary leading-relaxed"
							>
								Sub Board는 배움을 기록하고 공유하는 실시간 플랫폼입니다. 새
								글이 올라오면 바로 알림을 받고, 댓글로 즉각 피드백을 나눌 수
								있어요.
							</motion.p>
							<motion.ul variants={staggerContainer} className="mt-8 space-y-4">
								{[
									{
										id: "tech-stack",
										text: "Next.js 15 App Router + React Query로 구현한 현대적 아키텍처",
									},
									{
										id: "realtime",
										text: "SSE (Server-Sent Events) 기반 실시간 알림 시스템",
									},
									{
										id: "ux",
										text: "타임라인 UI와 낙관적 업데이트로 즉각적인 사용자 경험",
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
									id: "realtime-notifications",
									emoji: "🔔",
									title: "실시간 알림",
									desc: "SSE로 새 글과 댓글을 즉시 확인할 수 있어요",
								},
								{
									id: "instant-feedback",
									emoji: "⚡",
									title: "즉각적인 피드백",
									desc: "작성한 글에 바로 반응을 받고 토론할 수 있어요",
								},
								{
									id: "timeline-ui",
									emoji: "📍",
									title: "타임라인 UI",
									desc: "시간 흐름에 따라 배움의 과정을 시각화합니다",
								},
							].map((value) => (
								<motion.div
									key={value.id}
									variants={scaleIn}
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
						className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
					>
						{[
							{
								id: "testimonial-hyunso",
								text: "실시간 알림 기능이 정말 신기해요. 새 글이 올라오면 바로 토스트로 알려줘서 놓치지 않고 확인할 수 있어요!",
								author: "현소",
								role: "앱 개발자",
								initial: "현",
								gradient: "from-[#0a84ff] to-[#5ac8fa]",
							},
							{
								id: "testimonial-hyungwook",
								text: "SSE로 구현한 실시간 알림 시스템이 인상적이에요. NestJS와 잘 통합되어 있어서 백엔드 관점에서도 훌륭해요.",
								author: "형욱",
								role: "백엔드 개발자",
								initial: "형",
								gradient: "from-[#0a84ff] to-[#5ac8fa]",
							},
							{
								id: "testimonial-hyungho",
								text: "글을 작성하면 즉시 화면에 반영되는 게 놀라워요. React Query의 낙관적 업데이트가 정말 매끄럽게 동작하네요!",
								author: "형호",
								role: "풀스택 개발자",
								initial: "호",
								gradient: "from-[#0a84ff] to-[#5ac8fa]",
							},
							{
								id: "testimonial-eunbi",
								text: "타임라인 UI가 직관적이에요. 시간 순서대로 글이 쌓여서 학습 과정을 한눈에 볼 수 있는 점이 마음에 들어요.",
								author: "은비",
								role: "AI 개발자",
								initial: "은",
								gradient: "from-[#0a84ff] to-[#5ac8fa]",
							},
						].map((testimonial) => (
							<motion.div
								key={testimonial.id}
								variants={scaleIn}
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
							실시간 학습 커뮤니티를{" "}
							<span className="gradient-text">경험하세요</span>
						</motion.h2>
						<motion.p
							variants={fadeInUp}
							className="mt-6 text-lg text-text-secondary"
						>
							새 글이 올라오면 즉시 알림을 받고, 댓글로 실시간 피드백을
							주고받으세요.
							<br />
							타임라인 피드에서 배움의 흐름을 한눈에 확인할 수 있어요.
						</motion.p>
						<motion.div
							variants={fadeInUp}
							className="mt-10 flex flex-wrap justify-center gap-4"
						>
							{hasHydrated ? (
								<motion.div whileTap={{ scale: 0.95 }}>
									<Link
										href="/register"
										className="btn-gradient text-base px-8 py-3"
									>
										가입하고 시작하기
									</Link>
								</motion.div>
							) : (
								<span
									className="btn-gradient text-base px-8 py-3 invisible pointer-events-none select-none"
									aria-hidden="true"
								>
									가입하고 시작하기
								</span>
							)}
							<motion.div whileTap={{ scale: 0.95 }}>
								<Link href="/posts" className="btn-outline text-base px-8 py-3">
									라이브 피드 둘러보기
								</Link>
							</motion.div>
						</motion.div>
					</motion.div>
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.3 }}
						variants={scaleIn}
						className="mt-16 surface-card p-8 cursor-default"
					>
						<div className="grid gap-8 sm:grid-cols-3">
							{[
								{
									id: "realtime",
									label: "Real-time",
									desc: "SSE 기반 실시간 알림",
								},
								{ id: "reactive", label: "Reactive", desc: "즉각적인 UI 반응" },
								{
									id: "modern",
									label: "Modern",
									desc: "최신 웹 기술 스택",
								},
							].map((item) => (
								<motion.div key={item.id}>
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
