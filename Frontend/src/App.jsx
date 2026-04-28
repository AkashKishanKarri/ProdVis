import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Copy, Check, Flashlight, Zap, Brain } from "lucide-react";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! Paste the text below, and  paraphrase it for you." }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsGenerating(true);

    const botMsg = { role: "ai", text: "" };
    setMessages(prev => [...prev, botMsg]);

    let botIndex = -1;

    try {
      const response = await fetch("https://akashkishan-prodvis-ai-backend.hf.space/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg.text })
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value || new Uint8Array());
        fullText += chunk;

        setMessages(prev => {
          if (botIndex === -1) {
            botIndex = prev.length - 1;
          }
          const updated = [...prev];
          updated[botIndex] = { role: "ai", text: fullText };
          return updated;
        });
      }
    } catch (e) {
      setMessages(prev => {
        if (botIndex === -1) botIndex = prev.length - 1;
        const updated = [...prev];
        updated[botIndex] = { role: "ai", text: "Error connecting to AI Paraphraser API..." };
        return updated;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app" style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden' }}>
      {/* Background Layers */}
      <div className="bg-layer active bg-d0"></div>
      <div className="bg-overlay"></div>

      {/* Animated Blobs */}
      <div className="blob b1"></div>
      <div className="blob b2"></div>
      <div className="blob b3"></div>
      <div className="stars"></div>

      <div className="main" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: "relative", zIndex: 20, minWidth: 0, minHeight: 0 }}>
        <div className="topbar">
          <div className="topbar-avatar" style={{ overflow: 'hidden' }}>
            <img src="/src/images/images-removebg-preview.png" alt="logo" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          </div>
          <div className="topbar-info">
            <div className="topbar-title">ProdVis-AI</div>
            <div className="topbar-status">
              <span className="status-dot"></span>
              System Online — Ready to paraphrase text
            </div>
          </div>
        </div>

        <div className="chat-messages" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="msg-av" style={{ overflow: 'hidden' }}>
                {m.role === 'ai' ? <img src="/src/images/images-removebg-preview.png" alt="ai" style={{ width: '16px', height: '16px', objectFit: 'contain' }} /> : <Brain size={14} color="white" />}
              </div>
              <div className="bubble">
                {m.role === 'ai' && <div className="bubble-mode skill"><span className="bubble-mode-dot"></span>Paraphraser Mode</div>}
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {m.text || (isGenerating && i === messages.length - 1 ? <div className="typing-dots"><span></span><span></span><span></span></div> : "")}
                </div>
                {m.role === 'ai' && !isGenerating && m.text && (
                  <button
                    onClick={() => handleCopy(m.text, i)}
                    style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  >
                    {copiedIndex === i ? <Check size={14} color="#4ade80" /> : <Copy size={14} color="white" />}
                    <span style={{ color: copiedIndex === i ? "#4ade80" : "white", fontWeight: 500 }}>{copiedIndex === i ? "Copied to clipboard!" : "Copy Paraphrased Text"}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="input-wrap">
          <div className="input-row">
            <textarea
              className="chat-input"
              placeholder="Paste text here to paraphrase... (Shift+Enter for newline)"
              rows={4}
              style={{ overflowY: "auto", minHeight: "80px", maxHeight: "250px" }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={sendMessage}
              disabled={isGenerating || !input.trim()}
              className="send-btn"
            >
              <svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}