'use client';

export default function ResultPanel({ mode, result, error, phrase, spelledWord, bufferStats }) {
  if (error) {
    return (
      <div className="card">
        <div className="error-banner">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // ── STATIC MODE ──────────────────────────────────────────────────────────
  if (mode === 'static') {
    return (
      <>
        <div className="card">
          <div className="card-title">Letra detectada</div>
          <div className="result-big">
            <div className="result-letter">{result?.letter ?? '—'}</div>
            <div className="result-type">{result?.type ?? 'static'}</div>
          </div>
          {result && (
            <div className="confidence-wrap">
              <div className="confidence-label">
                <span>Confianza</span>
                <span>{result.confidence?.toFixed(1)}%</span>
              </div>
              <div className="confidence-bar">
                <div className="confidence-fill" style={{ width: `${result.confidence ?? 0}%` }} />
              </div>
            </div>
          )}
          {result && (
            <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8 }}>
              {result.processing_time_ms?.toFixed(1)} ms
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Palabra deletreada</div>
          <div className="spelled-box">{spelledWord || <span className="phrase-empty">Empieza a hacer señas…</span>}</div>
        </div>
      </>
    );
  }

  // ── DYNAMIC MODE ─────────────────────────────────────────────────────────
  if (mode === 'dynamic') {
    return (
      <>
        <div className="card">
          <div className="card-title">Letra dinámica detectada</div>
          <div className="result-big">
            <div className="result-letter">{result?.letter ?? '—'}</div>
            <div className="result-type">dynamic</div>
          </div>
          {result && (
            <div className="confidence-wrap">
              <div className="confidence-label">
                <span>Confianza</span>
                <span>{result.confidence?.toFixed(1)}%</span>
              </div>
              <div className="confidence-bar">
                <div className="confidence-fill" style={{ width: `${result.confidence ?? 0}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Letra acumulada</div>
          <div className="spelled-box">{spelledWord || <span className="phrase-empty">Realiza la seña…</span>}</div>
        </div>
      </>
    );
  }

  // ── WORDS / HOLISTIC MODE ────────────────────────────────────────────────
  return (
    <>
      <div className="card">
        <div className="card-title">Palabra detectada</div>
        <div className="result-big">
          <div className="result-word">{result?.word ?? '—'}</div>
          {result && (
            <span className={`accepted-tag ${result.accepted ? 'yes' : 'no'}`}>
              {result.accepted ? '✓ Aceptada' : '⏸ No aceptada'}
            </span>
          )}
        </div>
        {result && (
          <div className="confidence-wrap">
            <div className="confidence-label">
              <span>Confianza</span>
              <span>{result.confidence?.toFixed(1)}%</span>
            </div>
            <div className="confidence-bar">
              <div className="confidence-fill" style={{ width: `${result.confidence ?? 0}%` }} />
            </div>
          </div>
        )}
        {result && (
          <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8 }}>
            {result.processing_time_ms?.toFixed(1)} ms
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">Frase acumulada</div>
        <div className="phrase-box">
          {phrase ? phrase : <span className="phrase-empty">Las palabras se irán acumulando aquí…</span>}
        </div>
      </div>

      {bufferStats && (
        <div className="card">
          <div className="card-title">Estadísticas del buffer</div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{bufferStats.total_received ?? 0}</div>
              <div className="stat-label">Recibidas</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{bufferStats.total_accepted ?? 0}</div>
              <div className="stat-label">Aceptadas</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{bufferStats.acceptance_rate?.toFixed(0) ?? 0}%</div>
              <div className="stat-label">Tasa aceptación</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{bufferStats.rejected_by_confidence ?? 0}</div>
              <div className="stat-label">Rechazadas</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
