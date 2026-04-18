/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { getHandLandmarker, getPoseLandmarker } from '@/lib/mediapipe';
import { handResultToLandmarks, buildHolisticVector } from '@/lib/api';

const FRAME_COLORS = {
  static: '#0a84ff', // Apple Blue
  dynamic: '#64d2ff', // Apple Cyan
  words: '#30d158', // Apple Green
  holistic: '#ffffff', // Tech White
};

export default function CameraView({ mode, onLandmarks, onSequenceReady, onHolisticReady, active }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const landmarkerRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const frameBufferRef = useRef([]);
  const lastCallRef = useRef(0);

  const [camStatus, setCamStatus] = useState('off'); // off | loading | on | error
  const [mpLoaded, setMpLoaded] = useState(false);
  const [bufferCount, setBufferCount] = useState(0);

  const BUFFER_SIZE = 15;
  const STATIC_DEBOUNCE_MS = 200;

  // Load MediaPipe on mount
  useEffect(() => {
    let cancelled = false;
    Promise.all([getHandLandmarker(), getPoseLandmarker()])
      .then(([handLm, poseLm]) => {
        if (!cancelled) {
          landmarkerRef.current = handLm;
          poseLandmarkerRef.current = poseLm;
          setMpLoaded(true);
        }
      }).catch(console.error);
    return () => { cancelled = true; };
  }, []);

  const startCamera = useCallback(async () => {
    setCamStatus('loading');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCamStatus('on');
      }
    } catch {
      setCamStatus('error');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    frameBufferRef.current = [];
    setBufferCount(0);
    setCamStatus('off');
  }, []);

  // Toggle camera based on `active` prop
  useEffect(() => {
    if (active) { startCamera(); }
    else { stopCamera(); }
    return () => stopCamera();
  }, [active, startCamera, stopCamera]);

  // Draw landmarks helper
  const drawLandmarks = useCallback((ctx, landmarks, color) => {
    if (!landmarks?.length) return;
    const CONNECTIONS = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [0,9],[9,10],[10,11],[11,12],
      [0,13],[13,14],[14,15],[15,16],
      [0,17],[17,18],[18,19],[19,20],
      [5,9],[9,13],[13,17],
    ];

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.strokeStyle = color + 'aa';
    ctx.lineWidth = 2;
    for (const [a, b] of CONNECTIONS) {
      const pa = landmarks[a], pb = landmarks[b];
      ctx.beginPath();
      ctx.moveTo(pa.x * w, pa.y * h);
      ctx.lineTo(pb.x * w, pb.y * h);
      ctx.stroke();
    }

    for (const lm of landmarks) {
      ctx.beginPath();
      ctx.arc(lm.x * w, lm.y * h, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }, []);

  // Main detection loop
  useEffect(() => {
    if (camStatus !== 'on' || !mpLoaded || !landmarkerRef.current || !poseLandmarkerRef.current) return;

    const detect = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = performance.now();
      let result = null;
      let poseResult = null;
      try {
        result = landmarkerRef.current.detectForVideo(video, now);
        if (mode === 'holistic') {
          poseResult = poseLandmarkerRef.current.detectForVideo(video, now);
        }
      } catch { /* ignore */ }

      if (mode === 'holistic') {
        const hasHand = result?.landmarks?.length > 0;
        const hasPose = poseResult?.landmarks?.length > 0;

        if (hasHand || hasPose) {
          const color = FRAME_COLORS[mode] || '#06b6d4';
          if (hasHand) drawLandmarks(ctx, result.landmarks[0], color);
          if (hasPose) drawLandmarks(ctx, poseResult.landmarks[0], '#ffd60a'); // Apple Yellow

          if (now - lastCallRef.current > STATIC_DEBOUNCE_MS) {
            lastCallRef.current = now;
            const vector = buildHolisticVector(
              hasPose ? poseResult.landmarks[0] : null,
              hasHand ? result.landmarks[0] : null,
              null
            );
            onHolisticReady?.(vector);
          }
        }
      } else if (result?.landmarks?.length) {
        const color = FRAME_COLORS[mode] || '#6c63ff';
        drawLandmarks(ctx, result.landmarks[0], color);

        const formatted = handResultToLandmarks(result);
        if (!formatted) { rafRef.current = requestAnimationFrame(detect); return; }

        if (mode === 'static') {
          // Debounced continuous send
          if (now - lastCallRef.current > STATIC_DEBOUNCE_MS) {
            lastCallRef.current = now;
            const handedness = result.handedness?.[0]?.[0]?.categoryName; // MediaPipe Tasks API structure
            onLandmarks?.(formatted, handedness);
          }
        } else {
          // Buffer up to 15 frames then fire
          frameBufferRef.current.push(formatted);
          const count = frameBufferRef.current.length;
          setBufferCount(count);

          if (count >= BUFFER_SIZE) {
            const seq = frameBufferRef.current.slice(0, BUFFER_SIZE);
            const handedness = result.handedness?.[0]?.[0]?.categoryName;
            frameBufferRef.current = [];
            setBufferCount(0);
            onSequenceReady?.(seq, handedness);
          }
        }
      } else {
        // No hand detected — keep buffer
      }

      rafRef.current = requestAnimationFrame(detect);
    };

    rafRef.current = requestAnimationFrame(detect);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [camStatus, mpLoaded, mode, onLandmarks, onSequenceReady, onHolisticReady, drawLandmarks]);

  // Reset buffer on mode change
  useEffect(() => {
    frameBufferRef.current = [];
    setBufferCount(0);
  }, [mode]);

  const isSequenceMode = mode === 'dynamic' || mode === 'words';

  return (
    <div>
      <div className="camera-wrap">
        {camStatus === 'off' && (
          <div className="camera-placeholder">
            <span>Cámara desactivada</span>
          </div>
        )}
        {camStatus === 'loading' && (
          <div className="camera-placeholder">
            <span>Iniciando...</span>
          </div>
        )}
        {camStatus === 'error' && (
          <div className="camera-placeholder">
            <span>Error de cámara</span>
          </div>
        )}
        <video ref={videoRef} muted playsInline style={{ display: camStatus === 'on' ? 'block' : 'none' }} />
        <canvas ref={canvasRef} style={{ display: camStatus === 'on' ? 'block' : 'none' }} />

        {camStatus === 'on' && (
          <div className="camera-badge">
            {mpLoaded ? '🟢 MediaPipe activo' : '🟡 Cargando modelo…'}
          </div>
        )}
      </div>

      {/* Buffer progress for sequence modes */}
      {isSequenceMode && camStatus === 'on' && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
            Frames capturados: {bufferCount}/{BUFFER_SIZE}
          </div>
          <div className="buffer-wrap">
            {Array.from({ length: BUFFER_SIZE }).map((_, i) => (
              <div key={i} className={`buffer-dot ${i < bufferCount ? 'filled' : ''}`} />
            ))}
          </div>
        </div>
      )}

      <div className="camera-controls">
        {camStatus === 'off' || camStatus === 'error' ? (
          <button className="btn btn-primary" onClick={startCamera} disabled={!mpLoaded}>
            {mpLoaded ? '▶ Activar cámara' : '⏳ Cargando MediaPipe…'}
          </button>
        ) : (
          <button className="btn btn-danger" onClick={stopCamera}>⏹ Detener cámara</button>
        )}
      </div>
    </div>
  );
}
