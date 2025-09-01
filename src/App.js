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
    let systemPrompt = '';
    let userPrompt = '';

    if (selectedContext === 'dating') {
      systemPrompt = `You are a confident dating coach. Transform messages to sound warm, direct, and confident without being pushy. Remove weak phrases like "maybe", "perhaps", "if you want", "no pressure", "sorry", "I hope", "I was wondering", "just".

Examples:
• "Maybe we could hang out sometime if you want?" → "I'd love to spend time with you this week."
• "Sorry to text, but I was wondering if you're free?" → "Are you free this evening?"
• "No pressure, but would you like to grab coffee?" → "Let's get coffee - I know a great place."

Rules:
- Remove ALL hesitant language
- Make it warm and enthusiastic
- Keep the same core meaning
- End with confidence, not questions`;

      userPrompt = `Transform this dating message to be confident and engaging: "${inputText}"

Return ONLY the confident version with no explanations.`;

    } else {
      systemPrompt = `You are an executive communication coach. Transform messages to sound authoritative, professional, and confident while remaining respectful. Remove weak phrases like "I think", "maybe", "perhaps", "if possible", "sorry to bother", "I hope", "I was wondering".

Examples:
• "I was hoping we could possibly discuss the project?" → "Let's schedule time to discuss the project."
• "Sorry to bother, but I think we should maybe review this" → "I recommend we review this immediately."
• "If possible, could we perhaps meet?" → "Please schedule a meeting at your earliest convenience."

Rules:
- Remove ALL uncertain language
- Make requests direct and clear
- Use authoritative but respectful tone
- Be specific about next steps`;

      userPrompt = `Transform this professional message to be assertive and confident: "${inputText}"

Return ONLY the professional version with no explanations.`;
    }

    try {
      // Using Google Gemini API (FREE with generous limits)
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: userPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API Error:', errorData);
        
        if (response.status === 403) {
          throw new Error('Invalid API key. Please check your Gemini API key.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        } else {
          throw new Error(`API Error ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
        }
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const generatedText = data.candidates[0].content.parts[0].text.trim();
        setOutputText(generatedText);
        setUsageCount(usageCount + 1);
      } else {
        throw new Error('Unexpected response format from Gemini API');
      }

    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
      
      // Smart fallback if API fails
      const fallbackResult = generateSmartFallback(inputText, selectedContext);
      setOutputText(fallbackResult);
      setUsageCount(usageCount + 1);
    }

    setIsLoading(false);
  };

  // Enhanced fallback system
  const generateSmartFallback = (text, context) => {
    let result = text.trim();
    
    // Remove weak phrases
    const weakPhrases = [
      'maybe', 'perhaps', 'possibly', 'if you want', 'no pressure',
      'sorry to bother', 'sorry', 'just', 'i guess', 'kind of',
      'i was wondering if', 'if possible', 'i was hoping'
    ];
    
    weakPhrases.forEach(weak => {
      result = result.replace(new RegExp(`\\b${weak}\\b`, 'gi'), '');
    });
    
    // Transform weak to strong
    const transformations = {
      'i think': 'I believe',
      'i hope': 'I\'d love',
      'could we': 'let\'s',
      'would you like to': 'let\'s',
      'can we': 'let\'s',
      'we should probably': 'we should'
    };
    
    Object.keys(transformations).forEach(weak => {
      result = result.replace(new RegExp(`\\b${weak}\\b`, 'gi'), transformations[weak]);
    });
    
    // Context-specific improvements
    if (context === 'dating') {
      result = result.replace(/\?+/g, '.');
      if (!result.match(/(love|excited|looking forward)/i)) {
        result = result.replace(/\.$/, ' - I\'m excited about this!');
      }
    } else {
      result = result.replace(/could you please/gi, 'please');
      result = result.replace(/would you mind/gi, 'please');
    }
    
    // Clean up and capitalize
    result = result.replace(/\s+/g, ' ').trim();
    result = result.charAt(0).toUpperCase() + result.slice(1);
    
    if (!result.match(/[.!]$/)) {
      result += '.';
    }
    
    return result.length > 10 ? result : text;
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
