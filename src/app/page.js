'use client';

import { useState, useCallback, useEffect } from 'react';
import CameraView from './components/CameraView';
import { predictStatic, predictDynamic, predictWords, predictHolistic, clearWordBuffer, clearHolisticBuffer, getWordBufferStats, getStatus } from '@/lib/api';

const MODES = [
  { id: 'static', label: 'Letras Estáticas (A-Z)', shortLabel: 'Deletrear', icon: '✋', endpoint: predictStatic, allowSpelling: true },
  { id: 'dynamic', label: 'Letras Dinámicas', shortLabel: 'Dinámicas', icon: '👋', endpoint: predictDynamic, allowSpelling: true },
  { id: 'words', label: 'LSM Palabras', shortLabel: 'Palabras', icon: '💬', endpoint: predictWords, allowSpelling: false },
  { id: 'holistic', label: 'Vocabulario Médico', shortLabel: 'Médico', icon: '🏥', endpoint: predictHolistic, allowSpelling: false },
];

export default function SignSpeakApp() {
  const [activeModeId, setActiveModeId] = useState('static');
  const [apiStatus, setApiStatus] = useState('checking'); // checking | online | error
  
  const [currentPred, setCurrentPred] = useState(null); // { text, confidence, type, accepted? }
  const [spelledWord, setSpelledWord] = useState('');
  const [phrase, setPhrase] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bufferStats, setBufferStats] = useState(null);

  const activeMode = MODES.find(m => m.id === activeModeId);

  // Verificación del backend
  useEffect(() => {
    let mounted = true;
    const checkServer = async () => {
      try {
        await getStatus();
        if (mounted) setApiStatus('online');
      } catch (err) {
        if (mounted) setApiStatus('error');
      }
    };
    checkServer();
    const intv = setInterval(checkServer, 10000);
    return () => { mounted = false; clearInterval(intv); };
  }, []);

  // Manejo de predicciones estáticas Frame-by-Frame
  const handleLandmarks = useCallback(async (landmarks) => {
    if (activeModeId !== 'static' || isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await predictStatic(landmarks);
      setCurrentPred({ text: res.letter, confidence: res.confidence, type: 'static' });
    } catch {
      // Ignoramos errores transitorios por frame (ej. 422)
    } finally {
      setIsProcessing(false);
    }
  }, [activeModeId, isProcessing]);

  // Manejo de buffers de 15 frames
  const handleSequence = useCallback(async (sequence) => {
    if (activeModeId === 'static' || isProcessing) return;
    setIsProcessing(true);
    try {
      if (activeModeId === 'dynamic') {
        const res = await predictDynamic(sequence);
        setCurrentPred({ text: res.letter, confidence: res.confidence, type: 'dynamic' });
      } else if (activeModeId === 'words') {
        const res = await predictWords(sequence);
        setCurrentPred({ 
          text: res.word, 
          confidence: res.confidence, 
          type: 'words',
          accepted: res.accepted
        });
        if (res.phrase !== undefined) {
          setPhrase(res.phrase);
        }
      }
    } catch {
       // Ignoramos timeout/422 momentáneo
    } finally {
      setIsProcessing(false);
    }
  }, [activeModeId, isProcessing]);

  // Manejo de predicción holística (médica)
  const handleHolistic = useCallback(async (vector) => {
    if (activeModeId !== 'holistic' || isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await predictHolistic(vector);
      setCurrentPred({ 
        text: res.word, 
        confidence: res.confidence, 
        type: 'holistic',
        accepted: res.accepted
      });
      if (res.phrase !== undefined) {
        setPhrase(res.phrase);
      }
    } catch {
       // Ignoramos timeout/422 momentáneo
    } finally {
      setIsProcessing(false);
    }
  }, [activeModeId, isProcessing]);

  // Cambio de modo
  const handleModeChange = (id) => {
    setActiveModeId(id);
    setCurrentPred(null);
    setPhrase('');
    setBufferStats(null);
    if (id === 'words') {
      clearWordBuffer().catch(()=>{}).then(() => setPhrase(''));
    }
    if (id === 'holistic') {
      clearHolisticBuffer().catch(()=>{}).then(() => setPhrase(''));
    }
  };

  // Traer estadísticas periódicamente
  useEffect(() => {
    if (activeModeId !== 'words') {
      setBufferStats(null);
      return;
    }
    let mounted = true;
    const fetchStats = async () => {
      try {
        const stats = await getWordBufferStats();
        if (mounted) setBufferStats(stats);
      } catch (err) {}
    };
    fetchStats();
    const intv = setInterval(fetchStats, 3000);
    return () => { mounted = false; clearInterval(intv); };
  }, [activeModeId, phrase]);

  return (
    <>
      <header className="header">
        <div className="header-logo">
          <div className="logo-icon">S</div>
          <div>SignSpeak</div>
        </div>
        <div className="status-badge">
          <div className={`status-dot ${apiStatus}`} />
          API: {apiStatus === 'online' ? 'Conectado' : apiStatus === 'checking' ? 'Buscando...' : 'Desconectado'}
        </div>
      </header>
      
      <main className="container main-layout">
        <div className="content-area">
          <div className="mode-tabs">
            {MODES.map(m => (
              <button 
                key={m.id} 
                className={`mode-tab ${activeModeId === m.id ? 'active' : ''}`}
                onClick={() => handleModeChange(m.id)}
              >
                <div className="tab-icon">{m.icon}</div>
                <div>{m.shortLabel}</div>
              </button>
            ))}
          </div>

          <div className="mode-info">
            <div className="info-icon">ℹ️</div>
            <div>
              {activeModeId === 'static' && "Modo Estático: Letras del alfabeto sin movimiento (A-Z). Mantén la pose de la mano."}
              {activeModeId === 'dynamic' && "Modo Dinámico: Letras que requieren un movimiento específico (J, K, Q, X, Z, Ñ)."}
              {activeModeId === 'words' && "Palabras LSM: Realiza el gesto de la palabra. El sistema agrupa frases automáticamente."}
              {activeModeId === 'holistic' && "Vocabulario Médico: Utiliza ambas manos y el pecho. Muestra signos médicos de manera holística."}
            </div>
          </div>

          <section className="camera-section">
             <CameraView 
               mode={activeModeId}
               active={true}
               onLandmarks={handleLandmarks}
               onSequenceReady={handleSequence}
               onHolisticReady={handleHolistic}
             />
          </section>
        </div>

        <aside className="sidebar">
          <div className="card">
            <h3 className="card-title">Resultado En Vivo</h3>
            <div className="result-big">
               {currentPred ? (
                 <>
                   {activeModeId === 'words' ? (
                     <div className="result-word">{currentPred.text}</div>
                   ) : (
                     <div className="result-letter">{currentPred.text}</div>
                   )}
                   <div className="result-type">
                     {currentPred.type.toUpperCase()}
                     {currentPred.accepted !== undefined && (
                        <span className={`accepted-tag ${currentPred.accepted ? 'yes' : 'no'}`} style={{marginLeft: 8}}>
                          {currentPred.accepted ? '✓ Agregado' : '× Ignorado'}
                        </span>
                     )}
                   </div>
                 </>
               ) : (
                 <div className="result-word" style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>
                   Esperando...
                 </div>
               )}
            </div>
            
            <div className="confidence-wrap">
              <div className="confidence-label">
                <span>Certeza del modelo</span>
                <span>{currentPred ? (currentPred.confidence || 0).toFixed(1) : 0}%</span>
              </div>
              <div className="confidence-bar">
                <div className="confidence-fill" style={{ width: `${currentPred ? (currentPred.confidence || 0) : 0}%` }} />
              </div>
            </div>
          </div>

          {activeMode.allowSpelling ? (
            <div className="card">
              <h3 className="card-title">Constructor de Palabras</h3>
              <div className="spelled-wrap">
                <div className="spelled-box">
                  {spelledWord || <span className="phrase-empty">Presiona "Agregar" para formar tu palabra...</span>}
                </div>
              </div>
              <div className="phrase-actions">
                 <button 
                   className="btn btn-primary" 
                   onClick={() => setSpelledWord(w => w + (currentPred?.text || ''))}
                   disabled={!currentPred || (currentPred.type !== 'static' && currentPred.type !== 'dynamic')}
                 >
                    + Agregar '{currentPred ? currentPred.text : ''}'
                 </button>
                 <button 
                   className="btn btn-ghost" 
                   onClick={() => setSpelledWord(w => w.slice(0, -1))}
                   disabled={!spelledWord}
                 >
                    -
                 </button>
                 <button 
                   className="btn btn-danger" 
                   onClick={() => setSpelledWord('')}
                   disabled={!spelledWord}
                 >
                    Borrar Todo
                 </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <h3 className="card-title">Frase Traducida (BETA)</h3>
              <div className="phrase-box">
                {phrase || <span className="phrase-empty">El backend acumulará tus frases aquí en tiempo real...</span>}
              </div>
              <div className="phrase-actions">
                 <button 
                   className="btn btn-danger" 
                   onClick={async () => {
                     try { 
                       if (activeModeId === 'words') await clearWordBuffer(); 
                       if (activeModeId === 'holistic') await clearHolisticBuffer(); 
                     } catch(e){}
                     setPhrase('');
                     setCurrentPred(null);
                   }}
                 >
                    Borrar Frase
                 </button>
              </div>
            </div>
          )}

          {bufferStats && (
            <div className="card">
              <h3 className="card-title">Estadísticas del Buffer</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{bufferStats.total_received || 0}</div>
                  <div className="stat-label">Recibidos</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{bufferStats.total_accepted || 0}</div>
                  <div className="stat-label">Aceptados</div>
                </div>
              </div>
              <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8, textAlign: 'center'}}>
                Tasa de Aceptación: {bufferStats.acceptance_rate ? parseFloat(bufferStats.acceptance_rate).toFixed(1) : 0}%
              </div>
            </div>
          )}
        </aside>
      </main>
      <footer className="footer">
        SignSpeak Frontend © 2026. Conectando mundos a través de LSM.
      </footer>
    </>
  );
}
