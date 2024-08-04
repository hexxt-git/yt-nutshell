import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'path';

export async function renderVideoOnServer(url: string) {
	const id = url.split('=').at(-1);
	console.log('started job', {url: id});

	// Bundle your video
	const bundled = await bundle(path.resolve('video/index.ts'));

	// Retrieve your composition
	const composition = await selectComposition({
		serveUrl: bundled,
		id: 'Root',
		inputProps: {url},
	});

	if (!composition) {
		throw new Error('Could not find composition with id Root');
	}

	const outputLocation = process.cwd().includes('video')
		? `../out/${id}.mp4`
		: `./out/${id}.mp4`;

	// Create a timeout promise
	const timeoutPromise = new Promise(
		(_, reject) =>
			setTimeout(() => reject(new Error('Render timed out')), 5 * 60 * 1000), // 5 minutes
	);

	// Render the video with timeout
	try {
		await Promise.race([
			renderMedia({
				composition,
				serveUrl: bundled,
				codec: 'h264',
				outputLocation,
			}),
			timeoutPromise,
		]);
		console.log('finished job', {url: id});
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
}

// Call the rendering function
// renderVideoOnServer('YKPGvzY_v6A').catch(console.error);
