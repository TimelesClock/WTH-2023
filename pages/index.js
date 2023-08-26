import React, { useRef, useState } from 'react';
import axios from 'axios';
import { AudioRecorder } from 'react-audio-voice-recorder';


const addAudioElement = async (blob, inputRef, outputRef, language) => {
  const arrayBuffer = await blob.arrayBuffer();
  const base64Audio = Buffer.from(arrayBuffer).toString('base64');

  try {
    const res = await axios.post('/api/input', { audioData: base64Audio, language }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    inputRef.current.value = res.data.audioContent;

    const res2 = await axios.post('/api/output', { text: res.data.audioContent, language }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    outputRef.current.value = res2.data.out;

    const audio = new Audio(`data:audio/mp3;base64,${res2.data.audioContent}`);
    audio.play();
  } catch (err) {
    console.error(err);
  }
};

export default function Home() {
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const [language, setLanguage] = useState('English');

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    axios.post('/api/output', {reset:true}, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };
  

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'dark' }}>
      <h1 className="text-3xl font-bold underline mb-5">Group:  The Participant</h1>
      <select className="select w-1/4 mb-5" onChange={handleLanguageChange} value={language}>
        <option value="English">English</option>
        <option value="Chinese">Chinese</option>
        <option value="Malay">Malay</option>
      </select>
      <AudioRecorder
        onRecordingComplete={(blob) => addAudioElement(blob, inputRef, outputRef, language)}
        audioTrackConstraints={{
          sampleRate: 48000, noiseSuppression: true,
          echoCancellation: true,
        }}
        downloadOnSavePress={false}
        downloadFileExtension="mp3"
      />
      <div className="font-bold text-xl mt-5">Voice Input</div>
      <textarea ref={inputRef} className="textarea textarea-bordered w-96 h-48" title="input"></textarea>

      <div className=" mt-5 font-bold text-xl">Voice Output</div>
      <textarea ref={outputRef} className="textarea textarea-bordered w-96 h-48" title="output"></textarea>
    </div>
  );
}
