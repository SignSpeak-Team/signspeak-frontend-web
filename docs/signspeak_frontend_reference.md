# SignSpeak — Referencia de API para el Frontend

> Extraído del backend el 2026-04-14. API Gateway v1.0.0.

---

## 🌐 Base URL

| Entorno | URL |
|---------|-----|
| Local (dev) | `http://localhost:8080` |
| Docker Compose | `http://localhost:8080` |
| Producción (GCP/AWS) | Variable de entorno `NEXT_PUBLIC_API_URL` |

CORS está abierto (`*`), no se necesita proxy en desarrollo.

---

## 📡 Endpoints completos

### Health

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/health` | Estado rápido del gateway |
| `GET` | `/api/v1/status` | Estado detallado con servicios internos |

---

### 🔤 Predicción — Letras estáticas
**`POST /api/v1/predict/static`**

Para letras que NO tienen movimiento: `A B C D E F G H I L M N O P R S T U V W Y`

**Request:**
```json
{
  "landmarks": [
    [0.52, 0.34, 0.0],
    "... × 21 total"
  ]
}
```
- `landmarks`: array de **21** puntos `[x, y, z]` normalizados (0.0–1.0)
- Fuente: MediaPipe `HandLandmarker` → `result.landmarks[0]`

**Response:**
```json
{
  "letter": "A",
  "confidence": 92.5,
  "type": "static",
  "processing_time_ms": 18.3
}
```

---

### 🤚 Predicción — Letras dinámicas
**`POST /api/v1/predict/dynamic`**

Para letras con movimiento: **J, K, Q, X, Z, Ñ**

**Request:**
```json
{
  "sequence": [
    [[x,y,z], "... ×21"],
    "... ×15 frames"
  ]
}
```
- `sequence`: **15 frames** × 21 landmarks × 3 coords
- Acumular frames en buffer antes de enviar

**Response:** igual que `/predict/static` pero `type: "dynamic"`

---

### 💬 Predicción — Palabras LSM (249 palabras)
**`POST /api/v1/predict/words`**

**Request:** igual que `/predict/dynamic` (`sequence` de 15 frames)

**Response:**
```json
{
  "word": "hola",
  "confidence": 87.2,
  "phrase": "hola mundo cómo estás",
  "accepted": true,
  "processing_time_ms": 45.1
}
```
- `phrase`: el backend acumula la frase completa — mostrarla en UI
- `accepted`: si esta predicción fue agregada a la frase

**Endpoints de gestión del buffer:**
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/predict/words/stats` | Ver estadísticas del buffer |
| `POST` | `/api/v1/predict/words/clear` | Limpiar frase acumulada |

---

### 🏥 Predicción — Vocabulario Médico (150 términos)
**`POST /api/v1/predict/holistic`**

**Request:**
```json
{
  "landmarks": [0.12, 0.45, 0.0, "... × 226 floats"]
}
```

Vector de **226 floats** con esta estructura:
```
[0..74]   → Pose: 25 landmarks × 3 (relativo a nariz = landmark[0])
[75..137] → Mano izquierda: 21 × 3 (relativo a muñeca)
[138..200] → Mano derecha: 21 × 3 (relativo a muñeca)
[201..225] → Padding con 0.0 si no hay datos
```

**Response:** igual que `/predict/words`

**Limpiar buffer:**  
`POST /api/v1/predict/holistic/clear`

---

## 📷 Integración con MediaPipe (Web)

### Instalación
```bash
npm install @mediapipe/tasks-vision
```

### WASM CDN
```
https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm
```

---

### Modo 1 — Solo manos (letras + palabras generales)

```javascript
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const vision = await FilesetResolver.forVisionTasks(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
);

const handLandmarker = await HandLandmarker.createFromOptions(vision, {
  baseOptions: { modelAssetPath: "hand_landmarker.task" },
  runningMode: "VIDEO",
  numHands: 1,
});

// Por cada frame de video:
const result = handLandmarker.detectForVideo(videoElement, Date.now());

// Convertir al formato de la API:
const landmarks = result.landmarks[0]?.map(lm => [lm.x, lm.y, lm.z]) ?? null;
// landmarks → array de 21 × [x, y, z]
```

---

### Estrategia de captura por modo

| Modo | Frames necesarios | Estrategia |
|------|-------------------|-----------|
| **Letras estáticas** | 1 (continuo) | Enviar cada frame con debounce ~200ms |
| **Letras dinámicas** | 15 | Acumular buffer, enviar al llegar a 15, limpiar |
| **Palabras** | 15 | Igual que dinámicas |
| **Médico (holístico)** | 1 frame holístico | Combinar Pose + Manos manualmente |

---

### Construcción manual del vector holístico (226 features)

```javascript
// Requiere PoseLandmarker + HandLandmarker

function buildHolisticVector(poseLandmarks, leftHandLandmarks, rightHandLandmarks) {
  const features = [];
  const POSE_INDICES = Array.from({ length: 25 }, (_, i) => i); // 0-24

  // Pose (relativo a nariz = índice 0)
  if (poseLandmarks) {
    const ref = poseLandmarks[0];
    for (const idx of POSE_INDICES) {
      const lm = poseLandmarks[idx];
      features.push(lm.x - ref.x, lm.y - ref.y, lm.z - ref.z);
    }
  } else {
    features.push(...new Array(75).fill(0.0));
  }

  // Manos (relativo a muñeca = índice 0)
  const extractHand = (hand) => {
    if (!hand) return new Array(63).fill(0.0);
    const wrist = hand[0];
    return hand.flatMap(lm => [lm.x - wrist.x, lm.y - wrist.y, lm.z - wrist.z]);
  };

  features.push(...extractHand(leftHandLandmarks));
  features.push(...extractHand(rightHandLandmarks));

  // Pad a 226
  while (features.length < 226) features.push(0.0);
  return features.slice(0, 226);
}
```

---

## 🚦 Errores esperados

| Código | Significado |
|--------|-------------|
| `422` | Datos mal formateados (ej: landmarks con != 21 puntos) |
| `502` | Vision Service con error interno |
| `503` | Vision Service caído / no disponible |
| `504` | Vision Service tardó > 30s (timeout) |

---

## 🗺️ Modos de la UI recomendados

```
┌─────────────────────────────────────────────────┐
│  MODO 1: Deletrear (letras A-Z)                 │
│  → /predict/static + /predict/dynamic           │
│  → Muestra letra en tiempo real, acumula palabra│
├─────────────────────────────────────────────────┤
│  MODO 2: Palabras LSM (249 palabras)            │
│  → /predict/words                               │
│  → Muestra frase acumulada del backend          │
├─────────────────────────────────────────────────┤
│  MODO 3: Vocabulario Médico (150 términos)      │
│  → /predict/holistic                            │
│  → Requiere Pose + Manos (vector 226 features)  │
└─────────────────────────────────────────────────┘
```

---

## 🗂️ Archivos JSON con contrato completo

Ver `signspeak_api_contract.json` en el mismo directorio para el contrato completo en formato estructurado.
