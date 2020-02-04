import { css } from 'styled-components'

const sizes = {
	mobile: 920,
}
export default Object.keys(sizes).reduce((acc, label) => {
	acc[label] = (...args) => css`
		 @media (max-width: ${sizes[label]}px) {
				${css(...args)};
		 }
	`
	return acc
}, {})