<div align="center">

<pre>
 ██████╗ ███████╗███████╗████████╗    ██████╗ ███████╗████████╗███████╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗
██╔══██╗██╔════╝██╔════╝╚══██╔══╝    ██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║
██████╔╝█████╗  ███████╗   ██║       ██║  ██║█████╗     ██║   █████╗  ██║        ██║   ██║██║   ██║██╔██╗ ██║
██╔═══╝ ██╔══╝  ╚════██║   ██║       ██║  ██║██╔══╝     ██║   ██╔══╝  ██║        ██║   ██║██║   ██║██║╚██╗██║
██║     ███████╗███████║   ██║       ██████╔╝███████╗   ██║   ███████╗╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║
╚═╝     ╚══════╝╚══════╝   ╚═╝       ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝

 █████╗  ██████╗ ███████╗███╗   ██╗████████╗
██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝
███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   
██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   
██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   
</pre>

# 🌿 Pest Detection Agent

> **A dual-AI crop disease diagnostics platform — upload a leaf photo, get an instant CNN classification and a full Gemini-powered treatment report.**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-pest--detection--agent.onrender.com-22C55E?style=for-the-badge)](https://pest-detection-agent.onrender.com)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-Apache_2.0-F59E0B?style=for-the-badge)](LICENSE)

</div>

---

## 🗺️ Table of Contents

- [Overview](#-overview)
- [Architecture & Data Flow](#-architecture--data-flow)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Local Installation](#-local-installation)
- [Environment Variables](#-environment-variables)
- [Deploying to Render](#-deploying-to-render)
- [Docker (Python/Flask Variant)](#-docker-pythonflask-variant)
- [CNN Model Training](#-cnn-model-training)
- [Supported Crops & Diseases](#-supported-crops--diseases)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)
- [Meet the Developer](#-meet-the-developer)

---

## 🧠 Overview

**Pest Detection Agent** is an AI-powered full-stack web application that identifies crop leaf diseases from uploaded photographs. Drop in a `.jpg` or `.png` image — the system runs a **two-stage AI pipeline**:

1. **Stage 1 — Vision Classification**: Google Gemini 2.5 Flash analyzes the leaf image and classifies the crop and disease against PlantVillage dataset categories, returning a confidence score.
2. **Stage 2 — Expert Report Synthesis**: The same Gemini model acts as an agricultural expert — generating a structured report covering disease overview, visual symptoms, root causes, organic treatments, chemical controls, prevention tips, and direct farmer advice.

All results are persisted in a scan history store and available for review or deletion at any time through the built-in history dashboard.

Two variants ship in this repository:

| Variant | Interface | Backend | Database |
|---|---|---|---|
| 🌐 **Production (Render)** | React + Vite SPA | Node.js / Express | Local JSON (`history.json`) |
| 🐍 **Academic (Docker)** | Same React SPA | Python / Flask + TensorFlow CNN | MongoDB |

---

## 🏗️ Architecture & Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                          👤  FARMER / USER                            │
│              (Browser Upload  ──or──  Drag & Drop Image)              │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                🖥️  REACT FRONTEND  (src/App.tsx)                      │
│   Image upload · Drag & drop · Canvas resize/compress (max 800px)    │
│   4 tabs: Overview · Disease Identifier · Scan History · About       │
│   Live stats: total scans · diseases found · crop types              │
└──────────────────────────────┬───────────────────────────────────────┘
                               │  POST /api/predict
                               │  { image: base64, filename }
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│              ⚙️  EXPRESS SERVER  (server.ts)                          │
│   express.json() body parser · 50MB limit · Route validation         │
│   Regex: data:(image/jpeg|png);base64,...                             │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌──────────────────────────┐   ┌──────────────────────────────────────┐
│  🔬  STAGE 1             │   │  📝  STAGE 2                          │
│  Gemini Vision           │   │  Gemini Agricultural Expert           │
│  gemini-2.5-flash        │   │  gemini-2.5-flash                     │
│                          │   │                                        │
│  Input: base64 image     │   │  Input: predicted disease + confidence │
│  Output: {               │   │  Output: {                             │
│    crop, condition,      │   │    overview, symptoms, causes,         │
│    fullName, confidence  │   │    organicTreatment,                   │
│  }                       │   │    chemicalTreatment,                  │
│                          │   │    prevention, farmerAdvice            │
│                          │   │  }                                     │
└──────────────┬───────────┘   └──────────────────┬───────────────────┘
               │                                   │
               └─────────────┬─────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│              🗄️  HISTORY STORE  (history.json)                        │
│  Persists: id · filename · crop · condition · disease · confidence   │
│  timestamp · base64 thumbnail · full Gemini report                   │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│              📊  SCAN HISTORY DASHBOARD  (React UI)                  │
│  Browse records · View full report · Delete entries · Thumbnails     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌿 **Dual-AI Pipeline** | Stage 1: Gemini vision classifies the leaf. Stage 2: Gemini synthesizes a full agricultural report |
| 🖼️ **Drag & Drop Upload** | Drop or click to upload JPG/PNG — client-side canvas resizes to max 800px before sending |
| 📋 **Structured Report** | Overview · Visual Symptoms · Root Causes · Organic Treatments · Chemical Controls · Prevention · Farmer Advice |
| 🕐 **Scan History** | All diagnoses stored with thumbnails, timestamps, and confidence scores — searchable and deletable |
| 📊 **Live Dashboard** | Real-time stats: total scans, unique crops, diseases identified, system health |
| 🧪 **5-Stage Progress UI** | Animated pipeline indicator shows each AI processing stage in real time |
| 🔄 **Model Swap** | Change Gemini model via `GEMINI_MODEL` env var — no code change or redeploy needed |
| 🛡️ **Input Validation** | File type check (JPEG/PNG only), 10MB cap, base64 format regex, non-leaf detection |
| 🐍 **Python/Flask Variant** | Full TensorFlow CNN + MongoDB stack for academic/Docker deployment |
| 📦 **Zero-config deploy** | `render.yaml` pre-configured — connect repo and deploy in minutes |

---

## 📁 Project Structure

```
pest-detection-agent/
│
├── src/
│   ├── App.tsx                  # 🖥️  Full React SPA (4 tabs, all UI logic)
│   ├── main.tsx                 # React entry point
│   └── index.css                # Tailwind directives + custom animations
│
├── backend/
│   └── app.py                   # 🐍 Flask REST API (Python/Docker variant)
│
├── cnn/
│   ├── train.py                 # CNN training script (PlantVillage + synthetic data)
│   ├── predict.py               # Standalone CLI inference
│   └── classes.py               # 37 PlantVillage class label definitions
│
├── database/
│   └── mongo_client.py          # MongoDB CRUD client wrapper
│
├── prompts/
│   └── disease_prompt.json      # Gemini prompt templates
│
├── server.ts                    # ⚙️  Express server (API + Vite dev + static prod)
├── dist-server/
│   └── server.js                # Compiled server (production build output)
├── dist/                        # Compiled React frontend (production build output)
│
├── vite.config.ts               # Vite + React plugin config
├── tsconfig.json                # TypeScript base config
├── tsconfig.server.json         # Server-only TS compilation (→ dist-server/)
├── tailwind.config.js           # Tailwind content paths + font config
├── postcss.config.js            # PostCSS + autoprefixer
├── package.json                 # Dependencies + build/start/dev scripts
│
├── Dockerfile                   # Python 3.10-slim + TensorFlow container
├── docker-compose.yml           # Flask API + MongoDB 6.0 stack
├── requirements.txt             # Python dependencies
├── render.yaml                  # Render deployment blueprint
└── history.json                 # Runtime scan history (auto-created)
```

> `dist/`, `dist-server/`, `node_modules/`, `uploads/`, and `history.json` are auto-created at build/runtime and excluded from version control.

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React | 18.3 |
| **Language** | TypeScript | 5.8 |
| **Build Tool** | Vite | 6.2 |
| **Styling** | Tailwind CSS | 3.4 |
| **Icons** | Lucide React | 0.441 |
| **Backend** | Express (Node.js) | 4.19 |
| **AI SDK** | @google/genai | 1.52 |
| **AI Model** | Gemini 2.5 Flash | — |
| **Runtime** | Node.js | 18+ |
| **Deployment** | Render | Free tier |
| **Python Backend** | Flask + TensorFlow | 2.3 / 2.x |
| **Python Database** | MongoDB (PyMongo) | 6.0 |

---

## 📋 Prerequisites

| Requirement | Notes |
|---|---|
| **Node.js 18+** | Download at [nodejs.org](https://nodejs.org) |
| **Google Gemini API Key** | Free at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| **Python 3.10+** | Only needed for the Docker/Flask variant |
| **Docker** | Only needed for the Docker/Flask variant |

---

## 🚀 Local Installation

```bash
# 1. Clone the repository
git clone https://github.com/nithishsivasamy07-sudo/Pest-Detection-Agent
cd Pest-Detection-Agent

# 2. Install Node.js dependencies
npm install

# 3. Create your environment file
echo GEMINI_API_KEY=your_key_here > .env

# 4. Start the development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

The dev server uses Vite middleware with hot reload — no separate frontend build step is needed. The Express server dynamically imports Vite in dev mode only.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Vite HMR at `localhost:3000` |
| `npm run build` | Build React frontend (`dist/`) + compile server (`dist-server/`) |
| `npm run start` | Run the compiled production server |
| `npm run preview` | Preview the built frontend via Vite |

---

## 🔧 Environment Variables

Create a `.env` file in the project root:

```env
# Required
GEMINI_API_KEY=your_google_gemini_api_key_here

# Optional — change the Gemini model without touching code
GEMINI_MODEL=gemini-2.5-flash

# Optional — defaults shown
PORT=3000
NODE_ENV=development
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | — | Your Google AI Studio API key |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Active Gemini model — swap without redeploy |
| `PORT` | No | `3000` | Server listening port |
| `NODE_ENV` | No | `development` | Set to `production` to serve compiled static files |

---

## ☁️ Deploying to Render

The project ships with a `render.yaml` blueprint — deployment takes under 5 minutes.

### Steps

1. Push your code to a GitHub repository.
2. Go to [dashboard.render.com](https://dashboard.render.com) → **New + → Web Service** → connect your repository.
3. Render auto-detects `render.yaml`. Confirm:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist-server/server.js`
   - **Runtime**: Node
4. Under **Environment**, add your secret:

| Key | Value |
|---|---|
| `GEMINI_API_KEY` | `your_key_from_aistudio` |

5. Click **Deploy Web Service**.

The build compiles the React SPA (`vite build → dist/`) and the TypeScript server (`tsc -p tsconfig.server.json → dist-server/server.js`). The compiled server then serves both static files and API calls from the same Node process — no separate containers needed.

### Updating the Gemini Model

To switch models without a code change:

1. Render dashboard → your service → **Environment**
2. Update `GEMINI_MODEL` to any valid model (e.g. `gemini-2.5-pro`)
3. Render auto-redeploys — done

---

## 🐳 Docker (Python/Flask Variant)

The academic variant runs a real **TensorFlow CNN model** with **MongoDB** for persistence.

```bash
# Set your API key first
# Edit docker-compose.yml → GEMINI_API_KEY=your_key_here

# Start the full stack (Flask API + MongoDB)
docker compose up --build
```

This starts:
- **MongoDB 6.0** on `localhost:27017`
- **Flask API** on `localhost:5000` (serves the React frontend too)

The Flask server gracefully falls back to a mock prediction and `history.json` if the TensorFlow model or MongoDB is unavailable — so it always starts cleanly.

---

## 🧬 CNN Model Training

The Python variant ships a full training pipeline for the **PlantVillage dataset**.

### Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Structure your dataset:
# dataset/plantvillage/
#   ├── Tomato Late Blight/
#   ├── Tomato Healthy/
#   ├── Potato Early Blight/
#   └── ... (38 classes)

# Run training
python cnn/train.py
```

If no dataset is found, `train.py` automatically **generates synthetic leaf images** using PIL — drawing leaf shapes, spot patterns, and disease markers per class — so training always completes even without real images.

### Model Architecture

```
Input (224×224×3)
    ↓
Block 1 → Conv2D(32) → BN → Conv2D(32) → MaxPool → Dropout(0.25)
    ↓
Block 2 → Conv2D(64) → BN → Conv2D(64) → MaxPool → Dropout(0.25)
    ↓
Block 3 → Conv2D(128) → BN → Conv2D(128) → MaxPool → Dropout(0.40)
    ↓
Flatten → Dense(512) → BN → Dropout(0.50)
    ↓
Softmax(num_classes)
```

Training uses aggressive data augmentation (rotation ±40°, brightness 0.7–1.3×, vertical+horizontal flip, zoom, shear) with EarlyStopping and ModelCheckpoint. Best model saved to `models/plantvillage_cnn.h5`.

### Standalone Prediction

```bash
python -m cnn.predict path/to/leaf_image.jpg
```

---

## 🌱 Supported Crops & Diseases

37 PlantVillage classes across 14 crop types:

| Crop | Conditions Covered |
|---|---|
| **Apple** | Scab · Black Rot · Cedar Rust · Healthy |
| **Blueberry** | Healthy |
| **Cherry** | Powdery Mildew · Healthy |
| **Corn** | Common Rust · Northern Leaf Blight · Healthy |
| **Grape** | Black Rot · Esca (Black Measles) · Leaf Blight · Healthy |
| **Orange** | Haunglongbing (Citrus Greening) |
| **Peach** | Bacterial Spot · Healthy |
| **Pepper Bell** | Bacterial Spot · Healthy |
| **Potato** | Early Blight · Late Blight · Healthy |
| **Raspberry** | Healthy |
| **Soybean** | Healthy |
| **Squash** | Powdery Mildew |
| **Strawberry** | Leaf Scorch · Healthy |
| **Tomato** | Bacterial Spot · Early Blight · Late Blight · Leaf Mold · Septoria Leaf Spot · Spider Mites · Target Spot · Yellow Leaf Curl Virus · Mosaic Virus · Healthy |

---

## 📋 API Reference

All endpoints are served from the same Express server at the same origin as the frontend.

### `POST /api/predict`

Classify a leaf image and generate a full disease report.

**Request body** (`application/json`):
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQ...",
  "filename": "tomato_leaf.jpg"
}
```

**Success Response** (`200 OK`):
```json
{
  "id": "rec_f3a2b1c4d",
  "filename": "tomato_leaf.jpg",
  "crop": "Tomato",
  "condition": "Late Blight",
  "disease": "Tomato Late Blight",
  "confidence": 94.21,
  "timestamp": "2026-07-05T10:30:00.000Z",
  "image": "data:image/jpeg;base64,...",
  "report": {
    "overview": "Tomato late blight is caused by Phytophthora infestans...",
    "symptoms": [
      "Dark water-soaked lesions on leaves",
      "White mildew growth on leaf undersides"
    ],
    "causes": [
      "Cool wet conditions between 10–25°C",
      "Fungal spores spread via wind and rain"
    ],
    "organicTreatment": [
      "Apply copper-based fungicide spray",
      "Remove and destroy infected plant material"
    ],
    "chemicalTreatment": [
      "Chlorothalonil spray at 7-day intervals",
      "Mancozeb applications during wet periods"
    ],
    "prevention": [
      "Use certified disease-free seed stock",
      "Maintain wide plant spacing for airflow"
    ],
    "farmerAdvice": "Monitor fields daily during cool, moist weather..."
  }
}
```

**Error Responses:**

| Code | Message | Reason |
|---|---|---|
| `400` | `No image file provided` | Request body is empty or missing `image` field |
| `400` | `Invalid image format` | Data URL doesn't match expected base64 pattern |
| `400` | `Unsupported image type` | Mime type is not JPEG or PNG |
| `400` | `The uploaded image does not appear to be a crop leaf` | Gemini detected a non-leaf image |
| `413` | `Image too large` | Payload exceeds 50MB limit |
| `500` | `GEMINI_API_KEY environment variable is required` | API key not configured |
| `500` | Gemini API error message | Upstream Gemini API failure |

---

### `GET /api/history`

Returns all scan records as a JSON array, newest first.

**Response** (`200 OK`):
```json
[
  { "id": "rec_...", "disease": "Tomato Late Blight", "confidence": 94.21, ... },
  { "id": "rec_...", "disease": "Corn Common Rust", "confidence": 88.70, ... }
]
```

---

### `DELETE /api/history/:id`

Deletes a single scan record by ID.

```
DELETE /api/history/rec_f3a2b1c4d
```

**Response** (`200 OK`):
```json
{ "success": true, "message": "Record rec_f3a2b1c4d deleted successfully" }
```

---

### `GET /api/health`

Returns current service status.

**Response** (`200 OK`):
```json
{
  "status": "ok",
  "cnn_model": "loaded",
  "gemini": "active",
  "database": "connected (local_json)",
  "timestamp": "2026-07-05T10:30:00.000Z"
}
```

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| `GEMINI_API_KEY environment variable is required` | Create a `.env` file in the project root with `GEMINI_API_KEY=your_key` |
| `models/gemini-X.X-flash is not found` | The model was deprecated — update `GEMINI_MODEL` env var to `gemini-2.5-flash` |
| `Analysis Error: No image file provided` | Ensure `NODE_ENV=production` and the server has started correctly; check Render deploy logs |
| Build fails: `Could not resolve entry module "index.html"` | Run `npm install` — the `index.html` and `src/main.tsx` entry files must be present |
| `tsx: command not found` on Render | The start command must be `node dist-server/server.js`, not `tsx server.ts` |
| Flask `WinError 10038` on Windows | Expected — the Flask server disables the watchdog reloader on Windows automatically |
| `ModuleNotFoundError: tensorflow` | Install Python deps: `pip install -r requirements.txt` |
| Docker: `GEMINI_API_KEY not set` | Edit `docker-compose.yml` and set `GEMINI_API_KEY=your_key` under `flask_api.environment` |

---

## 👨‍💻 Meet the Developer

<div align="center">

### Built with dedication by

<table>
  <tr>
    <td align="center" width="260">
      <br>
      <b>⚙️ Nithish S</b><br>
      <sub><b>Full-Stack Developer</b></sub><br><br>
      <sub>React frontend · Express backend · Gemini AI integration<br>
      CNN training pipeline · Docker deployment · Render CI/CD</sub><br><br>
      <a href="https://drive.google.com/file/d/1M-amjnNReqQJ-C3_4zqmUuQLKIozQDU2/view?usp=drive_link">📄 View Resume</a><br>
      <a href="mailto:nithishsivasamy07@gmail.com">✉️ nithishsivasamy07@gmail.com</a><br>
      <a href="https://github.com/nithishsivasamy07-sudo">🐙 github.com/nithishsivasamy07-sudo</a>
    </td>
  </tr>
</table>

---

### 📬 Get in Touch

Have questions, suggestions, or want to collaborate?

**Nithish S** — [nithishsivasamy07@gmail.com](mailto:nithishsivasamy07@gmail.com)

Whether it's a bug report, a feature request, or a collaboration opportunity — all messages are welcome.

---

*© 2026 Nithish S · Pest Detection Agent · Apache 2.0 License*

*Built as a final-year college project demonstrating Deep Learning + Generative AI integration*

*🌿 Made with care for farmers everywhere*

</div>
