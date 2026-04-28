/**
 * MediaPipe HandLandmarker singleton loader.
 * Lazily initializes once, reuses across components.
 */

let handLandmarker = null;
let poseLandmarker = null;
let loading = false;
let loadPromise = null;
let poseLoadPromise = null;

const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const HAND_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const POSE_MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

export async function getHandLandmarker() {
  if (handLandmarker) return handLandmarker;
  if (loadPromise) return loadPromise;

  loading = true;
  loadPromise = (async () => {
    const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

    const vision = await FilesetResolver.forVisionTasks(WASM_BASE);

    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: HAND_MODEL,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 2, // Detectar ambas manos
    });

    loading = false;
    return handLandmarker;
  })();

  return loadPromise;
}

export function isLoading() {
  return loading;
}

export async function getPoseLandmarker() {
  if (poseLandmarker) return poseLandmarker;
  if (poseLoadPromise) return poseLoadPromise;

  loading = true;
  poseLoadPromise = (async () => {
    const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

    const vision = await FilesetResolver.forVisionTasks(WASM_BASE);

    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: POSE_MODEL,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    });

    loading = false;
    return poseLandmarker;
  })();

  return poseLoadPromise;
}
