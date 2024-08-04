import {
	Composition,
	getInputProps,
	delayRender,
	continueRender,
} from 'remotion';
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
const MAX_TIMEOUT = 2 * 60 * 1000;

const fetchWithTimeout = async (url: string, timeout: number): Promise<any> => {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await axios.get('http://localhost:5555/', {
			params: {url},
			signal: controller.signal,
		});
		clearTimeout(id);
		return response.data;
	} catch (error) {
		clearTimeout(id);
		if (axios.isCancel(error)) {
			throw new Error('Request timed out');
		}
		throw error;
	}
};

const fetchWithRetry = async (
	url: string,
	retries: number,
	delay: number,
): Promise<any> => {
	for (let attempt = 0; attempt < retries; attempt++) {
		try {
			return await fetchWithTimeout(url, 30000); // 30 second timeout per attempt
		} catch (error) {
			if (attempt < retries - 1) {
				console.error(
					`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`,
					error,
				);
				await new Promise((resolve) => setTimeout(resolve, delay));
			} else {
				throw error;
			}
		}
	}
};

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="Root"
				component={Messages}
				durationInFrames={1} // Temporary placeholder
				fps={fps}
				width={1280}
				height={720}
				defaultProps={{
					messagesData: [], // Initial value
				}}
				calculateMetadata={async ({props}) => {
					const handle = delayRender('Fetching and processing data');
					const timeoutHandle = setTimeout(() => {
						continueRender(handle);
						throw new Error('Operation timed out after ' + MAX_TIMEOUT + 'ms');
					}, MAX_TIMEOUT);

					try {
						const url = getInputProps().url ?? '0XKYMt5mGpQ';
						const data = await fetchWithRetry(url, 3, 5000);
						if (!data) {
							throw new Error('Failed to fetch data after multiple attempts');
						}

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

						const totalDurationInFrames = Math.ceil(
							formattedMessages.reduce((total, message) => {
								return total + (message.endFrame - message.startFrame + 1);
							}, 0),
						);

						clearTimeout(timeoutHandle);
						continueRender(handle);

						return {
							props: {
								...props,
								messagesData: formattedMessages,
							},
							durationInFrames: totalDurationInFrames,
						};
					} catch (error) {
						console.error('Error in calculateMetadata:', error);
						clearTimeout(timeoutHandle);
						continueRender(handle);
						return {
							props: {
								...props,
								messagesData: [
									{
										username: 'Error Handler',
										paragraph:
											'An error has occurred: ' + (error as Error).message,
										date: new Date(),
										startFrame: 0,
										endFrame: 100,
									},
								],
							},
							durationInFrames: 100,
						};
					}
				}}
			/>
		</>
	);
};
