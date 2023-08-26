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
    const ttsClient = new TextToSpeechClient();

    try {

        const lang = {
            "English": "en-US",
            "Chinese": "zh-SG",
            "Malay": "ms-MY",
        }

        const text = req.body.text
        const language = req.body.language

        if (!text){
            return res.status(500).json({ audioContent: "Please speak again" });
        }

        // Auto-complete function
        const autoCompleteResult = await autoComplete(text);

        conversationHistory.push({ role: 'user', content: text });

        const out = autoCompleteResult.predictions[0].content;

        console.log(out)

        if (!out){
            return res.status(200).json({ out: "Please speak again" });
        }

        if (out.indexOf("\\n") !== -1){
            return res.status(200).json({ out: "Please speak again" });
        }

        conversationHistory.push({ role: 'bot', content: out});

        let colon = out.indexOf(":")
        var end = out
        if (colon !== -1){
            end = out.substring(colon+1)
        }
        // Convert text back to speech
        const ttsRequest = {
            input: { text: end },
            voice: { languageCode: lang[language]},
            audioConfig: { audioEncoding: 'MP3' },
        };


        const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
        const audioContent = ttsResponse.audioContent.toString('base64');
        console.log(out)
        return res.status(200).json({ audioContent,out });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to process audio' });
    }
}

const autoComplete = async (
    text,
) => {

    const auth = new GoogleAuth({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
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
        Context: You are a chatbot for an elderly individual who wants to engage in a friendly and respectful conversation. 
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
