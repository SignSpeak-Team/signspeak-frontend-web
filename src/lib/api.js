/**
 * signSpeak API client
 * All calls go through the API Gateway.
 * Set NEXT_PUBLIC_API_URL in .env.local
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function apiCall(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// --- Health ---
export async function getHealth() {
  return apiCall('GET', '/api/v1/health');
}

export async function getStatus() {
  return apiCall('GET', '/api/v1/status');
}

// --- Prediction: Static letter (1 frame, 21 landmarks) ---
// landmarks: [[x,y,z] × 21]
// Response: { letter, confidence, type, processing_time_ms }
export async function predictStatic(landmarks, handedness = null) {
  return apiCall('POST', '/api/v1/predict/static', { landmarks, handedness });
}

// --- Prediction: Dynamic letter (15 frames, 21 landmarks each) ---
// sequence: [[[x,y,z]×21] × 15]
// Response: { letter, confidence, type, processing_time_ms }
export async function predictDynamic(sequence, handedness = null) {
  return apiCall('POST', '/api/v1/predict/dynamic', { sequence, handedness });
}

// --- Prediction: LSM Word (249 vocab, 15 frames) ---
// sequence: [[[x,y,z]×21] × 15]
// Response: { word, confidence, phrase, accepted, processing_time_ms }
export async function predictWords(sequence, handedness = null) {
  return apiCall('POST', '/api/v1/predict/words', { sequence, handedness });
}

// --- Prediction: Medical word (150 vocab, 226 holistic features) ---
// landmarks: [float × 226]
// Response: { word, confidence, phrase, accepted, processing_time_ms }
export async function predictHolistic(landmarks) {
  return apiCall('POST', '/api/v1/predict/holistic', { landmarks });
}

// --- Buffer management ---
export async function clearWordBuffer() {
  return apiCall('POST', '/api/v1/predict/words/clear');
}

export async function clearHolisticBuffer() {
  return apiCall('POST', '/api/v1/predict/holistic/clear');
}

export async function getWordBufferStats() {
  return apiCall('GET', '/api/v1/predict/words/stats');
}

// --- Utilities ---

/**
 * Convert MediaPipe HandLandmarker result to the API format.
 * result.landmarks[0] → [[x,y,z] × 21]
 */
export function handResultToLandmarks(handResult) {
  if (!handResult?.landmarks?.length) return null;
  return handResult.landmarks[0].map((lm) => [lm.x, lm.y, lm.z]);
}

/**
 * Build the 226-float holistic vector from pose + both hands.
 * Mirrors the Python HolisticExtractor logic.
 */
export function buildHolisticVector(poseLandmarks, leftHandLandmarks, rightHandLandmarks) {
  const POSE_INDICES = Array.from({ length: 25 }, (_, i) => i);
  const features = [];

  // Pose relative to nose (index 0)
  if (poseLandmarks?.length) {
    const ref = poseLandmarks[0];
    for (const idx of POSE_INDICES) {
      const lm = poseLandmarks[idx] || { x: 0, y: 0, z: 0 };
      features.push(lm.x - ref.x, lm.y - ref.y, lm.z - ref.z);
    }
  } else {
    features.push(...new Array(75).fill(0.0));
  }

  // Hand helper: relative to wrist (index 0)
  const extractHand = (hand) => {
    if (!hand?.length) return new Array(63).fill(0.0);
    const wrist = hand[0];
    return hand.flatMap((lm) => [lm.x - wrist.x, lm.y - wrist.y, lm.z - wrist.z]);
  };

  features.push(...extractHand(leftHandLandmarks));
  features.push(...extractHand(rightHandLandmarks));

  while (features.length < 226) features.push(0.0);
  return features.slice(0, 226);
}
