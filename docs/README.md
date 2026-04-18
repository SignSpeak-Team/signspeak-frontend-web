<div align="center">

# 🤟 SignSpeak — Frontend Web

### Interfaz web para traducción en tiempo real de Lenguaje de Señas Mexicano (LSM)

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10-007FFF?style=flat-square&logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)

</div>

---

## 📋 Tabla de contenidos

1. [Descripción](#-descripción)
2. [Características](#-características)
3. [Stack tecnológico](#️-stack-tecnológico)
4. [Requisitos previos](#-requisitos-previos)
5. [Instalación](#-instalación)
6. [Ejecutar localmente](#-ejecutar-localmente)
7. [Variables de entorno](#-variables-de-entorno)
8. [Estructura del proyecto](#-estructura-del-proyecto)
9. [Contribución](#-contribución)
10. [Licencia](#-licencia)

---

## 📖 Descripción

**SignSpeak Frontend Web** es la interfaz de usuario que permite la interacción con el sistema de traducción de LSM. Utiliza la potencia del navegador para realizar la detección de puntos clave (landmarks) de las manos en tiempo real y consume los servicios del backend para la interpretación semántica de las señas.

---

## ✨ Características

- 🎥 **Captura en tiempo real**: Acceso a la cámara con baja latencia.
- 🖐️ **Detección On-Device**: Procesamiento de visión inicial (MediaPipe) ejecutado localmente para mayor privacidad y velocidad.
- 📡 **Conectividad con Backend**: Comunicación fluida con microservicios para predicciones complejas.
- 📱 **Diseño Responsive**: Interfaz optimizada para diversos tamaños de pantalla.
- ⌨️ **Resultados Instantáneos**: Visualización inmediata de letras y palabras detectadas.

---

## 🛠️ Stack tecnológico

| Capa             | Tecnología              | Detalle                                                      |
| :--------------- | :---------------------- | :----------------------------------------------------------- |
| **Framework**    | Next.js 16 (App Router) | Renderizado híbrido y optimización de rutas.                 |
| **UI**           | React 19                | Manejo de estado y componentes interactivos.                 |
| **Visión**       | MediaPipe Tasks Vision  | Detección de landmarks de mano directamente en el navegador. |
| **Comunicación** | Fetch API / Axios       | Integración con el API Gateway del backend.                  |
| **Estilos**      | CSS Modules             | Estilos desacoplados y mantenibles.                          |

---

## ✅ Requisitos previos

| Herramienta | Versión mínima    | Instalación                                                |
| :---------- | :---------------- | :--------------------------------------------------------- |
| **Node.js** | 18.x              | [nodejs.org](https://nodejs.org)                           |
| **npm**     | 9.x               | Incluido con Node.js                                       |
| **Backend** | SignSpeak Backend | [Instrucciones de Backend](../signspeak-backend/README.md) |

---

## 📦 Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/alanctinaDev/signspeak-frontend-web.git
cd signspeak-frontend-web

# 2. Instalar dependencias
npm install
```

---

## ▶️ Ejecutar localmente

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

> 💡 **Nota**: Asegúrate de tener el backend corriendo o configurar la URL del backend en las variables de entorno.

---

## 🔐 Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto (puedes basarte en `.env.example` si existe):

| Variable              | Descripción                     | Valor por defecto              |
| :-------------------- | :------------------------------ | :----------------------------- |
| `NEXT_PUBLIC_API_URL` | URL del API Gateway del backend | `http://localhost:8000/api/v1` |

---

## 📂 Estructura del proyecto

> Ver [`STRUCTURE.md`](STRUCTURE.md) para la descripción detallada de cada archivo.

```
signspeak-frontend-web/
├── src/
│   ├── app/            # Rutas y componentes de la aplicación
│   │   ├── components/ # Widgets Reutilizables (Camera, Results)
│   │   └── ...
│   └── lib/            # Clientes API y configuración de MediaPipe
├── public/             # Assets estáticos
└── ...
```

---

## 🤝 Contribución

Sigue el mismo flujo que en el backend:

1. **Forkea** el repositorio.
2. Crea una branch (`feat/nueva-funcionalidad`).
3. Asegúrate de pasar el lint: `npm run lint`.
4. Abre un **Pull Request**.

---

## 📄 Licencia

Distribuido bajo la licencia **MIT**.

---

<div align="center">

Hecho con ❤️ por

Alan de los Santos Lopez Cetina — Matrícula: 2202116
Ángel Jonás Rosales Gonzales — Matrícula: 2202022
José Arturo González Flores — Matrícula: 2202012
Cesar Enrique Bernal Zurita— Matrícula: 2201100
Ángel David Quintana Pacheco — Matrícula: 2102165
Cristian Daniel Lázaro Acosta — Matrícula: 2202055
Ángel Adrián Yam Huchim — Matricula: 2202109
