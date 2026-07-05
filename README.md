# Pest Detection Agent — Crop Disease Diagnostics System

An AI-powered full-stack web application designed to identify plant and crop leaf diseases from uploaded images. This project implements a **Convolutional Neural Network (CNN)** trained on the PlantVillage dataset to perform leaf classification and leverages **Google Gemini AI** to produce highly detailed, eco-friendly treatment guides, preventative instructions, and expert recommendations for farmers.

---

## 🌟 Key Features

* **Dual-AI Architecture**: Leverages standard, high-precision Deep CNNs for image classification and Google Gemini 1.5/3.5 models for expert text generation.
* **Responsive Farmer Dashboard**: A clean, modern interface styled using custom slate, emerald, and sage palettes, supporting touch targets, quick navigation, drag-and-drop file imports, and clear result visualization.
* **Structured Treatment Guides**: Outputs both **Organic/Biological** and **Chemical** control protocols.
* **Persistent Diagnostics Records**: Uses **MongoDB** (JSON schemas locally) to record full scan histories with preview thumbnails, enabling CRUD search and quick retrieval.
* **Restful Service Integrations**: Standardized API surface supporting:
  * `POST /api/predict` — Leaf image binary upload, preprocessing, neural computation, database seeding, and report synthesis.
  * `GET /api/history` — Historical scan records.
  * `DELETE /api/history/<id>` — Scan record deletion.
  * `GET /api/health` — Platform/services check.

---

## 🔬 System Architecture & Data Flow

```
   [Farmer User] ──(Upload Leaf Image)──> [React Frontend UI]
                                                 │
                                                 ▼
   [MongoDB Records] <──(Save Transaction)── [Flask/Express API Engine]
          │                                      │          │
          │                                      ▼          ▼
          │                            [TensorFlow CNN]   [Google Gemini]
          │                           (Disease Diagnosis) (Remedy Synthesizer)
          │                                      │          │
          ▼                                      ▼          ▼
   [History Dashboard] <──────(Return Compiled Report)──────┘
```

1. **Upload & Preprocess**: The farmer uploads a JPG/PNG of a crop leaf. The system validates dimensions, normalizes pixels, and converts the image structure.
2. **CNN Diagnostics**: The image is passed through a deep Convolutional Neural Network trained on the PlantVillage dataset to produce condition probabilities.
3. **Seeding Database**: The prediction, confidence value, and filename are registered as a transaction in MongoDB.
4. **LLM Synthesis**: Gemini 3.5/1.5 Flash receives the predicted condition and compiles localized organic and chemical treatments.
5. **Dashboard Rendering**: The compiled results are displayed instantly in the responsive UI.

---

## 🛠 Technology Stack

* **Frontend**: React (v19), TypeScript, Tailwind CSS, Lucide icons, Motion effects.
* **Backend**: Flask (Python) / Express (Node.js/Vite environment proxy).
* **Deep Learning**: TensorFlow & Keras.
* **Generative AI**: Google Gemini API via official SDKs.
* **Database**: MongoDB / Local serialized JSON store.
* **Deployment**: Docker, Docker Compose.

---

## 📥 Local Installation & Setup

### Prerequisites

Ensure you have the following installed locally:
* Python 3.10+
* Node.js (v18+) & npm
* MongoDB Community Edition OR Docker

### Setup Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY_HERE"
MONGO_URI="mongodb://localhost:27017/"
MODEL_PATH="models/plantvillage_cnn.h5"
```

### Run Python Flask Backend Locally
1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the application:
   ```bash
   python backend/app.py
   ```

### Run React Frontend Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development build:
   ```bash
   npm run dev
   ```

---

## 📦 Docker Containerized Deployment

To spin up the entire application stack (Flask Web Server + MongoDB Database) instantly with one command:

```bash
docker compose up --build
```

This starts:
* **MongoDB Container** on `localhost:27017`
* **Flask Server API** on `localhost:5000`

---

## 🧬 Dataset & CNN Model Training

The CNN classifier is trained on the **PlantVillage dataset**, which contains 54,303 healthy and diseased crop leaf images categorized into 38 distinct classes.

### Model Training Instructions

1. Download the PlantVillage dataset from Kaggle or official academic channels.
2. Structure the dataset directory as:
   ```
   dataset/
     plantvillage/
       Tomato_Early_Blight/
       Tomato_Healthy/
       Potato_Late_Blight/
       ...
   ```
3. Run the training script:
   ```bash
   python cnn/train.py
   ```
This script leverages **Data Augmentation** (rotations, zoom, flips), **Batch Normalization** to stabilize training, **EarlyStopping** to prevent overfitting, and saves the best iteration to `models/plantvillage_cnn.h5`.

### Standalone Classification Inference

To run command-line predictions on arbitrary test images:
```bash
python -m cnn.predict path/to/leaf_image.jpg
```

---

## 📋 REST API Endpoints

### 1. Execute Diagnostics
* **URL**: `/api/predict`
* **Method**: `POST`
* **Content-Type**: `application/json` (or `multipart/form-data`)
* **Payload**:
  ```json
  {
    "image": "data:image/png;base64,iVBORw0KGgo...",
    "filename": "tomato_leaf_spot.png"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "id": "rec_f3a2b1",
    "filename": "tomato_leaf_spot.png",
    "crop": "Tomato",
    "condition": "Late Blight",
    "disease": "Tomato Late Blight",
    "confidence": 94.2,
    "timestamp": "2026-07-04T21:16:30Z",
    "report": {
      "overview": "Tomato late blight is a devastating disease caused by the fungus-like oomycete Phytophthora infestans...",
      "symptoms": ["Dark water-soaked lesions on leaves", "White mildew on leaf undersides"],
      "causes": ["Cool, wet conditions", "Fungal spores spreading through wind"],
      "organicTreatment": ["Apply copper fungicides", "Remove and bury infected plants"],
      "chemicalTreatment": ["Chlorothalonil spray applications", "Mancozeb applications"],
      "prevention": ["Maintain leaf dryness", "Ensure wide spacing", "Drip irrigation"],
      "farmerAdvice": "Monitor fields daily during moist weather. Immediately destroy localized outbreaks."
    }
  }
  ```

### 2. Retrieve Scan History
* **URL**: `/api/history`
* **Method**: `GET`
* **Response**: Array of historical scan objects stored in MongoDB.

### 3. Delete Historical Record
* **URL**: `/api/history/<record_id>`
* **Method**: `DELETE`
* **Response**: Success status.

### 4. Health & Live Monitoring
* **URL**: `/api/health`
* **Method**: `GET`
* **Response**: Hardware, database, API service, and CNN model statuses.

---

## 🚀 Future Enhancements

* **GPS Grounding**: Add geolocation parameters to database records to track crop disease spread maps geographically.
* **Offline Native Inference**: Integrate TensorFlow.js to run the CNN classifier directly on the client's browser, enabling connection-less diagnostics.
* **Weather Integration**: Sync real-time micro-climate metrics to advise farmers on disease outbreak risks.

---

## 📄 License

This project is licensed under the Apache 2.0 License. Designed for academic final-year portfolio submission.
