import {YoutubeTranscript} from 'youtube-transcript';
import {GoogleGenerativeAI} from '@google/generative-ai';

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

	const generateSummary = async (transcript: string): Promise<string[]> => {
		try {
			const genAI = new GoogleGenerativeAI(process.env.geminiapi ?? '');
			const model = genAI.getGenerativeModel({model: 'gemini-1.5-flash'});

			const prompt = `
        You are an ai assistant tasked with one task which is to summarize the transcript of this youtube video into ${numberOfPoints} informative and short bullet points that get all the details the bullets should be concise and cover everything about the videos content and the subject itself not the videos structure. do not mention the intro outro or the videos structure. write the bullet points as only the text separated by new lines only. no symbol or anything else.
        all these points should be only one sentence long and in the past tense. speak very casually like an internet influencer
        for generally unsafe words, things that can get you censored use asterisks and hashes in the middle of the word like s#x and d*gs. keep everything clean of nsfw content 
        the video transcript: \n${transcript}
      `;

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
			const summary = await generateSummary(transcript);
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

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
const port = 5555;

app.get('/', async (req, res) => {
	const url = req.query.url as string;
	const points = req.query.points
		? parseInt(req.query.points as string, 10)
		: 10;

	if (!url) {
		return res.status(400).json({error: 'Missing "url" query parameter.'});
	}

	try {
		const transcript = await getYouTubeSummary(url, points);
		res.json(transcript);
	} catch (error) {
		console.error('Error fetching YouTube summary:', error);

		if (error.message.includes('Error fetching transcript:')) {
			res.status(500).json({error: 'Failed to fetch YouTube transcript.'});
		} else if (error.message.includes('Error generating summary:')) {
			res.status(500).json({error: 'Failed to generate YouTube summary.'});
		} else {
			res.status(500).json({error: 'An unexpected error occurred.'});
		}
	}
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});

// Example usage:
// getYouTubeSummary("https://www.youtube.com/watch?v=g8wZ85YWfas", 10)
//   .then((summary) => console.log(summary))
//   .catch((error) => console.error("Error:", error));
