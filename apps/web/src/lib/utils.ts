/**
 * 클래스명을 조건부로 결합하는 유틸리티 함수
 * Tailwind CSS 클래스를 동적으로 조합할 때 사용
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
	return classes.filter(Boolean).join(" ");
}
