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
	messagesData: Message[];
};

const Composition: React.FC<MessagesProps> = ({messagesData}) => {
	const frame = useCurrentFrame();

	if (messagesData === null) {
		// This should never happen if metadata is calculated correctly
		throw new Error('Messages data not available');
	}

	const currentMessage = messagesData.find(
		(message) => frame >= message.startFrame && frame <= message.endFrame,
	);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#282b30',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			{currentMessage && (
				<>
					{/* {currentMessage.endFrame - currentMessage.startFrame} */}
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

export {Composition as default};
