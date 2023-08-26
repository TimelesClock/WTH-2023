import { SpeechClient } from '@google-cloud/speech';


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const lang = {
        "English": "en-US",
        "Chinese": "zh-SG",
        "Malay": "ms-MY",
    }



    const { audioData,language } = req.body;

    const speechClient = new SpeechClient();

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

