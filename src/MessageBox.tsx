// import {random} from 'remotion';
import UserAvatar from './static/car.png';
import {Img} from 'remotion';
import React from 'react';

type MessageBoxProps = {
	username: string;
	paragraph: string;
	date: Date;
};

const formatTime = (date: Date) => {
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = date.getFullYear();

	let hours = date.getHours();
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const ampm = hours >= 12 ? 'PM' : 'AM';

	hours %= 12;
	hours = hours || 12; // The hour '0' should be '12'
	const formattedHours = String(hours).padStart(2, '0');

	return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
};

export const MessageBox: React.FC<MessageBoxProps> = ({
	username,
	paragraph,
	date,
}) => {
	return (
		<>
			<div
				style={{
					backgroundColor: '#424549',
					margin: '1rem',
					paddingTop: '1rem',
					paddingLeft: '1.25rem',
					paddingBottom: '1.5rem',
					paddingRight: '2rem',
					width: 'fit-content',
					maxWidth: '100%',
					borderRadius: '0.25rem',
					fontSize: '30px',
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'flex-start',
						gap: '1.25rem',
					}}
				>
					<Img
						src={UserAvatar}
						alt="User Avatar"
						style={{
							width: '5rem',
							height: '5rem',
							borderRadius: '1000px',
							boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
						}}
					/>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<h3
							style={{
								fontSize: '1em',
								fontWeight: 500,
								margin: 0,
								color: 'orange',
							}}
						>
							{username}
							<span
								style={{
									marginLeft: '1rem',
									color: 'rgba(255, 255, 255, 0.4)',
									fontWeight: 100,
									fontSize: '0.75em',
								}}
							>
								{formatTime(date)}
							</span>
						</h3>
						<p
							style={{
								margin: 0,
								color: 'rgba(255, 255, 255, 0.8)',
								fontWeight: 100,
								lineHeight: '1.2em',
							}}
						>
							{paragraph}
						</p>
					</div>
				</div>
			</div>
		</>
	);
};
