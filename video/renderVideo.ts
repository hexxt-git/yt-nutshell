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

	// Render the video
	await renderMedia({
		composition,
		serveUrl: bundled,
		codec: 'h264',
		outputLocation,
	});

	console.log('finished job', {url: id});
	return true;
}

// Call the rendering function
// renderVideoOnServer('YKPGvzY_v6A').catch(console.error);
