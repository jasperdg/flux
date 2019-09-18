export function toDollars(num) {
	return (num / 10 ** 10).toFixed(2);
}

export function fromDollars(num) {
	return (num * 10 ** 10);
}