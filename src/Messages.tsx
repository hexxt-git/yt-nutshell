import {Audio, Sequence} from 'remotion';
import ping from './static/ping.mp3';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {MessageBox} from './MessageBox';
import React from 'react';

type Message = {
	username: string;
	paragraph: string;
	date: Date;
	startFrame: number;
	endFrame: number;
};

type MessagesProps = {
	messagesData: Message[] | null;
};

export const Messages: React.FC<MessagesProps> = ({messagesData}) => {
	const frame = useCurrentFrame();

	if (messagesData === null) {
		// This should never happen if metadata is calculated correctly
		throw new Error('Messages data not available');
	}

	const currentMessage = messagesData.find(
		(message) => frame >= message.startFrame && frame <= message.endFrame,
	);

	return (
		<AbsoluteFill className="bg-[#282b30] flex items-center justify-center text-[30px]">
			{currentMessage && (
				<>
					<MessageBox
						username={currentMessage.username}
						paragraph={currentMessage.paragraph}
						date={currentMessage.date}
					/>
					<Sequence from={currentMessage.startFrame}>
						<Audio src={ping} />
					</Sequence>
				</>
			)}
		</AbsoluteFill>
	);
};
