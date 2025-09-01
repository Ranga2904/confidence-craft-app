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

    // Create the prompt based on context
    let prompt = '';

    if (selectedContext === 'dating') {
      prompt = `Transform this dating message to sound confident and engaging. Remove weak phrases like "maybe", "perhaps", "if you want", "no pressure", "sorry", "I hope", "I was wondering", "just". Make it warmer and more direct without being pushy.

Original: "${inputText}"

Confident version:`;
    } else {
      prompt = `Transform this professional message to sound assertive and confident. Remove weak phrases like "I think", "maybe", "perhaps", "if possible", "sorry to bother", "I hope", "I was wondering", "just checking". Make it authoritative yet respectful.

Original: "${inputText}"

Professional version:`;
    }

    try {
      // Using Hugging Face Inference API (FREE)
      const response = await fetch(
        'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 100,
              temperature: 0.7,
              return_full_text: false
            }
          }),
        }
      );

      if (!response.ok) {
        // Fallback to a better free model if first fails
        const fallbackResponse = await fetch(
          'https://api-inference.huggingface.co/models/gpt2',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.REACT_APP_HUGGINGFACE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                max_new_tokens: 80,
                temperature: 0.8,
                return_full_text: false
              }
            }),
          }
        );
        
        if (!fallbackResponse.ok) {
          throw new Error(`API Error: ${fallbackResponse.status}`);
        }
        
        const fallbackData = await fallbackResponse.json();
        let generatedText = fallbackData[0]?.generated_text || 'Unable to generate confident version.';
        
        // Clean up the response
        generatedText = generatedText.replace(prompt, '').trim();
        setOutputText(generatedText || 'Unable to generate confident version.');
        setUsageCount(usageCount + 1);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      let generatedText = data[0]?.generated_text || 'Unable to generate confident version.';
      
      // Clean up the response - remove the original prompt
      generatedText = generatedText.replace(prompt, '').trim();
      
      setOutputText(generatedText || 'Unable to generate confident version.');
      setUsageCount(usageCount + 1);
      
    } catch (error) {
      console.error('Error:', error);
      
      // Smart fallback with predefined transformations
      const fallbackResult = generateFallbackResponse(inputText, selectedContext);
      setOutputText(fallbackResult);
      setUsageCount(usageCount + 1);
    }

    setIsLoading(false);
  };

  // Smart fallback function with pattern matching
  const generateFallbackResponse = (text, context) => {
    const weakPhrases = {
      'maybe we could': 'let\'s',
      'if you want': '',
      'no pressure': '',
      'sorry to bother': '',
      'i was wondering if': 'would you like to',
      'perhaps': '',
      'i think maybe': 'i believe',
      'sorry': '',
      'just': '',
      'i hope': 'i\'d like',
      'possibly': '',
      'if possible': '',
      'i was hoping': 'i\'d like'
    };

    let result = text.toLowerCase();
    
    // Apply transformations
    Object.keys(weakPhrases).forEach(weak => {
      const replacement = weakPhrases[weak];
      result = result.replace(new RegExp(weak, 'gi'), replacement);
    });
    
    // Clean up extra spaces
    result = result.replace(/\s+/g, ' ').trim();
    
    // Capitalize first letter
    result = result.charAt(0).toUpperCase() + result.slice(1);
    
    // Add context-specific improvements
    if (context === 'dating') {
      result = result.replace(/\?$/, '.');
      if (!result.includes('love') && !result.includes('excited')) {
        result = result.replace('.', ' - I\'m excited about this!');
      }
    } else {
      result = result.replace('i believe', 'I recommend');
      result = result.replace('would you', 'please');
    }
    
    return result || 'I\'d love to connect with you!';
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
