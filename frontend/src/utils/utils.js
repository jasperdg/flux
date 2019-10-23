export function toDollars(num) {
	return (num / 10 ** 10).toFixed(2);
}

export function fromDollars(num) {
	return (num * 10 ** 10);
}

export const validateEmail = (email) => { 
	const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}