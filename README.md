<div align="center">

# 🤟 SignSpeak — Frontend Web

### Interfaz web para traducción en tiempo real de Lenguaje de Señas Mexicano (LSM)

---

**Equipo de Desarrollo:**
*   **Alan de los Santos Lopez Cetina** — Matrícula: 2202116
*   **Ángel Jonás Rosales Gonzales** — Matrícula: 2202022
*   **José Arturo González Flores** — Matrícula: 2202012
*   **Cesar Enrique Bernal Zurita** — Matrícula: 2201100
*   **Ángel David Quintana Pacheco** — Matrícula: 2102165
*   **Cristian Daniel Lázaro Acosta** — Matrícula: 2202055
*   **Ángel Adrián Yam Huchim** — Matricula: 2202109

---

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10-007FFF?style=flat-square&logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)

</div>

---

## 📋 Tabla de contenidos

1. [Descripción](#-descripción)
2. [Requisitos previos](#-requisitos-previos)
3. [Instalación y Configuración](#-instalación-y-configuración)
4. [Ejecutar localmente](#-ejecutar-localmente)
5. [Tests](#-tests)
6. [Pipeline de CI](#-pipeline-de-ci)
7. [Despliegue](#-despliegue)
8. [Variables de entorno](#-variables-de-entorno)
9. [Características](#-características)
10. [Stack tecnológico](#️-stack-tecnológico)
11. [Estructura del proyecto](#-estructura-del-proyecto)
12. [Licencia](#-licencia)

---

## 📖 Descripción

**SignSpeak Frontend Web** es la interfaz de usuario que permite la interacción con el sistema de traducción de LSM. Utiliza la potencia del navegador para realizar la detección de puntos clave (landmarks) de las manos en tiempo real mediante MediaPipe y consume los servicios del backend para la interpretación semántica y traducción fluida.

---

## ✅ Requisitos previos

| Herramienta | Versión mínima | Instalación |
| :--- | :--- | :--- |
| **Node.js** | 18.x | [nodejs.org](https://nodejs.org) |
| **npm** | 9.x | Incluido con Node.js |
| **Navegador** | Chrome / Edge | Soporte WebGL para MediaPipe |
| **Backend** | SignSpeak Backend | [Instrucciones de Backend](../signspeak-backend/README.md) |

---

## 📦 Instalación y Configuración

Sigue estos pasos para configurar el frontend en tu máquina local:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/alanctinaDev/signspeak-frontend-web.git
   cd signspeak-frontend-web
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env.local` en la raíz:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

---

## ▶️ Ejecutar localmente

Inicia el servidor de desarrollo de Next.js:

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 🧪 Tests

El proyecto cuenta con una suite completa de pruebas:

```bash
# Ejecutar pruebas unitarias e integración (Vitest)
npm test

# Ejecutar pruebas unitarias en modo interactivo
npm run test:watch

# Ejecutar pruebas End-to-End (Playwright)
# Nota: requiere que el servidor esté corriendo
npm run test:e2e
```

---

## 🔄 Pipeline de CI (GitHub Actions)

El proyecto incluye un pipeline automatizado definido en `.github/workflows/ci.yml`. Puedes reproducir los pasos del pipeline localmente:

1. **Linting:** `npm run lint`
2. **Pruebas de Unidad:** `npm test`
3. **Pruebas E2E:** `npx playwright test`

Para ejecutar las pruebas E2E correctamente, asegúrate de tener instalados los navegadores de Playwright:
```bash
npx playwright install chromium --with-deps
```

---

## 🚀 Despliegue

La aplicación se puede desplegar fácilmente en plataformas como **Vercel** (recomendado para Next.js) o mediante **Docker**:

### Con Docker
Si deseas desplegarlo localmente con Docker:
```bash
docker build -t signspeak-frontend .
docker run -p 3000:3000 signspeak-frontend
```

---

## 🔐 Variables de entorno

Descripción de las variables en `.env.local`:

| Variable | Descripción | Valor por defecto |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL base del API Gateway del backend para las peticiones de predicción. | `http://localhost:8000/api/v1` |

---

## ✨ Características

- 🎥 **Captura en tiempo real**: Acceso a la cámara con baja latencia.
- 🖐️ **Detección On-Device**: Procesamiento inicial (MediaPipe) en el navegador.
- 📱 **Diseño Responsive**: Interfaz optimizada para móviles y escritorio.
- ⌨️ **Constructor de Palabras**: Interfaz interactiva para formar frases letra por letra.

---

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Ver `LICENSE` para más detalles.

---

<div align="center">

Hecho con ❤️ por el equipo de **SignSpeak**

</div>
