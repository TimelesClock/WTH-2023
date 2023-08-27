import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';

const PROJECT_ID = "skilful-scarab-397104";

let conversationHistory = [];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    if (req.body && req.body.reset === true) {
        conversationHistory = [];
        return res.status(200).json();
    }
    const credential = {
        client_id: process.env.CLIENT_ID,
        client_email: process.env.CLIENT_EMAIL,
        private_key: process.env.PRIVATE_KEY,
        token_url: process.env.TOKEN_URI,
    }

    const ttsClient = new TextToSpeechClient({credentials:credential});

    try {

        const lang = {
            "English": "en-au",
            "Chinese": "zh-SG",
            "Malay": "ms-MY",
            "Cantonese": "yue-HK",
            "Hindi": "hi-IN",
            "Tamil": "ta-IN",
        }

        const text = req.body.text
        const language = req.body.language

        if (!text) {
            return res.status(500).json({ audioContent: "Please speak again" });
        }

        // Auto-complete function
        const autoCompleteResult = await autoComplete(text);

        conversationHistory.push({ role: 'User', content: text });

        const out = autoCompleteResult.predictions[0].content;

        if (!out) {
            return res.status(200).json({ out: "Please speak again" });
        }

        if (out.indexOf("\\n") !== -1) {
            return res.status(200).json({ out: "Please speak again" });
        }

        conversationHistory.push({ role: 'ElderSpeak', content: out });

        let colon = out.indexOf(":")
        var end = out
        if (colon !== -1) {
            end = out.substring(colon + 1)
        }
        // Convert text back to speech
        const voice = {
            languageCode: lang[language],
            ...(language === 'English' ? { name: 'en-AU-Neural2-D' } : {}),
            ...(language === 'Hindi' ? { name: 'hi-IN-Neural2-B' } : {}),
            ...(language === 'Tamil' ? { name: 'ta-IN-Wavenet-D' } : {}),
            ...(language === 'Cantonese' ? { name: 'yue-HK-Standard-D' } : {}),
        };
        const ttsRequest = {
            input: { text: end },
            voice: voice,
            audioConfig: { audioEncoding: 'MP3' },
        };


        const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
        const audioContent = ttsResponse.audioContent.toString('base64');
        return res.status(200).json({ audioContent, out });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to process audio' });
    }
}

const autoComplete = async (
    text,
) => {
    const auth = new GoogleAuth({
        keyFile: "src/google-key.json",
        credentials: {
            client_id: process.env.CLIENT_ID,
            client_email: process.env.CLIENT_EMAIL,
            private_key: process.env.PRIVATE_KEY,
            token_url: process.env.TOKEN_URI,
        },
        scopes: "https://www.googleapis.com/auth/cloud-platform",
    });
    const token = await auth.getAccessToken();
    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    var hist = [...conversationHistory];


    const body = JSON.stringify({
        instances: [
            {
                prompt: `
        Context: You are a chatbot named ElderSpeak for an elderly individual who wants to engage in a friendly and respectful conversation. 
        Please guide the person through various topics like today's technology, nostalgia, health, and anything else that could be interesting and informative for someone of old age. 
        Keep the chat simple and straightforward, avoiding jargon or complicated explanations.Keep in mind that the prompts might be jumbled up and not make sense as the elderly might have speech impairment, so you will need to guess the prompt based on similar sounding words.
        Try to end every sentence with a relevant cheerful message. Thank you!

        Past Messages: ${JSON.stringify(hist)}

        Prompt: "${text}"

        `,
            },
        ],
        parameters: {
            temperature: 0.7,
            maxOutputTokens: 256,
            topK: 40,
            topP: 0.95,
        },
    });

    try {
        const response = await axios.post(
            `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/text-bison:predict`,
            body,
            {
                headers,
            }
        );

        if (response.status === 200) {
            const data = response.data;
            return data;
        } else {
            console.error(response.data);
        }
    } catch (error) {
        console.error(error);
    }
};
