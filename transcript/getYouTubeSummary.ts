import {YoutubeTranscript} from 'youtube-transcript';
import {GoogleGenerativeAI} from '@google/generative-ai';
import ytSearch from 'youtube-search-api';

export async function getYouTubeSummary(
	url: string,
	numberOfPoints: number,
): Promise<string[]> {
	const MAX_RETRIES = 5;
	let retries = 0;

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

	const fetchInfo = async (): Promise<string> => {
		try {
			const searchData = await ytSearch.GetVideoDetails(url.split('=').at(-1));
			const infoObject = {
				title: searchData.title,
				channel: searchData.channel,
				description: searchData.description.slice(0, 300) + '...',
				keywords: searchData.keywords,
			};
			return JSON.stringify(infoObject);
		} catch (error) {
			console.error('Error fetching info:', error);
			throw error;
		}
	};

	const generateSummary = async (
		transcript: string,
		info: string,
	): Promise<string[]> => {
		try {
			const genAI = new GoogleGenerativeAI(process.env.geminiapi ?? '');
			const model = genAI.getGenerativeModel({model: 'gemini-1.5-flash'});

			const prompt = `
			  You are an ai assistant tasked with one task which is to summarize the transcript of this youtube video into ${numberOfPoints} informative and short messages that get all the details.
				the messages should be concise and cover everything about the videos content and the subject itself not the videos structure.
				you must be as good at story telling within the format as possible. avoid sounding dry at all cost. unless its a serious topic be professional.
				don't refer to the video as "the video" you are here to talk about its content
				avoid repetition by using pronouns between messages.
				do not mention the intro, outro or sponsorship. write the messages as only the text separated by new line characters. no symbol or anything else.
			  all these points should be only one sentence long.
				mostly speak in past tense mentioning the channel name sometimes without repeating names too much.
				speak very very casually like a friend texting and with minimal punctuation without a dot at the end of messages.
			  for generally unsafe words, things that can get you censored use asterisks and hashes in the middle of the word like s#x and d*gs. keep everything clean of nsfw content
				video information use it for your commentary: ${info}
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
			// 	work with this transcript: ${transcript}
			// `;

			console.log('prompting gemini..', {url});
			const geminiResult = await model.generateContent(prompt);
			console.log('summary obtained');
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
			const transcript = await fetchTranscript();
			const info = await fetchInfo();
			const summary = await generateSummary(transcript, info);
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
