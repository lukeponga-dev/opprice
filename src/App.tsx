import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Loader2,
  Tag,
  AlertTriangle,
  ShieldCheck,
  Info,
  ChevronRight,
  Package,
  PawPrint,
  ShoppingBag,
  Camera,
  X,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { PricingAssistantService } from './services/PricingAssistant';
import type { ValuationResult, ResearchStatus } from './types';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<ResearchStatus>({ step: 'idle', message: '' });
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setShowScanner(false);
    stopCamera();
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowScanner(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure you have given permission.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
            processFile(capturedFile);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stream]); // Removed the problematic one-off dependency unless I refactor stopCamera

  const handleValuation = async () => {
    if (!file) return;

    setResult(null);

    const steps: ResearchStatus[] = [
      { step: 'analyzing', message: 'Analyzing item brand and model...' },
      { step: 'searching', message: 'Scanning Trade Me for sold listings...' },
      { step: 'searching', message: 'Benchmarking retail prices...' },
      { step: 'assessing', message: 'Calculating local demand indices...' },
      { step: 'finalizing', message: 'Generating optimal pricing strategy...' }
    ];

    for (const s of steps) {
      setStatus(s);
      await new Promise(r => setTimeout(r, 800));
    }

    try {
      const data = await PricingAssistantService.analyzeItem(file);
      setResult(data);
      setStatus({ step: 'idle', message: '' });

      if (data.ethicalCheck.status === 'Pass') {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#0ea5e9', '#f43f5e']
        });
      }
    } catch (error) {
      console.error(error);
      setStatus({ step: 'idle', message: 'Analysis failed.' });
    }
  };

  const getEthicalColor = (status: string) => {
    switch (status) {
      case 'Pass': return 'var(--accent-primary)';
      case 'Fail': return 'var(--error)';
      case 'Check Carefully': return 'var(--warning)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
    >
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.75rem' }}
        >
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.75rem', borderRadius: '16px' }}>
            <PawPrint className="text-primary" style={{ color: 'var(--accent-primary)' }} size={32} />
          </div>
          <h1>Price Scan</h1>
        </motion.div>
        <p className="subtitle">Turning donated goods into funds for animals in need</p>
      </header>

      <AnimatePresence mode="wait">
        {!result && status.step === 'idle' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {showScanner ? (
              <div className="scanner-container" style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', marginBottom: '2rem', background: '#000', aspectRatio: '4/3' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                <div className="scanner-overlay" style={{ position: 'absolute', inset: 0, border: '2px solid rgba(16, 185, 129, 0.3)', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '80%', height: '80%', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '20px' }} />
                </div>

                <div style={{ position: 'absolute', bottom: '1.5rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '1rem', padding: '0 1rem' }}>
                  <button
                    onClick={() => { setShowScanner(false); stopCamera(); }}
                    className="scanner-btn-secondary"
                    style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: 'none', padding: '0.75rem', borderRadius: '50%', color: 'white' }}
                  >
                    <X size={24} />
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="capture-btn"
                    style={{ background: 'white', border: 'none', padding: '1rem', borderRadius: '50%', color: '#000', boxShadow: '0 0 20px rgba(255,255,255,0.3)', transform: 'scale(1.2)' }}
                  >
                    <div style={{ padding: '4px', border: '2px solid #000', borderRadius: '50%' }}>
                      <Camera size={28} />
                    </div>
                  </button>
                  <button
                    onClick={startCamera}
                    className="scanner-btn-secondary"
                    style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: 'none', padding: '0.75rem', borderRadius: '50%', color: 'white' }}
                  >
                    <RefreshCw size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="upload-container">
                <label className="upload-zone">
                  <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                  {preview ? (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={preview}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                      />
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', padding: '0.5rem', borderRadius: '10px', backdropFilter: 'blur(8px)' }}
                      >
                        <Tag size={16} />
                      </motion.div>
                    </div>
                  ) : (
                    <>
                      <div className="upload-options" style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '20px', color: 'var(--accent-primary)' }}>
                          <ImageIcon size={48} />
                        </div>
                        <div style={{ borderLeft: '1px solid var(--card-border)', height: '80px', margin: 'auto' }} />
                        <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '1.5rem', borderRadius: '20px', color: 'var(--accent-secondary)' }}>
                          <Camera size={48} />
                        </div>
                      </div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Add Item Photo</h3>
                      <p style={{ color: 'var(--text-muted)' }}>Upload an image or use the camera to scan</p>
                    </>
                  )}
                </label>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                  {!preview && (
                    <button
                      className="button-secondary"
                      onClick={startCamera}
                      style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <Camera size={20} /> Use Camera
                    </button>
                  )}

                  {file && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="button-primary"
                      onClick={handleValuation}
                      style={{ flex: 2 }}
                    >
                      <Search size={20} />
                      Ask the Pawsistant
                    </motion.button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {status.step !== 'idle' && (
          <motion.div
            key="research"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="research-status"
          >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Loader2 className="spinner" size={48} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{status.message}</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['analyzing', 'searching', 'assessing', 'finalizing'].map((step, idx) => (
                <div
                  key={step}
                  className={`step-item ${status.step === step ? 'active' : ''} ${idx < ['analyzing', 'searching', 'assessing', 'finalizing'].indexOf(status.step) ? 'completed' : ''}`}
                >
                  {idx < ['analyzing', 'searching', 'assessing', 'finalizing'].indexOf(status.step) ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <div style={{ width: 18, height: 18, border: '2px solid currentColor', borderRadius: '50%', opacity: 0.3 }} />
                  )}
                  {step.charAt(0).toUpperCase() + step.slice(1)} phase
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="result-section"
          >
            <div className="result-header">
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                <ShieldCheck style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Valuation Report</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>NZ Market Analysis Complete</p>
              </div>
            </div>

            <div className="result-grid">
              <div className="data-row">
                <span className="data-label"><Package size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Item</span>
                <span className="data-value">{result.itemName}</span>
              </div>

              {/* Ethical Check Section */}
              <div className="condition-box" style={{ borderLeft: `4px solid ${getEthicalColor(result.ethicalCheck.status)}`, background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: getEthicalColor(result.ethicalCheck.status) }}>
                  <PawPrint size={14} /> 🐾 SPCA ETHICAL CHECK: {result.ethicalCheck.status.toUpperCase()}
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{result.ethicalCheck.message}</p>
              </div>

              <div className="data-row">
                <span className="data-label"><Search size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Market Status</span>
                <span className="data-value">{result.marketStatus}</span>
              </div>

              <div className="data-row">
                <span className="data-label"><ShoppingBag size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Online Resale Value</span>
                <span className="data-value">{PricingAssistantService.formatPrice(result.onlineResaleValue)} <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>(Trade Me)</span></span>
              </div>

              <div className="condition-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  <Info size={14} /> CONDITION & LOGIC
                </div>
                <p style={{ fontSize: '0.9rem' }}>"{result.conditionAssumption}"</p>
              </div>
            </div>

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="price-card"
              style={{ background: result.ethicalCheck.status === 'Fail' ? 'rgba(244, 63, 94, 0.1)' : undefined }}
            >
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: result.ethicalCheck.status === 'Fail' ? 'var(--error)' : 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <Tag size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                Recommended SPCA Price
              </span>
              <div className="price-target" style={{ color: result.ethicalCheck.status === 'Fail' ? 'var(--error)' : undefined }}>
                {PricingAssistantService.formatPrice(result.recommendedPrice)}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Priced for <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>7-day turnover</span> (30-40% of online resale)
              </p>

              {result.recommendedPrice > 50 && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,165,0,0.1)', color: 'var(--warning)', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'start' }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span><strong>High Value Item:</strong> Move to Manager. Listing on Trade Me may raise more funds.</span>
                </div>
              )}

              <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>💡 Sales Tip</span>
                <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>{result.salesTip}</p>
              </div>
            </motion.div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="data-label">Confidence:</span>
                <span className="data-value" style={{ fontSize: '0.875rem' }}>{result.confidenceLevel}</span>
              </div>
              <div className={`badge ${result.flag === 'No issues detected' ? 'badge-success' : 'badge-danger'}`}>
                {result.flag === 'No issues detected' ? <ShieldCheck size={12} /> : <AlertTriangle size={12} />}
                {result.flag}
              </div>
            </div>

            <button
              className="button-primary"
              style={{ marginTop: '2.5rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', boxShadow: 'none' }}
              onClick={() => {
                setResult(null);
                setPreview(null);
                setFile(null);
              }}
            >
              Scan Next Item
              <ChevronRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default App;
