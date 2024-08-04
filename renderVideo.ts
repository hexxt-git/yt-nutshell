import {bundle} from '@remotion/bundler';
import {getCompositions, renderMedia} from '@remotion/renderer';
import path from 'path';
import axios from 'axios';

async function renderVideoOnServer() {
	// Bundle your video
	const bundled = await bundle(path.resolve('./src/index.ts'));

	// Retrieve your composition
	const compositions = await getCompositions(bundled);
	const composition = compositions.find((c) => c.id === 'MyComp');

	if (!composition) {
		throw new Error('Could not find composition with id MyComp');
	}

	// Fetch data (similar to your calculateMetadata function)
	const fetchData = async () => {
		try {
			const {data} = await axios.get('http://localhost:5555/', {
				params: {
					url: 'https://www.youtube.com/watch?v=Lrx55AlJ-Uo',
				},
				timeout: 100e4,
			});

			const averageWPS = 4.5;
			const fps = 30;

			let currentStartFrame = 0;
			return data.map((msg: string) => {
				const words = msg.split(' ').length;
				const durationInSeconds = words / averageWPS + 1;
				const durationInFrames = durationInSeconds * fps;
				const startFrame = currentStartFrame;
				const endFrame = startFrame + durationInFrames - 1;

				currentStartFrame = endFrame + 1;

				return {
					username: 'timeSaver832',
					paragraph: msg,
					date: new Date(),
					startFrame,
					endFrame,
				};
			});
		} catch (error) {
			console.error('Error fetching messages:', error);
			return [];
		}
	};

	const messagesData = await fetchData();

	// Calculate total duration in frames
	const totalDurationInFrames = messagesData.reduce(
		(total: number, message: any) => {
			return total + (message.endFrame - message.startFrame + 1);
		},
		0,
	);

	// Render the video
	await renderMedia({
		composition,
		serveUrl: bundled,
		codec: 'h264',
		outputLocation: './out/video.mp4',
	});

	console.log('Video rendered successfully!');
}

// Call the rendering function
renderVideoOnServer().catch(console.error);
