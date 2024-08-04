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
			<div className="bg-[#424549] pt-4 pl-5 pb-6 pr-8 w-fit max-w-full rounded-sm">
				<div className="flex items-start space-x-5">
					<Img
						src={UserAvatar}
						alt="User Avatar"
						className="w-16 h-16 mt-3 rounded-full shadow-md"
					/>
					<div className="flex-1">
						<h3 className="text-white font-medium -mb-1">
							{username}
							<span className="ml-2 text-gray-400 font-thin text-[0.7em]">
								{formatTime(date)}
							</span>
						</h3>
						<p className="text-gray-100 font-thin leading-[1.2em]">
							{paragraph}
						</p>
					</div>
				</div>
			</div>
		</>
	);
};
