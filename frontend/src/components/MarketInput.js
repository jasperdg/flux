import React from 'react';
import TextField, {Input} from '@material/react-text-field';

const marketInput = ({onChange, value, label}) => {

	return (	
		<TextField 
			className="material-input"
			label={label}
			margin="normal"
			leadingIcon={(<div>$</div>)}
		>
		<Input  
			value={value}
			onClick={e => e.target.focus()}
			onChange={onChange}
		/>
		</TextField>
	);
}

export default marketInput;