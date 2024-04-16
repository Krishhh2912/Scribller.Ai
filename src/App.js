import React, { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import "./App.css";
import particlesOptions from "./particles.json";

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
function App() {
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
  const [init, setInit] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (init) {
      return;
    }

    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });
  }, [init]);

  const query = async (data) => {
    setIsLoading(true);
    const response = await fetch(
      "https://api-inference.huggingface.co/models/MdEndan/stable-diffusion-lora-fine-tuned",
      {
        headers: { Authorization: "Bearer ${process.env.ACCESS_TOKEN}" },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const result = await response.blob();
    setIsLoading(false);
    return result;
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
      };
      recognition.start();
    } else {
      alert('Speech recognition not supported in your browser.');
    }
  };

  const handleSubmit = () => {
    query({ "inputs": userInput }).then((response) => {
      const imageUrl = URL.createObjectURL(response);
      setGeneratedImage(imageUrl);
    });
  };

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'generated_image.png';
    link.click();
  };



  return (
    <div className="App">
      {init && <Particles options={particlesOptions} />}

      <div className="container">
      <div>
      <h1><span className="red-text">Skribller</span>.Ai</h1>
        {/* <img src={logo} alt="Logo" /> */}
        <br />
        <button onClick={handleVoiceInput} className="voice-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 12V5c0-1.1.9-2 2-2s2 .9 2 2v7c0 1.1-.9 2-2 2s-2-.9-2-2zm6-2v4c0 3.31-2.69 6-6 6s-6-2.69-6-6v-4" />
          </svg>
         
        </button>
      </div>
      <div>
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Enter text here..."
        />
      </div>
      <div>
        <button onClick={handleSubmit}>Generate Sketch</button>
      </div>
      {isLoading && <div>Loading...</div>}
      {generatedImage && (
        <div>
          <img src={generatedImage} alt="Generated"  className="responsive-image" />
          <br/>
          <button onClick={handleDownload}>Download Sketch </button>
        </div>
      )}
    </div>
    </div>
    );
}

export default App;
