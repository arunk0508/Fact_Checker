import { useRef, useState, useCallback } from 'react'

export default function UploadZone({ file, onFile }) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef()

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') onFile(f)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDrag(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      className={[
        'relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200',
        drag       ? 'border-teal bg-teal/5'                   : '',
        file       ? 'border-verdant bg-verdant/5 border-solid' : '',
        !drag && !file ? 'border-slate-300 bg-white hover:border-teal hover:bg-teal/5' : '',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      <div className="text-5xl mb-3">{file ? '📄' : '📂'}</div>

      {file ? (
        <>
          <p className="font-bold text-verdant text-lg">PDF Ready!</p>
          <p className="font-mono text-sm text-teal-dark mt-1 font-bold">{file.name}</p>
          <p className="text-slate-400 text-xs mt-2">Click to replace</p>
        </>
      ) : (
        <>
          <p className="font-bold font-display text-navy text-lg">Drop your PDF here</p>
          <p className="text-slate-400 text-sm mt-1">or click to browse · PDF files only</p>
        </>
      )}
    </div>
  )
}
