import { useEffect, useState } from "react";

export default function Sidebar() {
  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState([]);

  const fetchSkills = async () => {
    const res = await fetch("https://akashkishan-prodvis-ai-backend.hf.space/skills");
    const data = await res.json();
    setSkills(data);
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const upload = async () => {
    const form = new FormData();
    form.append("file", file);

    await fetch("https://akashkishan-prodvis-ai-backend.hf.space/upload-skill", {
      method: "POST",
      body: form
    });

    fetchSkills();
  };

  const toggle = async (id) => {
    await fetch("https://akashkishan-prodvis-ai-backend.hf.space/toggle-skill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id })
    });

    fetchSkills();
  };

  return (
    <div className="w-64 bg-gray-900 text-white p-4">
      <h2 className="mb-3">Skills ⚙️</h2>

      <input
        type="file"
        accept=".zip"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        onClick={upload}
        className="bg-yellow-400 text-black w-full mt-2 p-1 rounded"
      >
        Upload
      </button>

      <div className="mt-4 space-y-2">
        {skills.map(s => (
          <div key={s.id} className="flex justify-between bg-gray-800 p-2 rounded">
            <span>{s.name}</span>
            <button
              onClick={() => toggle(s.id)}
              className={s.enabled ? "text-green-400" : "text-red-400"}
            >
              {s.enabled ? "ON" : "OFF"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}