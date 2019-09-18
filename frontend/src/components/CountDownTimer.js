import React from 'react';
export default function CountDownTimer({ days, hours, minutes, seconds, completed }) {
	if (completed) {
	  // Render a completed state
	  return <span className="timer done">Completed</span>;
	} else {
	  // Render a countdown
	  return <span className="timer">{days} days {hours < 10 ? "0" + hours : hours}:{minutes < 10 ? "0" + minutes : minutes }:{seconds < 10 ? "0" + seconds : seconds}</span>;
	}
};