import { useState } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import Uploader from './components/Uploader.jsx';
import CodeOutput from './components/CodeOutput.jsx';
import Preview from './components/Preview.jsx';

const STATES = {
  UPLOAD: 'upload',
  LOADING: 'loading',
  RESULT: 'result',
};

export default function App() {
  const [appState, setAppState] = useState(STATES.UPLOAD);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('code');
  const [errorMessage, setErrorMessage] = useState('');

  function handleUpload(file) {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage('');
  }

  async function handleGenerate() {
    if (!selectedFile) return;

    setAppState(STATES.LOADING);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      let response;
      try {
        response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        });
      } catch {
        throw new Error('Cannot reach the backend server. Start it with: cd backend && npm start');
      }

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(
          response.status === 0 || response.status >= 500
            ? 'Backend server is not running. Start it with: cd backend && OPENAI_API_KEY=your_key npm start'
            : `Server returned an unexpected response (HTTP ${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze screenshot.');
      }

      setResult(data);
      setActiveTab('code');
      setAppState(STATES.RESULT);
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong.');
      setAppState(STATES.UPLOAD);
    }
  }

  function handleReset() {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setErrorMessage('');
    setAppState(STATES.UPLOAD);
  }

  return (
    <div className="min-h-screen bg-[#18181b] text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Snap<span className="text-teal-400">To</span>Code
        </h1>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {appState === STATES.UPLOAD && (
          <div className="mx-auto max-w-xl">
            <h2 className="mb-2 text-center text-2xl font-semibold">
              Turn a screenshot into React code
            </h2>
            <p className="mb-8 text-center text-sm text-zinc-400">
              Upload any website screenshot and get production-ready React + Tailwind code.
            </p>

            <Uploader onUpload={handleUpload} selectedFile={selectedFile} />

            {errorMessage && (
              <p className="mt-4 text-center text-sm text-red-400">{errorMessage}</p>
            )}

            <button
              onClick={handleGenerate}
              disabled={!selectedFile}
              className="mt-6 w-full rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white transition-colors enabled:hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500"
            >
              Generate Code
            </button>
          </div>
        )}

        {appState === STATES.LOADING && (
          <div className="flex flex-col items-center justify-center gap-4 py-32">
            <Loader2 className="h-10 w-10 animate-spin text-teal-400" />
            <p className="text-lg font-medium text-zinc-200">Analyzing your screenshot...</p>
            <p className="text-sm text-zinc-400">
              GPT-4o is reading the design
              <span className="inline-block w-6 text-left">
                <span className="animate-pulse">...</span>
              </span>
            </p>
          </div>
        )}

        {appState === STATES.RESULT && result && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-xl border border-zinc-700">
                <img src={previewUrl} alt="Uploaded screenshot" className="w-full object-cover" />
              </div>

              <p className="text-sm text-zinc-300">{result.description}</p>

              {result.components?.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Components detected:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.components.map((component, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
                      >
                        {component}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleReset}
                className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-zinc-700 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Try Another
              </button>
            </div>

            <div className="flex h-[600px] flex-col">
              <div className="mb-3 flex gap-1 rounded-lg bg-zinc-800 p-1">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                    activeTab === 'code'
                      ? 'bg-teal-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Code
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-teal-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Preview
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                {activeTab === 'code' ? (
                  <CodeOutput code={result.code} />
                ) : (
                  <Preview code={result.code} />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
