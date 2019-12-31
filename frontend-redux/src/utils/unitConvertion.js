export const toDollars = (num) => {
	return `$${(num / 10 ** 6).toFixed(2)}`
}

export const toEarnings = (order) => {
	const { spend, odds } = order;
	return spend / odds * 100;
}

export const fromPayoutDistribution = (payoutDistribution) => {
	let result;
	switch(payoutDistribution[0]) {
		case 0:
			result = "yes";
			break;
		case 10000:
			result = "no"
			break;
		case 5000:
			result = "invalid";
			break;
	}
	return result;
}