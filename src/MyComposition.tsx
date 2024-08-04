import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Messages} from './Messages';

type MyCompositionProps = {
	messagesData: Message[] | null;
};

export const MyComposition: React.FC<MyCompositionProps> = ({messagesData}) => {
	return (
		<AbsoluteFill className="bg-[#282b30]">
			<Messages messagesData={messagesData} />
		</AbsoluteFill>
	);
};