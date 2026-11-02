import { useMemo, useState } from "react";

type Verse = {
  number: number;
  text: string;
};

const defaultPassage = [
  { number: 1, text: "In the beginning God created the heavens and the earth." },
  { number: 2, text: "The earth was without form and void, and darkness was over the face of the deep." },
  { number: 3, text: "And God said, 'Let there be light,' and there was light." },
];

const defaultModel = "llama3.1";

export default function App() {
  const [baseUrl, setBaseUrl] = useState("http://localhost:11434");
  const [model, setModel] = useState(defaultModel);
  const [prompt, setPrompt] = useState("Summarize this passage and explain how it applies to building a thoughtful product.");
  const [passage, setPassage] = useState<Verse[]>(defaultPassage);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const referenceText = useMemo(
    () => passage.map((verse) => `${verse.number}. ${verse.text}`).join("\n"),
    [passage],
  );

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          prompt: `You are a careful Bible study and coding assistant.\n\nUse the passage below as the primary source.\n\n${referenceText}\n\nUser request:\n${prompt}\n\nRespond in four sections: Summary, Key insight, Practical application, and Coding / research prompt.`,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const json = await response.json();
      const result = typeof json.response === "string" ? json.response : "No response returned.";
      setOutput(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to reach Ollama.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Seed Bible companion</p>
          <h1>Bible AI Coder</h1>
        </div>

        <div className="config-grid">
          <label>
            Ollama URL
            <input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} />
          </label>

          <label>
            Model
            <input value={model} onChange={(event) => setModel(event.target.value)} />
          </label>
        </div>
      </section>

      <section className="layout-grid">
        <div className="panel">
          <h2>Passage</h2>
          <div className="passage-list">
            {passage.map((verse) => (
              <p key={verse.number}>
                <strong>{verse.number}.</strong> {verse.text}
              </p>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Prompt</h2>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={8}
            placeholder="Ask for a summary, application, explanation, or coding insight."
          />

          <button onClick={handleGenerate} disabled={loading}>
            {loading ? "Thinking..." : "Generate insight"}
          </button>

          {error ? <div className="error-box">{error}</div> : null}
        </div>
      </section>

      <section className="panel output-panel">
        <h2>AI output</h2>
        <pre>{output || "No output yet."}</pre>
      </section>
    </main>
  );
}
