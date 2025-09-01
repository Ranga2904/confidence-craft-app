import React, { useState } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedContext, setSelectedContext] = useState('dating');
  const [isLoading, setIsLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);

  const rewriteText = async () => {
    if (!inputText.trim()) {
      alert('Please enter some text to rewrite!');
      return;
    }

    if (usageCount >= 10) {
      alert('You\'ve reached your daily limit of 10 rewrites. Try again tomorrow!');
      return;
    }

    setIsLoading(true);

    // Define system prompt based on context for high-quality, tuned output
    let systemPrompt = '';

    if (selectedContext === 'dating') {
      systemPrompt = `You are an expert dating coach specializing in building confidence. Transform the user's dating message to sound confident, engaging, and charismatic. Remove weak phrases like "maybe", "perhaps", "if you want", "no pressure", "sorry", "I hope", "I was wondering", "just". Make it warmer, more direct without being pushy, and add subtle enthusiasm or empowerment if appropriate. Keep the core meaning intact but enhance for better impact. Output only the rewritten message.`;
    } else {
      systemPrompt = `You are an expert professional career advisor focused on boosting assertiveness. Transform the user's professional message to sound assertive, confident, and authoritative yet respectful. Remove weak phrases like "I think", "maybe", "perhaps", "if possible", "sorry to bother", "I hope", "I was wondering", "just checking". Emphasize clarity, leadership, and value. Keep the core meaning intact but polish for career impact. Output only the rewritten message.`;
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_GROQ_API_KEY_HERE', // Replace with your actual Groq API key from console.groq.com
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile', // High-quality model for nuanced, context-aware responses
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: `Original: "${inputText}"`,
            },
          ],
          max_tokens: 300, // Sufficient for detailed rewrites without excess
          temperature: 0.7, // Balanced creativity: Engaging variations without randomness
          top_p: 0.9, // Focuses on high-probability, diverse outputs
          presence_penalty: 0.2, // Encourages fresh phrasing
          frequency_penalty: 0.3, // Reduces repetition for polished results
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOutputText(data.choices[0].message.content.trim()); // Trim for clean output
      setUsageCount(usageCount + 1);
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong with the API. Please try again later.');
    }

    setIsLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    alert('Copied to clipboard!');
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Confidence Craft</h1>
        <p>Transform your messages to sound confident whether for that special someone or at work!</p>
        <p className="usage-counter">Daily usage: {usageCount}/10</p>
      </header>

      <main className="app-main">
        <div className="context-selector">
          <button 
            className={selectedContext === 'dating' ? 'active' : ''}
            onClick={() => setSelectedContext('dating')}
          >
            Dating
          </button>
          <button 
            className={selectedContext === 'work' ? 'active' : ''}
            onClick={() => setSelectedContext('work')}
          >
            Professional
          </button>
        </div>

        <div className="input-section">
          <h3>Original Message:</h3>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={selectedContext === 'dating' 
              ? "e.g., Hey, I was wondering if maybe you'd like to grab coffee sometime? No pressure though..."
              : "e.g., I was hoping we could possibly discuss my project timeline if you have time..."
            }
            maxLength={500}
          />
          <button 
            onClick={rewriteText} 
            disabled={isLoading || !inputText.trim()}
            className="rewrite-btn"
          >
            {isLoading ? 'Rewriting...' : 'Make It Confident ✨'}
          </button>
        </div>

        {outputText && (
          <div className="output-section">
            <h3>Confident Version:</h3>
            <div className="output-text">
              {outputText}
            </div>
            <button onClick={copyToClipboard} className="copy-btn">
              Copy to Clipboard 📋
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
	
