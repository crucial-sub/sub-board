const numberFormatter = new Intl.NumberFormat("ko-KR");

function pad(value: number) {
	return String(value).padStart(2, "0");
}

export function formatKoreanDate(dateInput: string): string {
	const date = new Date(dateInput);
	if (Number.isNaN(date.getTime())) {
		return dateInput;
	}
	return `${date.getFullYear()}. ${pad(date.getMonth() + 1)}. ${pad(date.getDate())}.`;
}

export function formatKoreanDateTime(dateInput: string): string {
	const date = new Date(dateInput);
	if (Number.isNaN(date.getTime())) {
		return dateInput;
	}
	return `${date.getFullYear()}. ${pad(date.getMonth() + 1)}. ${pad(
		date.getDate(),
	)}. ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatNumber(value: number): string {
	return numberFormatter.format(value);
}
