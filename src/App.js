import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const App = () => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState([

  ]);
  const [isLoading, setIsLoading] = useState(false);

  const getResponse = async () => {
    setIsLoading(true)
    if (!value) {
      setError("Error! Please ask a question!");
      return;
    }
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify({
          history: chatHistory,
          message: value
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const response = await fetch('http://localhost:8000/gemini-response', options);
      const data = await response.text();
      console.log(data);
      setChatHistory(oldChatHistory => [
        ...oldChatHistory,
        {
          role: "user",
          parts: [{ text: value }]
        },
        {
          role: "model",
          parts: [{ text: data }]
        }
      ]);
      setValue("");
    } catch (error) {
      console.error(error);
      setError("Something went wrong! Please try again later.");
    }
    setIsLoading(false)
  };

  const clear = () => {
    setValue("");
    setError("");
    setChatHistory([]);
  };

  return (
    <div className="app">
      <div className='title'>Health Assistant Chatbot</div>
      <div className='chat-container'>
        <div className='message bot-message'>
          Hi there, I'm here to assist you with any health-related questions or concerns.
        </div>
        {chatHistory.map((chatItem, _index) => (
          <div
            key={_index}
            className={`message ${chatItem.role === "user" ? "user-message" : "bot-message"}`}
          >
            <ReactMarkdown>{chatItem.parts.map(part => part.text).join(" ")}</ReactMarkdown>
          </div>
        ))}
        {isLoading && (
          <div className='loading-box'>
            <img src='/loading-animation.svg' alt='loading'/>
          </div>
        )}
      </div>
      <div className="input-container">
        <input
          className="chat-input"
          value={value}
          placeholder="Ask a question..."
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              getResponse();
            }
          }}
        />
        {error && <button className="clear-button" onClick={clear}>Clear</button>}
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default App;
