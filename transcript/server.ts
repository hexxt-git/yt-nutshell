import express from 'express';
import cors from 'cors';
import {getYouTubeSummary} from './getYouTubeSummary';

const app = express();
app.use(cors());
const port = 5555;

app.get('/', async (req, res) => {
	console.log('get', req.url);
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
		const errorMessage = (error as {message: string}).message;
		console.error('Error fetching YouTube summary:', error);

		if (errorMessage.includes('Error fetching transcript:')) {
			res.status(500).json({error: 'Failed to fetch YouTube transcript.'});
		} else if (errorMessage.includes('Error generating summary:')) {
			res.status(500).json({error: 'Failed to generate YouTube summary.'});
		} else {
			res.status(500).json({error: 'An unexpected error occurred.'});
		}
	}
});

export const start_transcript_server = () =>
	app.listen(port, () => {
		console.log(`Server is running on http://localhost:${port}`);
	});
