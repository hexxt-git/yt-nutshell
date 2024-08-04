import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'path';

export async function renderVideoOnServer(url: string) {
	console.log('rendering...', {url});
	// Bundle your video
	const bundled = await bundle(path.resolve('./video/index.ts'));

	// Retrieve your composition
	const composition = await selectComposition({
		serveUrl: bundled,
		id: 'Root',
		inputProps: {url},
	});

	if (!composition) {
		throw new Error('Could not find composition with id Root');
	}

	// Render the video
	await renderMedia({
		composition,
		serveUrl: bundled,
		codec: 'h264',
		outputLocation: `./out/${url.split('=').at(-1)}.mp4`,
	});

	console.log('Video rendered successfully!');
}

// Call the rendering function
// renderVideoOnServer('YKPGvzY_v6A').catch(console.error);
