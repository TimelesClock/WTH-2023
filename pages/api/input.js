import { SpeechClient } from '@google-cloud/speech';


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const lang = {
        "English": "en-US",
        "Chinese": "zh-SG",
        "Cantonese":"yue-Hant-HK",
        "Malay": "ms-MY",
        "Hindi": "hi-IN",
        "Tamil":"ta-SG",
    }

    const credential = {
        client_id: process.env.CLIENT_ID,
        client_email: process.env.CLIENT_EMAIL,
        private_key: process.env.PRIVATE_KEY,
        token_url: process.env.TOKEN_URI,
    }

    const { audioData,language } = req.body;

    const speechClient = new SpeechClient({credentials:credential});

    // Convert speech to text using Google Cloud SDK
    const sttRequest = {
        audio: {
            content: audioData,
        },
        config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: lang[language],
        },
    };

    try {
        const [sttResponse] = await speechClient.recognize(sttRequest);

        if (!sttResponse.results[0]) {
            return res.status(200).json({ audioContent: "Please speak again" });
        }
        const text = sttResponse.results[0].alternatives[0].transcript;

        if (!text){
            return res.status(200).json({ audioContent: "Please speak again" });
        }else{
            return res.status(200).json({ audioContent: text});
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to process audio' });
    }
}

