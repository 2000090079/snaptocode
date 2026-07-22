import { useRef, useState } from 'react';
import { UploadCloud, FileImage } from 'lucide-react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function Uploader({ onUpload, selectedFile }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  function validateAndUpload(file) {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Use JPG, PNG, WebP, or GIF.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Max size is 5MB.');
      return;
    }

    setError('');
    onUpload(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    validateAndUpload(file);
  }

  function handleBrowseClick() {
    inputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    validateAndUpload(file);
  }

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-8 py-16 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-teal-400 bg-teal-500/10'
            : 'border-zinc-600 bg-zinc-800/40 hover:border-zinc-500'
        }`}
      >
        <UploadCloud className="h-12 w-12 text-zinc-400" />
        <div>
          <p className="text-lg font-medium text-zinc-200">Drop your screenshot here</p>
          <p className="mt-1 text-sm text-zinc-400">or click to browse</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleBrowseClick();
          }}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 transition-colors"
        >
          Browse files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {selectedFile && !error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-zinc-300">
          <FileImage className="h-4 w-4 text-teal-400" />
          <span>{selectedFile.name}</span>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <p className="mt-4 text-center text-xs text-zinc-500">
        Works with any website screenshot
      </p>
    </div>
  );
}
