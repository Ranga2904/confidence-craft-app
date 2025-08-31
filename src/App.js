import React, { useState } from 'react';
import './App.css';

function App() {
  // These are like variables that can change
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedContext, setSelectedContext] = useState('dating');
  const [isLoading, setIsLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);

  // This function calls the AI to rewrite text
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

    // Create the prompt based on context
let systemMessage = '';
let userPrompt = '';

if (selectedContext === 'dating') {
  systemMessage = 'You are a confident dating coach who helps people communicate with attractive self-assurance. You make messages warmer and more direct without being pushy.';
  
  userPrompt = `Transform this dating message to sound confident and engaging.

REMOVE weak phrases: "maybe", "perhaps", "if you want", "no pressure", "sorry", "I hope", "I was wondering", "just"

EXAMPLE TRANSFORMATIONS:
• "Maybe we could hang out?" → "I'd love to spend time with you."
• "Sorry to text, but..." → Remove "sorry" entirely
• "If you want to" → "Let's"

Transform this message: "${inputText}"

Return ONLY the improved message with no explanations.`;

} else {
  systemMessage = 'You are an executive communication coach who helps people sound authoritative and professional while remaining respectful.';
  
  userPrompt = `Transform this professional message to sound assertive and confident.

REMOVE weak phrases: "I think", "maybe", "perhaps", "if possible", "sorry to bother", "I hope", "I was wondering", "just checking"

STRENGTHEN with confident alternatives:
• "I think we should" → "I recommend"
• "I hope you could" → "Please"
• "If possible" → Set clear expectations
• "Sorry to bother" → Remove entirely

Transform this message: "${inputText}"

Return ONLY the professional rewrite with no explanations.`;
}

    try {
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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' // You'll replace this
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'user', content: userPrompt },
            { role: 'system', content: systemMessage }],
          max_tokens: 150
        })
      });

      const data = await response.json();
      setOutputText(data.choices[0].message.content);
      setUsageCount(usageCount + 1);
    } catch (error) {
      alert('Something went wrong. Please try again.');
      console.error('Error:', error);
    }

    setIsLoading(false);
  };

  // Function to copy text to clipboard
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
        {/* Context selector */}
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

        {/* Input section */}
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

        {/* Output section */}
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