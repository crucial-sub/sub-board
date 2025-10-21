# 인터랙티브 랜딩페이지 구현

KOTA (https://kota.co.uk/) 스타일의 동적이고 인터랙티브한 랜딩페이지 구현

## 최종 업데이트
2025-10-22

## 개요

메인페이지를 Framer Motion과 CSS 애니메이션을 활용한 스크롤 기반 인터랙티브 랜딩페이지로 전면 개편했습니다.
KOTA 웹사이트의 특징인 날아다니는 요소, 부드러운 hover 효과, 스크롤 진행도 기반 애니메이션을 모두 구현했습니다.

## 주요 변경사항 (2025-10-22 최종 버전)

### 1. 움찔거림 문제 해결

**문제점**:
- `whileHover`에서 `scale`과 `y` 변환을 동시에 사용하면서 transition이 너무 짧음 (0.3s)
- 마우스를 올릴 때마다 카드가 불안정하게 움직임

**해결책**:
- 모든 인라인 `whileHover` 속성 제거
- CSS의 `:hover` 상태로 대체 (duration 0.5s로 증가)
- `ease-out` 타이밍 함수로 부드러운 감속 효과

**Before (움찔거림 발생):**
```tsx
<motion.div
  variants={scaleIn}
  whileHover={{ scale: 1.01, y: -2 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
  className="feature-card"
>
```

**After (부드러운 hover):**
```tsx
<motion.div
  variants={scaleIn}
  className="feature-card"  // CSS hover만 사용
>
```

```css
.feature-card {
  @apply surface-glass p-8 transition-all duration-500 ease-out;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 30px 60px -20px rgba(15, 23, 42, 0.35);
}
```

### 2. 날아다니는 장식 요소 (KOTA 스타일)

**구현 위치**: Hero 섹션 배경

**CSS Keyframe 애니메이션 3종류**:
```css
@keyframes float-slow {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

@keyframes float-diagonal {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(-15px, 30px) rotate(-10deg); }
}

@keyframes float-gentle {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(15px) rotate(-8deg); }
}
```

**적용 예시**:
```tsx
<div className="pointer-events-none absolute inset-0 z-0">
  <div className="float-slow absolute left-[10%] top-[20%] h-20 w-20
                  rounded-2xl bg-gradient-to-br from-brand/20 to-accent-cyan/20" />
  <div className="float-diagonal absolute right-[15%] top-[35%] h-24 w-24
                  rounded-full bg-gradient-to-br from-accent-pink/20 to-brand/20" />
  <div className="float-gentle absolute left-[70%] top-[15%] h-16 w-16
                  rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-pink/20" />
  {/* 각각 다른 animationDelay로 시작 시점 분산 */}
</div>
```

**특징**:
- 무한 반복 (`infinite`)
- 부드러운 가속/감속 (`ease-in-out`)
- 5개 요소가 각기 다른 속도로 움직임 (7s, 8s, 10s)
- `pointer-events-none`으로 사용자 인터랙션 방해 안 함

### 3. 스크롤 진행도 기반 애니메이션

**Hero 섹션 패럴랙스**:
```tsx
const heroRef = useRef(null);
const { scrollYProgress } = useScroll({
  target: heroRef,
  offset: ["start start", "end start"],
});

const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
const heroOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);
```

**Features 섹션 배경 장식 움직임**:
```tsx
const featuresRef = useRef(null);
const { scrollYProgress: featuresProgress } = useScroll({
  target: featuresRef,
  offset: ["start end", "end start"],
});

const featuresY = useTransform(featuresProgress, [0, 0.5, 1], [50, 0, -50]);
const featuresOpacity = useTransform(featuresProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
```

**forwardRef를 통한 ref 전달**:
```tsx
const AnimatedSection = forwardRef<HTMLElement, {...}>(
  ({ children, className }, ref) => {
    return <section ref={ref} className={className}>{children}</section>;
  }
);
```

### 4. TypeScript 타입 수정

**ease 배열 타입 에러 해결:**
```tsx
// Before (타입 에러)
transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }

// After (as const 추가)
transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }
```

## 핵심 애니메이션 기능

### 1. 부드러운 Hover 효과 (CSS 기반)

**카드 hover**:
- `duration-500` (0.5초) - 충분히 긴 시간으로 자연스러운 움직임
- `ease-out` - 감속 효과로 부드러운 정지
- `translateY(-4px)` - 위로 살짝 떠오르는 효과
- `box-shadow` 확대 - 깊이감 증가

### 2. 날아다니는 요소 (CSS Keyframe)

**3가지 패턴**:
- `float-slow`: 8초 주기, 수직 20px 움직임 + 5° 회전
- `float-diagonal`: 10초 주기, 대각선 움직임 + -10° 회전
- `float-gentle`: 7초 주기, 수직 15px 움직임 + -8° 회전

### 3. 스크롤 진행도 애니메이션 (Framer Motion)

**패럴랙스 효과**:
```tsx
const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
const heroOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);
```

**배경 장식 움직임**:
```tsx
const featuresY = useTransform(featuresProgress, [0, 0.5, 1], [50, 0, -50]);
const featuresOpacity = useTransform(featuresProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
```

### 4. 버튼 호버 (간단한 scale)
```tsx
<Link className="btn-gradient transition-transform hover:scale-105 active:scale-95">
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

### 개선 전 문제점
1. **움찔거림**: hover 시 카드가 불안정하게 떨림
2. **단조로움**: 모든 섹션이 비슷한 fadeInUp만 반복
3. **정적임**: KOTA처럼 살아있는 느낌이 없음

### 개선 후
1. **부드러운 hover**: 0.5초 duration + ease-out으로 자연스러운 움직임
2. **날아다니는 요소**: 5개 장식 요소가 각기 다른 속도로 무한 반복
3. **스크롤 진행도**: 섹션이 화면에 들어올 때 배경 장식이 함께 움직임
4. **깊이감**: hover 시 그림자 확대로 3D 효과

### 성능 최적화
- **GPU 가속**: `transform`, `opacity`만 사용 (reflow/repaint 없음)
- **CSS 애니메이션**: JavaScript보다 성능 우수
- **pointer-events-none**: 장식 요소가 클릭 방해 안 함
- **will-change 자동**: Tailwind transition 클래스가 자동 적용

## 파일 변경 내역

### 수정된 파일

1. **`apps/web/src/styles/globals.css`**
   - `.feature-card` hover 효과 개선 (duration 0.3s → 0.5s)
   - `.testimonial-card` hover 효과 개선
   - `@keyframes float-slow`, `float-diagonal`, `float-gentle` 추가
   - `.float-*` 유틸리티 클래스 추가

2. **`apps/web/src/app/(main)/home-page-client.tsx`**
   - `forwardRef` import 추가
   - `AnimatedSection`을 forwardRef로 변경
   - `featuresRef` 및 스크롤 진행도 추가
   - Hero 섹션에 5개 날아다니는 장식 요소 추가
   - Features 섹션에 스크롤 기반 배경 장식 추가
   - 모든 인라인 `whileHover` 속성 제거

3. **`apps/web/package.json`**
   - `framer-motion` 이미 설치됨 (v12.23.24)

## 브라우저 호환성

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## KOTA 웹사이트와 비교

### KOTA의 특징 (구현 완료)
✅ 날아다니는 장식 요소
✅ 스크롤에 따라 움직이는 배경
✅ 부드러운 hover 효과
✅ 패럴랙스 스크롤
✅ 파스텔 그라디언트 배경

### 추가로 구현 가능한 기능 (향후)
- 스크롤 고정(sticky) 섹션 내에서 콘텐츠 회전
- 마우스 커서 따라다니는 spotlight 효과
- 이미지 갤러리 자동 슬라이드

## 참고 자료

- **디자인 영감**: https://kota.co.uk/
- **Framer Motion 공식 문서**: https://www.framer.com/motion/
- **Scroll Animations**: https://www.framer.com/motion/scroll-animations/
- **CSS Animations**: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations
