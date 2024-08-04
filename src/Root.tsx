import {Composition} from 'remotion';
import {MyComposition} from './MyComposition';
import './style.css';
import axios from 'axios';
import React from 'react';

type Message = {
	username: string;
	paragraph: string;
	date: Date;
	startFrame: number;
	endFrame: number;
};

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="MyComp"
				component={MyComposition}
				durationInFrames={1500}
				fps={30}
				width={1280}
				height={720}
				defaultProps={{
					messagesData: null, // Initial value
				}}
				calculateMetadata={async ({props}) => {
					try {
						const {data} = await axios.get('http://localhost:5555/', {
							params: {
								url: 'https://www.youtube.com/watch?v=7a-J7x_sGvU',
							},
							timeout: 100e4,
						});

						const formattedMessages: Message[] = data.map(
							(msg: string, index: number) => ({
								username: 'timeSaver832',
								paragraph: msg,
								date: new Date(),
								startFrame: index * 100, // Example frame intervals
								endFrame: (index + 1) * 100 - 1,
							}),
						);

						return {
							props: {
								...props,
								messagesData: formattedMessages,
							},
						};
					} catch (error) {
						console.error('Error fetching messages:', error);
						// Handle the error appropriately, maybe return a default value
						return {
							props: {
								...props,
								messagesData: [],
							},
						};
					}
				}}
			/>
		</>
	);
};
