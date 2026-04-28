import { useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);

    const botMsg = { role: "bot", text: "" };
    setMessages(prev => [...prev, botMsg]);

    const index = messages.length + 1;

    const response = await fetch("https://akashkishan-prodvis-ai-backend.hf.space/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: input })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let done = false;
    let fullText = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;

      const chunk = decoder.decode(value || new Uint8Array());
      fullText += chunk;

      setMessages(prev => {
        const updated = [...prev];
        updated[index] = { role: "bot", text: fullText };
        return updated;
      });
    }

    setInput("");
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-950 text-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl max-w-xl ${m.role === "user"
              ? "bg-yellow-400 text-black ml-auto"
              : "bg-gray-800"
              }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="p-4 flex gap-2 border-t border-gray-800">
        <input
          className="flex-1 p-2 rounded bg-gray-800"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={sendMessage}
          className="bg-yellow-400 px-4 rounded text-black"
        >
          Send
        </button>
      </div>
    </div>
  );
}