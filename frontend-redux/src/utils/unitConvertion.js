export const toDollars = (num) => {
	return `$${(num / 10 ** 6).toFixed(2)}`
}

export const toEarnings = (order) => {
	const { spend, odds } = order;
	return spend / odds * 100;
}