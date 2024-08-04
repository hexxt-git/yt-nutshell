import {Client, GatewayIntentBits} from 'discord.js';
import {renderVideoOnServer} from './video/renderVideo';
import fs from 'fs/promises';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

const prefix = '#'; // Change this to your desired prefix

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
	if (message.author.bot) return; // Ignore messages from bots
	if (!message.content.startsWith(prefix)) return; // Ignore messages without the prefix

	const args: string[] = message.content
		.slice(prefix.length)
		.trim()
		.split(/ +/);
	const command = args.shift()?.toLowerCase();

	// Example command: ping
	if (command === 'ping') {
		message.reply('Pong!');
	}

	// Example command: nuts
	if (command === 'nuts') {
		console.log(message.content);
		const id = args.join('').split('=').at(-1) ?? '';
		await renderVideoOnServer(id);
		const videoPath = `./out/${id}.mp4`;

		try {
			await fs.stat(videoPath); // Check if the video file exists

			// Upload the video to Discord
			message.reply({
				content: 'Here is your summary:',
				files: [videoPath],
			});
		} catch (error) {
			console.error('Error uploading video:', error);
			message.reply("That didn't work. Try again.");
		}
	}
});

// Replace with your actual bot token
client.login(process.env.discordapi);
