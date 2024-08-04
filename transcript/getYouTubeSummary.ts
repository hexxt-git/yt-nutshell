import {Innertube} from 'youtubei.js/web';
import {VideoInfo} from 'youtubei.js/dist/src/parser/youtube';
import {YoutubeTranscript} from 'youtube-transcript';
import {GoogleGenerativeAI} from '@google/generative-ai';

export async function getYouTubeSummary(
	url: string,
	numberOfPoints: number,
): Promise<string[]> {
	const MAX_RETRIES = 5;
	let retries = 0;

	const youtube = await Innertube.create({
		lang: 'en',
		location: 'US',
		retrieve_player: false,
	});

	const fetchTranscript = async (): Promise<string> => {
		try {
			const transcriptData = await YoutubeTranscript.fetchTranscript(url, {
				lang: 'en',
			});
			return transcriptData
				.map((entry: {text: string}) => entry.text)
				.join('\n');
		} catch (error) {
			console.error('Error fetching transcript:', error);
			throw error;
		}
	};

	const fetchOverview = async (info: VideoInfo) => {
		return JSON.stringify({
			title: info.basic_info.title ?? '',
			channel: info.basic_info.channel?.name ?? '',
			description: info.basic_info.short_description ?? '',
			duration:
				Math.round(((info.basic_info.duration ?? 0) / 60) * 10) / 10 + 'minute',
		});
	};

	const generateSummary = async (
		transcript: string,
		overview: string,
	): Promise<string[]> => {
		try {
			const genAI = new GoogleGenerativeAI(process.env.geminiapi ?? '');
			const model = genAI.getGenerativeModel({model: 'gemini-1.5-flash'});

			const prompt = `
			  You are an ai assistant tasked with one task which is to summarize the transcript of this youtube video into ${numberOfPoints} informative and short messages that get all the details.
				the messages should be concise and cover everything about the videos content and the subject itself not the videos structure.
				you must be as good at story telling within the format as possible. avoid sounding dry at all cost. unless its a serious topic be professional.
				always take the righteous opinion but don't be too subjective
				don't refer to the video as "the video" you are here to talk about its content.
				avoid repetition by using pronouns between messages.
				do not mention the intro, outro or sponsorship. write the messages as only the text separated by new line characters. no symbol or anything else.
			  all these points should be only one sentence long.
				the first message must clarify the context and situation and the last two must be a reflection on what happened then a prediction if it applies to the video. 
				mostly speak in past tense mentioning the channel name sometimes without repeating names too much.
				speak very very casually like a friend texting and with minimal punctuation without a dot at the end of messages.
			  for generally unsafe words, things that can get you censored use asterisks and hashes in the middle of the word like s#x and d*gs. keep everything clean of nsfw content
				video information use it for your commentary: ${overview}
			  the video transcript: \n${transcript}
			`.replace(/\s{2,}/g, ' ');

			// const prompt = `
			// 	You are a youtube content creator your job is to summarize content into short form from its transcript.
			// 	you receive a videos transcript and output the following format:
			// 		intro section should have something like "so charlie recently announced that he is retiring" or "things are heating up over in LA james is dissing out people left and right"
			// 		content section divided into exactly ${numberOfPoints} points separated by new lines that gets all the details from the video in a concise manner. each bullet point should be one line of text or one sentence
			// 		outro part with something like "i just saved precious minutes for you so why don't you hit that like button and subscribe for more content". they don't have to be exactly like this but always make sure to include a call for action
			// 	use pronouns to avoid repeating the same names too often between bullet points
			// 	talk about everything in the past tense and talk about the videos content not the structure itself so don't mention that there was some intro, outro or sponsorship
			// 	separate everything by new lines with no extra punctuation or anything to make it look like a list. even when the intro/outro get too long separate by new lines
			//   for generally unsafe words, things that can get you censored use asterisks and hashes in the middle of the word like s#x and d*gs. keep everything clean of nsfw content
			// 	video information use it for your commentary: ${info}
			// 	work with this transcript: ${transcript}
			// `.replace(/\s{2,}/g, ' ');

			console.log('prompting gemini..', {url});
			const geminiResult = await model.generateContent(prompt);
			console.log('summary obtained', {url});
			return geminiResult.response
				.text()
				.split('\n')
				.filter((point: string) => point.length);
		} catch (error) {
			console.error('Error generating summary:', error);
			throw error;
		}
	};

	while (retries < MAX_RETRIES) {
		try {
			const info = await youtube.getInfo(url);
			const transcript = await fetchTranscript();
			const overview = await fetchOverview(info);
			const summary = await generateSummary(transcript, overview);
			return summary;
		} catch (error) {
			retries++;
			await new Promise((res) => {
				setTimeout(res, 5000);
			});
			console.warn(`Attempt ${retries} failed. Retrying...`);
			if (retries >= MAX_RETRIES) {
				throw new Error(
					`Failed to get YouTube summary after ${MAX_RETRIES} attempts.`,
				);
			}
		}
	}

	throw new Error('Unexpected error occurred.');
}

// Example usage:
// getYouTubeSummary("https://www.youtube.com/watch?v=g8wZ85YWfas", 10)
//   .then((summary) => console.log(summary))
//   .catch((error) => console.error("Error:", error));
