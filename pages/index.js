import React, { useRef, useState } from 'react';
import axios from 'axios';
import { AudioRecorder } from 'react-audio-voice-recorder';




export default function Home() {
  const [isLoadingInput, setIsLoadingInput] = useState(false);
  const [isLoadingOutput, setIsLoadingOutput] = useState(false);
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const [language, setLanguage] = useState('English');
  const [textAreaStatus, setTextAreaStatus] = useState({ input: '', output: '' });
  const [outputAreaStatus, setOutputAreaStatus] = useState({ input: '', output: '' });

  const addAudioElement = async (blob, inputRef, outputRef, language) => {
    const arrayBuffer = await blob.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');
    setIsLoadingInput(true)
    setIsLoadingOutput(true)
    try {
      const res = await axios.post('/api/input', { audioData: base64Audio, language }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setIsLoadingInput(false);
      inputRef.current.value = res.data.audioContent;
      if (res.data.audioContent === "Please speak again"){
        setIsLoadingOutput(false);
        outputRef.current.value = ""
        setTextAreaStatus({ ...textAreaStatus, output: 'textarea-error' });
        return
      }
  
      const res2 = await axios.post('/api/output', { text: res.data.audioContent, language }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setIsLoadingOutput(false);
      outputRef.current.value = res2.data.out;

      setTextAreaStatus({ ...textAreaStatus, output: 'textarea-success' });
      setOutputAreaStatus({ ...outputAreaStatus, output: 'textarea-success' });
  
      const audio = new Audio(`data:audio/mp3;base64,${res2.data.audioContent}`);
      audio.play();
    } catch (err) {
      setIsLoadingInput(false);
      setIsLoadingOutput(false);
      setTextAreaStatus({ input: 'textarea-error', output: 'textarea-error' });
      setOutputAreaStatus({ ...outputAreaStatus, output: 'textarea-error' });
      console.error(err);
    }
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    axios.post('/api/output', { reset: true }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'dark' }}>
      <h1 className="text-3xl font-bold mb-5">Group: The Participant</h1>
      <h1 className="text-3xl font-bold underline mb-5">Voice Powered Chatbot</h1>
      <select className="select w-1/4 mb-5" onChange={handleLanguageChange} value={language}>
        <option value="English">English</option>
        <option value="Chinese">Chinese</option>
        <option value="Cantonese">Cantonese</option>
        <option value="Malay">Malay</option>
        <option value="Hindi">Hindi</option>
      </select>
      <AudioRecorder
        onRecordingComplete={(blob) => addAudioElement(blob, inputRef, outputRef, language)}
        audioTrackConstraints={{
          sampleRate: 48000,
          noiseSuppression: true,
          echoCancellation: true,
          volume: 1.0,
        }}
        downloadOnSavePress={false}
        downloadFileExtension="mp3"
      />
      <div className="font-bold text-xl mt-5">Voice Input
      {isLoadingInput && <span className="ms-3 loading loading-spinner loading-xs"></span>}</div>
      <textarea ref={inputRef} className={`textarea textarea-bordered w-96 h-48 ${textAreaStatus.output}`} title="input"></textarea>

      <div className=" mt-5 font-bold text-xl">Voice Output
      {isLoadingOutput && <span className="ms-3 loading loading-spinner loading-xs"></span>}</div>
      <textarea ref={outputRef} className={`textarea textarea-bordered w-96 h-48 ${outputAreaStatus.output}`} title="output"></textarea>
    </div>
  );
}
