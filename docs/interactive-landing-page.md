# 인터랙티브 랜딩페이지 구현

KOTA (https://kota.co.uk/) 스타일의 동적이고 인터랙티브한 랜딩페이지 구현

## 구현 날짜
2025-10-22

## 개요

메인페이지를 Framer Motion을 활용한 스크롤 기반 인터랙티브 랜딩페이지로 전면 개편했습니다.
스크롤할 때마다 요소들이 부드럽게 등장하고, 스크롤을 올렸다 내릴 때마다 애니메이션이 반복됩니다.

## 주요 변경사항

### 1. Framer Motion 설치

```bash
npm install framer-motion
```

### 2. 반복 애니메이션 설정

**모든 스크롤 트리거 애니메이션이 반복됨:**
- `once: false` - 스크롤할 때마다 애니메이션 재생
- 스크롤을 올렸다가 다시 내리면 애니메이션이 다시 실행됨

**Before (한 번만 재생):**
```tsx
const isInView = useInView(ref, { once: true, amount: 0.2 });
viewport={{ once: true, amount: 0.2 }}
```

**After (반복 재생):**
```tsx
const isInView = useInView(ref, { once: false, amount: 0.2 });
viewport={{ once: false, amount: 0.2 }}
```

### 3. TypeScript 타입 수정

**ease 배열 타입 에러 해결:**
```tsx
// Before (타입 에러)
transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }

// After (as const 추가)
transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }
```

## 핵심 애니메이션 기능

### 1. 반복 스크롤 트리거
```tsx
const isInView = useInView(ref, { 
  once: false,  // 매번 애니메이션 재생
  amount: 0.2   // 요소의 20%가 보이면 트리거
});
```

### 2. 패럴랙스 효과
```tsx
const { scrollYProgress } = useScroll({
  target: heroRef,
  offset: ["start start", "end start"],
});

const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
const heroOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);
```

### 3. 인터랙티브 호버
```tsx
<motion.div
  whileHover={{ scale: 1.05, y: -8 }}
  whileTap={{ scale: 0.95 }}
>
```

## 섹션별 애니메이션

### 비로그인 사용자 (5개 섹션)

1. **Hero Section** - 패럴랙스 배경 + 스태거드 텍스트
2. **Features Section (Lime)** - 6개 기능 카드 순차 등장
3. **Community Section (Sky)** - 2열 레이아웃
4. **Testimonials Section (Lavender)** - 3개 후기 카드
5. **CTA Section (Vanilla)** - 최종 행동 유도

### 로그인 사용자 (3개 섹션)

1. **Welcome Hero (Sky)** - 개인화 메시지
2. **User Stats (Lime)** - 활동 통계
3. **Quick Actions (Lavender)** - 빠른 작업 카드

## 사용자 경험 개선

### 반복 애니메이션의 장점
- **몰입감 증가**: 스크롤할 때마다 생동감 있는 효과
- **탐색 유도**: 다시 볼 때도 시각적 흥미 유지
- **브랜드 일관성**: KOTA 사이트와 동일한 UX 패턴

### 주의사항
- 과도한 애니메이션은 성능 저하 가능
- `amount: 0.2`로 부드러운 트리거
- GPU 가속 속성 사용 (transform, opacity)

## 파일 변경 내역

### 수정된 파일
- `apps/web/src/app/(main)/home-page-client.tsx` - 메인 컴포넌트
- `apps/web/src/styles/globals.css` - 색상 섹션 스타일
- `apps/web/package.json` - framer-motion 추가

## 브라우저 호환성

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 참고 자료

- **디자인 영감**: https://kota.co.uk/
- **Framer Motion**: https://www.framer.com/motion/
- **Scroll Animations**: https://www.framer.com/motion/scroll-animations/
