import {
	Client,
	GatewayIntentBits,
	SlashCommandBuilder,
	REST,
	Routes,
	CommandInteraction,
	CacheType,
} from 'discord.js';
import {renderVideoOnServer} from './video/renderVideo';
import fs from 'fs/promises';
import {start_transcript_server} from './transcript/server';
import {Innertube, Video} from 'youtubei.js/web';

// Discord client initialization
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

// YouTube client initialization
let youtube_client: Innertube;

// Queue and task management
const maxConcurrentTasks = 1;
let activeTasks = 0;
const queue: QueueItem[] = [];

interface QueueItem {
	videoId: string;
	title: string;
	userName: string;
	interaction: CommandInteraction<CacheType>;
}

// Define guild ID (replace with your actual guild ID)
const guildId = process.env.DISCORD_GUILD_ID || '';

// Define and register slash commands
const commands = [
	new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	new SlashCommandBuilder()
		.setName('nuts')
		.setDescription('Generates a summary for a specific video.')
		.addStringOption((option) =>
			option
				.setName('video_url')
				.setDescription('The URL of the video')
				.setRequired(true),
		),
	new SlashCommandBuilder()
		.setName('trending')
		.setDescription('Generates a summary for a trending video.'),
	new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Displays the current video processing queue.'),
	new SlashCommandBuilder()
		.setName('search')
		.setDescription('Search for a video and generate a summary.')
		.addStringOption((option) =>
			option
				.setName('query')
				.setDescription('The search query')
				.setRequired(true),
		),
];

const rest = new REST({version: '10'}).setToken(
	process.env.discordapi as string,
);

// Function to filter videos
async function filterVideo(video: Video): Promise<boolean> {
	const durationInSeconds = video?.duration?.seconds || 0;
	return !video.is_live && durationInSeconds > 240; // 4 minutes = 240 seconds
}

// Function to extract video ID from URL
function extractVideoId(url: string): string | null {
	const regex =
		/(?:https?:\/\/)?(?:www\.)?youtube\.com\/.*v=([^&]+)|youtu\.be\/([^?]+)/;
	const match = url.match(regex);
	return match ? match[1] || match[2] : null;
}

// Function to queue video processing
function queueVideoProcessing(
	videoId: string,
	title: string,
	userName: string,
	interaction: CommandInteraction<CacheType>,
) {
	const queuePosition = queue.length + activeTasks;
	queue.push({videoId, title, userName, interaction});
	interaction.followUp({
		content: `Your request has been queued. Your current position is ${queuePosition + 1}.`,
		ephemeral: true,
	});
	processQueue();
}

// Function to process the queue
async function processQueue() {
	if (activeTasks >= maxConcurrentTasks || queue.length === 0) return;

	const {videoId, interaction} = queue.shift()!;
	activeTasks++;

	try {
		await interaction.followUp({
			content: 'Your video is now being processed. Please wait...',
			ephemeral: true,
		});
		const renderStatus = await renderVideoOnServer(videoId);
		if (!renderStatus)
			throw new Error('Failed to render video on server in time.');

		const videoPath = `./out/${videoId}.mp4`;

		try {
			await fs.stat(videoPath);
			await interaction.followUp({
				content: 'Here is your summary:',
				files: [videoPath],
				ephemeral: false,
			});
		} catch (error) {
			console.error('Error uploading video:', error);
			await interaction.followUp({
				content: "That didn't work. Please try again.",
				ephemeral: true,
			});
		}
	} catch (error) {
		console.error('Error rendering video:', error);
		await interaction.followUp({
			content:
				'There was an error processing the video. Please try again later.',
			ephemeral: true,
		});
	} finally {
		activeTasks--;
		processQueue();
		updateQueuePositions();
	}
}

// Function to update queue positions
function updateQueuePositions() {
	queue.forEach(({interaction}, index) => {
		interaction.followUp({
			content: `Your updated position in the queue is ${index + 1 + activeTasks}.`,
			ephemeral: true,
		});
	});
}

// Event listener for when the client is ready
client.on('ready', async () => {
	console.log(`Logged in as ${client.user?.tag}`);

	try {
		youtube_client = await Innertube.create({
			lang: 'en',
			location: 'US',
			retrieve_player: false,
		});

		if (guildId) {
			console.log(
				'Started refreshing guild-specific application (/) commands.',
			);

			if (!client.user) throw new Error('Client user is not available.');

			await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), {
				body: commands.map((command) => command.toJSON()),
			});

			console.log(
				'Successfully reloaded guild-specific application (/) commands.',
			);
		}
	} catch (error) {
		console.error('Error during initialization:', error);
	}
});

// Event listener for slash command interactions
client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	const {commandName, options, user} = interaction;

	switch (commandName) {
		case 'ping':
			await interaction.reply({content: 'Pong!', ephemeral: false});
			break;

		case 'nuts':
			const videoUrl = options.getString('video_url', true);
			const videoId = extractVideoId(videoUrl);
			if (!videoId) {
				await interaction.reply({
					content: 'Invalid video URL.',
					ephemeral: true,
				});
				return;
			}

			try {
				const videoInfo = await youtube_client.getInfo(videoId);
				if (!filterVideo(videoInfo as unknown as Video)) {
					await interaction.reply({
						content:
							'This video is either a live stream or shorter than 4 minutes. Please choose a different video.',
						ephemeral: true,
					});
					return;
				}

				const videoTitle = videoInfo.basic_info.title ?? 'Unknown Title';

				await interaction.reply({
					content: `**Summarizing Video:** ${videoTitle}\nhttps://youtube.com/watch?v=${videoId}`,
					ephemeral: false,
				});
				queueVideoProcessing(videoId, videoTitle, user.username, interaction);
			} catch (error) {
				console.error('Error processing video:', error);
				await interaction.reply({
					content:
						'An error occurred while processing the video. Please try again later.',
					ephemeral: true,
				});
			}
			break;

		case 'trending':
			try {
				const trending = await youtube_client.getTrending();
				const filteredVideos = trending.videos.filter(filterVideo);

				if (filteredVideos.length === 0) {
					await interaction.reply({
						content:
							'No suitable trending videos found. Please try again later.',
						ephemeral: true,
					});
					return;
				}

				const randomVideoIndex = Math.floor(
					Math.random() * filteredVideos.length,
				);
				const video: Video = filteredVideos[randomVideoIndex];
				const videoTitle = video.title || 'Unknown Title';
				const videoId = video.id;

				await interaction.reply({
					content: `**Summarizing Trending Video:** ${videoTitle}\nhttps://youtube.com/watch?v=${videoId}`,
					ephemeral: false,
				});

				queueVideoProcessing(videoId, videoTitle, user.username, interaction);
			} catch (error) {
				console.error('Error fetching trending videos:', error);
				await interaction.reply({
					content: "Couldn't fetch trending videos. Please try again later.",
					ephemeral: true,
				});
			}
			break;

		case 'queue':
			const queueList = queue
				.map((item, index) => `${index + 1}. ${item.userName}: ${item.title}`)
				.join('\n');
			await interaction.reply({
				content: `**Current Queue:**\n- ${activeTasks} active tasks.\n${queueList || 'The queue is currently empty.'}`,
				ephemeral: false,
			});
			break;

		case 'search':
			const query = options.getString('query', true);
			try {
				const searchResults = await youtube_client.search(query);
				const filteredVideos = searchResults.videos.filter(filterVideo);

				if (filteredVideos.length === 0) {
					await interaction.reply({
						content:
							'No suitable videos found for the given query. Try a different search term.',
						ephemeral: true,
					});
					return;
				}

				const randomVideoIndex = Math.floor(
					Math.random() * Math.min(10, filteredVideos.length),
				);
				const chosenVideo = filteredVideos[randomVideoIndex];
				const videoTitle = chosenVideo.title || 'Unknown Title';
				const videoId = chosenVideo.id;

				await interaction.reply({
					content: `**Summarizing Video from Search:** ${videoTitle}\nhttps://youtube.com/watch?v=${videoId}`,
					ephemeral: false,
				});

				queueVideoProcessing(videoId, videoTitle, user.username, interaction);
			} catch (error) {
				console.error('Error searching for videos:', error);
				await interaction.reply({
					content:
						'An error occurred while searching for videos. Please try again later.',
					ephemeral: true,
				});
			}
			break;
	}
});

// Start the Discord bot
client.login(process.env.discordapi);

// Start the transcript server
try {
	start_transcript_server();
} catch (error) {
	console.error('Error starting transcript server:', error);
}
