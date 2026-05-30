import React, { useState, useRef, useCallback } from 'react';

// ── LSB Steganography Engine ───────────────────────────────────────

/** Encode text into image pixel LSBs using Canvas */
function encodeMessage(imageData, message) {
  const data = new Uint8ClampedArray(imageData.data);
  const msgBytes = new TextEncoder().encode(message + '\0'); // null-terminated

  // Store message length in first 32 bits (4 pixels × 1 bit each in R channel LSB)
  const totalBits = msgBytes.length * 8;
  if (totalBits + 32 > data.length / 4 * 3) {
    throw new Error('Image too small to encode this message.');
  }

  let bitIndex = 0;

  const setBit = (byteVal, bit) => (bit ? byteVal | 1 : byteVal & ~1);

  // Encode 32-bit length header
  for (let i = 0; i < 32; i++) {
    const pixelOffset = Math.floor(i / 3) * 4 + (i % 3);
    const bit = (msgBytes.length >> (31 - i)) & 1;
    data[pixelOffset] = setBit(data[pixelOffset], bit);
  }

  bitIndex = 32;

  // Encode message bits
  for (let byteIdx = 0; byteIdx < msgBytes.length; byteIdx++) {
    for (let bitPos = 7; bitPos >= 0; bitPos--) {
      const bit = (msgBytes[byteIdx] >> bitPos) & 1;
      const pixelOffset = Math.floor(bitIndex / 3) * 4 + (bitIndex % 3);
      data[pixelOffset] = setBit(data[pixelOffset], bit);
      bitIndex++;
    }
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/** Decode text from image pixel LSBs */
function decodeMessage(imageData) {
  const data = imageData.data;

  // Read 32-bit length header
  let msgLength = 0;
  for (let i = 0; i < 32; i++) {
    const pixelOffset = Math.floor(i / 3) * 4 + (i % 3);
    msgLength = (msgLength << 1) | (data[pixelOffset] & 1);
  }

  if (msgLength <= 0 || msgLength > 100000) {
    return null; // No valid message
  }

  const msgBytes = new Uint8Array(msgLength);
  let bitIndex = 32;

  for (let byteIdx = 0; byteIdx < msgLength; byteIdx++) {
    let byte = 0;
    for (let bitPos = 7; bitPos >= 0; bitPos--) {
      const pixelOffset = Math.floor(bitIndex / 3) * 4 + (bitIndex % 3);
      byte = (byte << 1) | (data[pixelOffset] & 1);
      bitIndex++;
    }
    msgBytes[byteIdx] = byte;
  }

  const decoded = new TextDecoder().decode(msgBytes).replace(/\0.*$/, ''); // strip null terminator
  return decoded;
}

// ── Fake Progress Bar Component ────────────────────────────────────

function ProgressBar({ progress, label }) {
  return (
    <div className="lab-progress">
      <div className="lab-progress__label">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div className="lab-progress__bar-bg">
        <div className="lab-progress__bar-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

// ── Lab Page ───────────────────────────────────────────────────────

export default function Lab() {
  const [tab, setTab] = useState('encode'); // 'encode' | 'decode'
  const [image, setImage] = useState(null);       // { file, preview, imageData, width, height }
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);     // { type: 'encoded'|'decoded', data, text }
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Load image into canvas and extract ImageData
  const loadImage = useCallback((file) => {
    if (!file?.type?.startsWith('image/')) {
      setError('Please upload a valid image file (PNG recommended for lossless encoding).');
      return;
    }
    setError('');
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target.result;
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setImage({ file, preview, imageData, width: canvas.width, height: canvas.height });
      };
      img.src = preview;
    };
    reader.readAsDataURL(file);
  }, []);

  const onFileInput = (e) => { if (e.target.files[0]) loadImage(e.target.files[0]); };
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) loadImage(e.dataTransfer.files[0]);
  };

  // Simulate expanding progress bar with async freeze
  const runProgressAnim = async () => {
    setProgress(0);
    setProcessing(true);

    // Stage 1: fast to 70
    for (let p = 0; p <= 70; p += 5) {
      setProgress(p);
      await new Promise((r) => setTimeout(r, 30));
    }
    // Stage 2: slow crawl (stutter)
    for (let p = 70; p <= 88; p += 1) {
      setProgress(p);
      await new Promise((r) => setTimeout(r, 60 + Math.random() * 80));
    }
    // Stage 3: freeze at 88 briefly (suspense)
    await new Promise((r) => setTimeout(r, 600));
    // Stage 4: burst to 100
    for (let p = 88; p <= 100; p += 2) {
      setProgress(p);
      await new Promise((r) => setTimeout(r, 20));
    }
  };

  const handleProcess = async () => {
    if (!image) { setError('Upload an image first.'); return; }
    setError('');
    setResult(null);

    if (tab === 'encode') {
      if (!message.trim()) { setError('Enter a secret message to encode.'); return; }

      await runProgressAnim();

      try {
        const encoded = encodeMessage(image.imageData, message.trim());
        // Write back to canvas and export PNG
        const canvas = document.createElement('canvas');
        canvas.width  = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(encoded, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        setResult({ type: 'encoded', dataUrl });
      } catch (e) {
        setError(e.message);
      }
    } else {
      if (!image.imageData) { setError('No image data available.'); return; }

      await runProgressAnim();

      try {
        const decoded = decodeMessage(image.imageData);
        if (!decoded) {
          setError('No hidden message found in this image — or it was encoded elsewhere.');
        } else {
          setResult({ type: 'decoded', text: decoded });
        }
      } catch (e) {
        setError('Decoding failed: ' + e.message);
      }
    }

    setProcessing(false);
  };

  const downloadEncoded = () => {
    if (!result?.dataUrl) return;
    const a = document.createElement('a');
    a.href     = result.dataUrl;
    a.download = 'paradox-stego.png';
    a.click();
  };

  return (
    <div className="lab-page" role="main">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header */}
      <div className="lab-header">
        <div className="lab-header__badge">Classified / Beta</div>
        <h1>Steganography Lab</h1>
        <p>
          Hide secrets inside images using Least Significant Bit (LSB) encoding.
          Zero metadata. Zero traces. Pure pixel manipulation.
          <br />
          <span style={{ color: 'var(--rust)' }}>// Use PNG for encoding. JPEG compression destroys hidden data.</span>
        </p>
      </div>

      {/* Main Panel */}
      <div className="lab-panel">
        <div className="lab-panel__title">LSB Processor</div>

        {/* Mode Tabs */}
        <div className="lab-tabs" role="tablist">
          {['encode', 'decode'].map((t) => (
            <button
              key={t}
              className={`lab-tab${tab === t ? ' active' : ''}`}
              role="tab"
              aria-selected={tab === t}
              onClick={() => { setTab(t); setResult(null); setError(''); setProgress(0); setProcessing(false); }}
            >
              {t === 'encode' ? 'ENCODE →' : '← DECODE'}
            </button>
          ))}
        </div>

        {/* Upload Zone */}
        <div
          className={`lab-upload-zone${dragOver ? ' drag-over' : ''}`}
          onClick={() => !processing && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={!processing ? onDrop : undefined}
          role="button"
          tabIndex={0}
          aria-label="Upload image"
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileInput} disabled={processing} />
          {image ? (
            <>
              <img src={image.preview} alt="Loaded" className="lab-upload-zone__preview" />
              <p className="lab-upload-zone__label">
                {image.width} × {image.height}px ·{' '}
                {(image.imageData.data.length / 8 / 1024).toFixed(0)}KB capacity
                <br />
                <span style={{ color: 'rgba(200,75,49,0.7)' }}>Click to change</span>
              </p>
            </>
          ) : (
            <>
              <p style={{ color: 'rgba(249,248,245,0.5)', marginBottom: '0.5rem', fontSize: '2rem' }}>⬡</p>
              <p style={{ color: 'rgba(249,248,245,0.5)', fontSize: '0.85rem' }}>
                Drop an image or click to upload
              </p>
              <p className="lab-upload-zone__label">PNG, JPG, WEBP supported</p>
            </>
          )}
        </div>

        {/* Message Input (encode only) */}
        {tab === 'encode' && (
          <>
            <div style={{ marginBottom: '0.4rem', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(249,248,245,0.3)' }}>
              // secret_message
            </div>
            <textarea
              className="lab-input"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="The message to hide inside the image…"
              disabled={processing}
              maxLength={5000}
            />
            <div style={{ fontSize: '0.65rem', color: 'rgba(249,248,245,0.2)', textAlign: 'right', marginTop: '-1rem', marginBottom: '1rem' }}>
              {message.length}/5000 chars
            </div>
          </>
        )}

        {/* Process Button */}
        <button
          className="btn btn--rust"
          style={{ width: '100%', padding: '1rem', fontSize: '0.78rem', letterSpacing: '0.15em' }}
          onClick={handleProcess}
          disabled={processing || !image}
        >
          {processing
            ? 'PROCESSING…'
            : tab === 'encode'
            ? 'ENCODE MESSAGE → PROCESS'
            : 'SCAN FOR HIDDEN DATA'}
        </button>

        {/* Progress Bar */}
        {(processing || progress > 0) && (
          <ProgressBar
            progress={progress}
            label={processing ? 'Manipulating pixels…' : 'Process complete'}
          />
        )}

        {/* Error */}
        {error && (
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--rust)', fontSize: '0.78rem', marginTop: '1rem' }}>
            // ERROR: {error}
          </p>
        )}

        {/* Result */}
        {result && (
          <div className="lab-result">
            <div className="lab-result__label">
              {result.type === 'encoded' ? 'ENCODING SUCCESSFUL' : 'MESSAGE EXTRACTED'}
            </div>
            {result.type === 'encoded' ? (
              <>
                <p className="lab-result__text" style={{ marginBottom: '1rem' }}>
                  Message hidden in {image.width}×{image.height} image.
                  The output is visually identical to the original.
                </p>
                <button className="btn btn--rust" onClick={downloadEncoded}>
                  Download Encoded Image (PNG)
                </button>
              </>
            ) : (
              <p className="lab-result__text">{result.text}</p>
            )}
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="lab-panel" style={{ background: 'rgba(26,26,26,0.5)', border: '1px solid rgba(249,248,245,0.05)' }}>
        <div className="lab-panel__title">How it works</div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'rgba(249,248,245,0.45)', lineHeight: 1.8 }}>
          Each pixel in an image has R, G, B channels (0–255). By flipping the least
          significant bit (bit 0) of each channel, we can hide 3 bits per pixel.
          The color change is imperceptible to the human eye (±1 in 256 values).
          A 1000×1000 image can store approximately 375,000 characters of hidden text.
          <br /><br />
          <span style={{ color: 'var(--rust)' }}>WARNING:</span> JPEG compression destroys LSB data.
          Always encode into PNG. Never re-save as JPEG after encoding.
        </p>
      </div>
    </div>
  );
}
