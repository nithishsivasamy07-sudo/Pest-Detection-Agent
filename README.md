# Pest Detection Agent

> AI-powered crop disease diagnostics — identify plant diseases from a leaf photo and get instant treatment guides.

**Live Demo → [pest-detection-agent.onrender.com](https://pest-detection-agent.onrender.com)**

---

## What It Does

Upload a photo of a crop leaf. The system runs it through two AI stages:

1. **CNN Classifier** — a Convolutional Neural Network trained on the PlantVillage dataset identifies the crop and disease with a confidence score.
2. **Gemini Report** — Google Gemini 2.5 Flash receives the prediction and generates a full agricultural report: symptoms, causes, organic treatments, chemical controls, prevention tips, and farmer advice.

All scan results are stored in history and can be reviewed or deleted at any time.

---

## Screenshots

| Disease Identifier | Diagnostic Report |
|---|---|
| Upload a leaf image and click Analyze | Full CNN + Gemini report with treatment plans |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| Backend | Node.js, Express, TypeScript |
| AI Classification | Google Gemini 2.5 Flash (vision) |
| AI Report Generation | Google Gemini 2.5 Flash (text) |
| Storage | Local JSON file (`history.json`) |
| Deployment | Render (Node web service) |
| Icons | Lucide React |

---

## Project Structure

```
pest-detection-agent/
├── src/
│   ├── App.tsx              # Full React frontend (tabs, upload, results, history)
│   ├── main.tsx             # React entry point
│   └── index.css            # Tailwind directives + animations
├── backend/
│   └── app.py               # Flask API (Python/Docker variant)
├── cnn/
│   ├── train.py             # CNN training script (PlantVillage dataset)
│   ├── predict.py           # Standalone CNN inference
│   └── classes.py           # PlantVillage class labels
├── database/
│   └── mongo_client.py      # MongoDB CRUD helpers
├── prompts/
│   └── disease_prompt.json  # Gemini prompt templates
├── server.ts                # Express server (API + static serving)
├── dist-server/server.js    # Compiled server (production)
├── dist/                    # Compiled React frontend (production)
├── vite.config.ts
├── tsconfig.json
├── tsconfig.server.json     # Server-only TS compilation config
├── tailwind.config.js
├── package.json
├── Dockerfile               # Python/Flask container
├── docker-compose.yml       # Flask + MongoDB stack
└── render.yaml              # Render deployment config
```

---

## Running Locally

### Prerequisites

- Node.js 18+
- A Google Gemini API key — get one free at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/nithishsivasamy07-sudo/Pest-Detection-Agent
cd Pest-Detection-Agent

# 2. Install dependencies
npm install

# 3. Create a .env file in the root
echo GEMINI_API_KEY=your_key_here > .env

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The dev server uses Vite middleware for hot reload. No separate frontend build step needed.

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | — | Your Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model to use — change without redeploy |
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Set to `production` for static serving |

---

## Deploying to Render

The project is pre-configured for [Render](https://render.com) via `render.yaml`.

### Steps

1. Push your code to GitHub.
2. Go to [dashboard.render.com](https://dashboard.render.com) → **New → Web Service** → connect your repo.
3. Render auto-detects `render.yaml`. Confirm these settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist-server/server.js`
   - **Runtime**: Node
4. Under **Environment**, add:
   - `GEMINI_API_KEY` = your key from AI Studio
5. Click **Deploy**.

The build compiles the React frontend (`vite build`) and the Express server (`tsc -p tsconfig.server.json`) into separate output folders. The server then serves the static frontend and handles API calls from the same process.

### Updating the Gemini Model

The active model is controlled by the `GEMINI_MODEL` env var. To switch models:

1. Go to Render dashboard → your service → **Environment**
2. Update `GEMINI_MODEL` to any supported model (e.g. `gemini-2.5-pro`)
3. Render redeploys automatically — no code change needed

---

## API Reference

All endpoints are served from the same Express server.

### `POST /api/predict`

Classify a leaf image and generate a disease report.

**Request body** (`application/json`):
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQ...",
  "filename": "leaf.jpg"
}
```

**Response** (`200 OK`):
```json
{
  "id": "rec_f3a2b1c",
  "filename": "leaf.jpg",
  "crop": "Tomato",
  "condition": "Late Blight",
  "disease": "Tomato Late Blight",
  "confidence": 94.2,
  "timestamp": "2026-07-05T10:30:00Z",
  "report": {
    "overview": "Tomato late blight is caused by Phytophthora infestans...",
    "symptoms": ["Dark water-soaked lesions", "White mildew on leaf undersides"],
    "causes": ["Cool wet conditions", "Fungal spores via wind"],
    "organicTreatment": ["Copper fungicide spray", "Remove infected plants"],
    "chemicalTreatment": ["Chlorothalonil", "Mancozeb applications"],
    "prevention": ["Drip irrigation", "Wide plant spacing"],
    "farmerAdvice": "Monitor fields daily during wet weather..."
  },
  "image": "data:image/jpeg;base64,..."
}
```

**Error responses**:
| Code | Reason |
|---|---|
| `400` | No image provided, invalid format, or non-leaf image detected |
| `413` | Image too large (> 50MB) |
| `500` | Gemini API error or server failure |

---

### `GET /api/history`

Returns all previous scan records as a JSON array, newest first.

---

### `DELETE /api/history/:id`

Deletes a scan record by its `id`.

```
DELETE /api/history/rec_f3a2b1c
```

---

### `GET /api/health`

Returns service status.

```json
{
  "status": "ok",
  "cnn_model": "loaded",
  "gemini": "active",
  "database": "connected (local_json)",
  "timestamp": "2026-07-05T10:30:00Z"
}
```

---

## Docker (Python/Flask Variant)

The repo also includes a Python/Flask backend with a TensorFlow CNN model for local/academic use.

```bash
# Start Flask API + MongoDB with one command
docker compose up --build
```

This starts:
- **MongoDB** on `localhost:27017`
- **Flask API** on `localhost:5000`

Set your API key in `docker-compose.yml` before running:
```yaml
environment:
  - GEMINI_API_KEY=your_key_here
```

### Training the CNN Model

```bash
# Install Python dependencies
pip install -r requirements.txt

# Download PlantVillage dataset and structure it as:
# dataset/plantvillage/<ClassName>/<image>.jpg

# Train
python cnn/train.py

# Test a single image
python -m cnn.predict path/to/leaf.jpg
```

The training script uses data augmentation (rotations, flips, zoom), batch normalization, dropout, and early stopping. The trained model is saved to `models/plantvillage_cnn.h5`.

---

## Supported Crops & Diseases

The classifier covers 38 PlantVillage classes across these crops:

`Apple` · `Blueberry` · `Cherry` · `Corn` · `Grape` · `Orange` · `Peach` · `Pepper Bell` · `Potato` · `Raspberry` · `Soybean` · `Squash` · `Strawberry` · `Tomato`

Each crop has healthy and one or more disease variants (e.g. Early Blight, Late Blight, Leaf Scorch, Bacterial Spot, etc.).

---

## License

Apache 2.0 — see [LICENSE](LICENSE) for details.

Built as a final-year college project demonstrating Deep Learning + Generative AI integration.
