# 📁 Estructura del Proyecto — SignSpeak Frontend Web

Frontend web construido con **Next.js 16 (App Router) + React 19**.
Utiliza **MediaPipe** para procesamiento de visión en el cliente y se conecta al **SignSpeak Backend** para predicciones avanzadas.

```
signspeak-frontend-web/                # Raíz del proyecto frontend
│
├── public/                            # Assets estáticos
│   └── models/                        # Modelos de MediaPipe (si se descargan localmente)
│
├── src/                               # Código fuente
│   │
│   ├── app/                           # Directorio principal (Next.js App Router)
│   │   ├── components/                # Componentes de la interfaz
│   │   │   ├── CameraView.jsx         # Captura de video y detector de landmarks
│   │   │   └── ResultPanel.jsx        # Visualización de resultados de traducción
│   │   ├── favicon.ico
│   │   ├── globals.css                # Estilos globales y tokens de diseño
│   │   ├── layout.js                  # Layout raíz de la aplicación
│   │   ├── page.js                    # Página principal (Dashboard de traducción)
│   │   └── page.module.css            # Estilos específicos de la página principal
│   │
│   └── lib/                           # Utilidades y servicios
│       ├── api.js                     # Cliente para comunicación con el Backend
│       └── mediapipe.js               # Configuración y helpers de MediaPipe Tasks
│
├── .gitignore                         # Archivos ignorados por git
├── AGENTS.md                          # Instrucciones para agentes de IA
├── eslint.config.mjs                  # Configuración de ESLint
├── jsconfig.json                      # Configuración de resolución de paths JS
├── next.config.mjs                    # Configuración de Next.js
├── package.json                       # Dependencias y scripts del proyecto
├── README.md                          # Documentación principal
├── signspeak_api_contract.json        # Contrato de la API para referencia
└── signspeak_frontend_reference.md    # Guía de referencia técnica
```

---

## 🧩 Descripción de Componentes y Lógica

| Módulo/Archivo | Responsabilidad |
| :--- | :--- |
| **`CameraView.jsx`** | Gestiona el acceso a la cámara, dibuja overlays y extrae landmarks usando MediaPipe. |
| **`ResultPanel.jsx`** | Muestra el texto traducido, historial y controles de la sesión. |
| **`api.js`** | Encapsula las llamadas a los servicios del backend (`predict`, `translate`, `health`). |
| **`mediapipe.js`** | Inicializa el procesador de visión (`HandLandmarker`) en el navegador. |

## 📡 Integración con Backend

El frontend se comunica con el API Gateway del backend para:
1. Validar el estado del sistema (`/health`).
2. Enviar landmarks para predicción de letras estáticas/dinámicas.
3. Enviar secuencias para traducción de palabras y oraciones.

## 🎨 Diseño y Estilos

- **Vanilla CSS + Modules**: Se utiliza CSS modular para evitar colisiones de estilos.
- **Responsive**: Diseñado para funcionar tanto en navegadores de escritorio como en dispositivos móviles.
- **Real-time Feedback**: Indicadores visuales sobre la confianza de la predicción y detección de manos.
