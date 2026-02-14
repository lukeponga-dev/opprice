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
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
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

  useEffect(() => {
    if (showScanner && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [showScanner, stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Use the actual video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        // Draw the current frame from the video
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to blob and then to File object
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
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card"
    >
      <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}
        >
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '10px',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <PawPrint className="text-primary" size={24} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--accent-primary)'
          }}>SPCA NZ Official</span>
        </motion.div>

        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Price Scan
        </motion.h1>
        <motion.p
          className="subtitle"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Valuing donations to protect animals
        </motion.p>
      </header>

      <AnimatePresence mode="wait">
        {!result && status.step === 'idle' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {showScanner ? (
              <div className="scanner-container" style={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', marginBottom: '2rem', background: '#000', aspectRatio: '4/3', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                <div className="scanner-overlay">
                  <div className="scanner-box">
                    <div className="scanner-line" />
                    <div className="scanner-corner scanner-corner-tl" />
                    <div className="scanner-corner scanner-corner-tr" />
                    <div className="scanner-corner scanner-corner-bl" />
                    <div className="scanner-corner scanner-corner-br" />
                  </div>
                </div>

                <div style={{ position: 'absolute', bottom: '2rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '1.5rem', padding: '0 2rem' }}>
                  <button
                    onClick={() => { setShowScanner(false); stopCamera(); }}
                    className="scanner-btn-secondary"
                    style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '50%', color: 'white', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="capture-btn"
                    style={{ background: 'white', border: 'none', padding: '1.25rem', borderRadius: '50%', color: '#000', boxShadow: '0 0 30px rgba(255,255,255,0.4)', transform: 'scale(1.1)', cursor: 'pointer' }}
                  >
                    <Camera size={28} fill="currentColor" />
                  </button>
                  <button
                    onClick={startCamera}
                    className="scanner-btn-secondary"
                    style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '50%', color: 'white', cursor: 'pointer' }}
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="upload-container">
                <label className="upload-zone" style={{ minHeight: '320px' }}>
                  <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                  {preview ? (
                    <motion.div
                      key="preview"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}
                    >
                      <img
                        src={preview}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '320px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid var(--card-border)' }}
                      />
                      <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', padding: '0.6rem', borderRadius: '12px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Tag size={18} style={{ color: 'var(--accent-primary)' }} />
                      </div>
                    </motion.div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div className="upload-options" style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', alignItems: 'center' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1.5rem', borderRadius: '24px', color: 'var(--accent-primary)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                          <ImageIcon size={42} />
                        </div>
                        <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />
                        <div style={{ background: 'rgba(14, 165, 233, 0.08)', padding: '1.5rem', borderRadius: '24px', color: 'var(--accent-secondary)', border: '1px solid rgba(14, 165, 233, 0.1)' }}>
                          <Camera size={42} />
                        </div>
                      </div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'Outfit' }}>Scan a Donation</h3>
                      <p style={{ color: 'var(--text-muted)', maxWidth: '280px', margin: '0 auto' }}>Drop an image or use your camera to get a price recommendation</p>
                    </div>
                  )}
                </label>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  {!preview && (
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="button-secondary"
                      onClick={startCamera}
                      style={{ flex: 1, height: '60px' }}
                    >
                      <Camera size={20} /> Live Scanner
                    </motion.button>
                  )}

                  {file && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="button-primary"
                      onClick={handleValuation}
                      style={{ flex: 2, height: '60px' }}
                    >
                      <Search size={22} />
                      Analyze Item
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
          >
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 2rem' }}>
                <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(16, 185, 129, 0.1)', borderRadius: '50%' }} />
                <Loader2 className="spinner" size={80} style={{ color: 'var(--accent-primary)' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Search size={24} style={{ opacity: 0.5 }} />
                </div>
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'Outfit' }}>Analyzing Data</h3>
              <p style={{ color: 'var(--text-muted)' }}>{status.message}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px', margin: '0 auto' }}>
              {['analyzing', 'searching', 'assessing', 'finalizing'].map((step, idx) => {
                const stepIndex = ['analyzing', 'searching', 'assessing', 'finalizing'].indexOf(status.step);
                const isCompleted = idx < stepIndex;
                const isActive = status.step === step;

                return (
                  <motion.div
                    key={step}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  >
                    <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isCompleted ? (
                        <CheckCircle2 size={20} style={{ color: 'var(--accent-primary)' }} />
                      ) : isActive ? (
                        <RefreshCw size={18} className="spinner" />
                      ) : (
                        <div style={{ width: 8, height: 8, background: 'currentColor', borderRadius: '50%', opacity: 0.2 }} />
                      )}
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: isActive ? 600 : 400 }}>
                      {step === 'analyzing' && 'Visual Recognition'}
                      {step === 'searching' && 'Market Price Check'}
                      {step === 'assessing' && 'Demand Assessment'}
                      {step === 'finalizing' && 'Strategy Generation'}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="result-section"
          >
            <div className="result-header">
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <ShieldCheck style={{ color: 'var(--accent-primary)' }} size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Outfit' }}>Valuation Report</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>NZ MARKET ANALYSIS • READY</p>
              </div>
            </div>

            <div className="result-grid">
              <div className="data-row">
                <span className="data-label"><Package size={16} /> Item Identity</span>
                <span className="data-value">{result.itemName}</span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="condition-box"
                style={{
                  borderLeft: `4px solid ${getEthicalColor(result.ethicalCheck.status)}`,
                  background: result.ethicalCheck.status === 'Pass' ? 'rgba(16, 185, 129, 0.03)' : 'rgba(244, 63, 94, 0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.75rem', fontWeight: 800, color: getEthicalColor(result.ethicalCheck.status), textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <PawPrint size={14} /> SPCA Ethical Status: {result.ethicalCheck.status}
                </div>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-primary)', fontStyle: 'normal', margin: 0 }}>{result.ethicalCheck.message}</p>
              </motion.div>

              <div className="data-row">
                <span className="data-label"><ShoppingBag size={16} /> Online Value (Est)</span>
                <span className="data-value">{PricingAssistantService.formatPrice(result.onlineResaleValue)}</span>
              </div>

              <div className="condition-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <Info size={14} /> Condition Observation
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>"{result.conditionAssumption}"</p>
              </div>
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="price-card"
              style={{ background: result.ethicalCheck.status === 'Fail' ? 'rgba(244, 63, 94, 0.1)' : undefined }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Tag size={16} style={{ color: result.ethicalCheck.status === 'Fail' ? 'var(--error)' : 'var(--accent-primary)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: result.ethicalCheck.status === 'Fail' ? 'var(--error)' : 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  Recommended SPCA Price
                </span>
              </div>
              <div className="price-target" style={{ color: result.ethicalCheck.status === 'Fail' ? 'var(--error)' : undefined }}>
                {PricingAssistantService.formatPrice(result.recommendedPrice)}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Targeting <span style={{ color: 'var(--text-primary)' }}>7-day shell time</span> to maximize floor revenue
              </p>

              {result.recommendedPrice > 50 && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.08)', color: 'var(--warning)', fontSize: '0.85rem', display: 'flex', gap: '12px', alignItems: 'center', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                  <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                  <span style={{ textAlign: 'left', lineHeight: '1.4' }}><strong>High-Value Item:</strong> Move to Manager's attention. Online Trade Me listing may be preferred.</span>
                </div>
              )}

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>💡 PRO SALES TIP</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>{result.salesTip}</p>
              </div>
            </motion.div>

            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Reliability:</span>
                <span className={`badge ${result.confidenceLevel === 'High' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                  {result.confidenceLevel.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={14} />
                {result.flag}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="button-primary"
              style={{ marginTop: '3rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--card-border)', boxShadow: 'none' }}
              onClick={() => {
                setResult(null);
                setPreview(null);
                setFile(null);
              }}
            >
              Scan New Donation
              <ChevronRight size={20} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default App;
