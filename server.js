const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { SpeechClient } = require('@google-cloud/speech');
const { Translate } = require('@google-cloud/translate').v2;

const app = express();
const port = 8081;

// Set up Google Cloud clients
const speechClient = new SpeechClient();
const translateClient = new Translate();

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/upload', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('File uploaded:', req.file); // Log file details

        const audioBytes = req.file.buffer.toString('base64');

        const request = {
            audio: {
                content: audioBytes,
            },
            config: {
                encoding: 'LINEAR16', 
                // sampleRateHertz: 16000, 
                languageCode: 'gu-IN',
            },
        };

        const [response] = await speechClient.recognize(request);
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');

        const targetLanguage = 'en'; 
        const [translation] = await translateClient.translate(transcription, targetLanguage);

        res.json({
            transcription: transcription,
            translation: translation,
        });

    } catch (error) {
        console.error('Error:', error); // Log full error
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
