import {Composition, getInputProps} from 'remotion';
import Messages from './Composition';
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

const averageWPS = 4.5;
const fps = 30;

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="Root"
				component={Messages}
				// We'll calculate durationInFrames dynamically in calculateMetadata
				durationInFrames={1} // Temporary placeholder
				fps={fps}
				width={1280}
				height={720}
				defaultProps={{
					messagesData: [], // Initial value
				}}
				calculateMetadata={async ({props}) => {
					try {
						const {url} = getInputProps();
						const {data} = await axios.get('http://localhost:5555/', {
							params: {
								url,
							},
							timeout: 100e4,
						});

						let currentStartFrame = 0;
						const formattedMessages: Message[] = data.map((msg: string) => {
							const words = msg.split(' ').length;
							const durationInSeconds = words / averageWPS + 1;
							const durationInFrames = durationInSeconds * fps;
							const startFrame = currentStartFrame;
							const endFrame = startFrame + durationInFrames - 1;

							currentStartFrame = endFrame + 1;

							return {
								username: 'TimeSaver832',
								paragraph: msg,
								date: new Date(),
								startFrame,
								endFrame,
							};
						});

						// Calculate total duration
						const totalDurationInFrames = Math.ceil(
							formattedMessages.reduce((total, message) => {
								return total + (message.endFrame - message.startFrame + 1);
							}, 0),
						);

						return {
							props: {
								...props,
								messagesData: formattedMessages,
							},
							durationInFrames: totalDurationInFrames, // Set dynamic duration
						};
					} catch (error) {
						console.error('Error fetching messages:', error);
						// Handle the error appropriately, maybe return a default value
						return {
							props: {
								...props,
								messagesData: [],
							},
							durationInFrames: 1, // Default duration if error
						};
					}
				}}
			/>
		</>
	);
};
