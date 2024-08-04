import {Client, GatewayIntentBits} from 'discord.js';
import {renderVideoOnServer} from './video/renderVideo';
import fs from 'fs/promises';
import {start_transcript_server} from './transcript/server';
import {Innertube} from 'youtubei.js/web';
import { Video } from 'youtubei.js/dist/src/parser/nodes';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

const youtube_client = await Innertube.create({lang: 'en', location: 'US'});
const prefix = '#';

client.on('ready', () => {
	console.log(`Logged in as ${client.user?.tag}`);
});

client.on('messageCreate', async (message) => {
	if (message.author.bot || !message.content.startsWith(prefix)) return;

	const args: string[] = message.content
		.slice(prefix.length)
		.trim()
		.split(/ +/);
	const command = args.shift()?.toLowerCase();

	if (command === 'ping') {
		message.reply('Pong!');
	}

	if (command === 'nuts') {
		await generateVideoSummary(args.join('').split('=').pop() || '', message);
	}

	if (command === 'trending') {
		await summarizeTrendingVideo(message);
	}
});

client.login(process.env.discordapi);

try {
	start_transcript_server();
} catch (error) {
	console.error(error);
}

async function generateVideoSummary(videoId: string, message: any) {
	message.reply('Generating summary, please wait...');
	try {
		await renderVideoOnServer(videoId);
		const videoPath = `./out/${videoId}.mp4`;

		await fs.stat(videoPath);
		message.reply({content: 'Here is your summary:', files: [videoPath]});
	} catch (error) {
		console.error('Error rendering or uploading video:', error);
		message.reply("That didn't work. Please try again.");
	}
}

async function summarizeTrendingVideo(message: any) {
	try {
		const trending = await youtube_client.getTrending();
		const video: Video =
			trending.videos[Math.floor(Math.random() * trending.videos.length)];
		const videoTitle = video.title || 'Unknown Title';
		const videoId = video.id;

		message.reply(
			`**Summarizing Trending Video:** ${videoTitle}...\nhttps://youtube.com/watch?v=${videoId}`,
		);

		await generateVideoSummary(videoId, message);
	} catch (error) {
		console.error('Error fetching trending videos:', error);
		message.reply("Couldn't fetch trending videos. Please try again later.");
	}
}
