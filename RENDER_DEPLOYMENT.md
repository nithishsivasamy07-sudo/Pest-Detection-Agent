# 🚀 Deploying Pest & Crop Disease Detection Agent to Render

This guide provides step-by-step instructions to deploy your application to **Render**. We support two deployment approaches based on your requirements:

---

## 💡 Option 1: Deploy the Unified Node.js Web Server (Recommended & Simplest)

This approach compiles your **React Frontend** and runs a single unified **Node.js/TypeScript backend** (`server.ts`).
- **Why Choose This**: Extremely lightweight, starts up in seconds, requires no database setup (uses secure, local `history.json` persistence), and directly invokes Gemini for classification and detailed diagnosis reports.
- **Render Tier**: 100% Free Tier compatible.

### Step-by-Step Instructions:

1. **Upload your code to GitHub**
   - Create a new repository on [GitHub](https://github.com).
   - Commit and push all files in this directory to your new repository.

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/) and sign in.
   - Click **New +** in the top-right corner and select **Web Service**.
   - Connect your GitHub account and select your repository.

3. **Configure the Service Settings**
   - **Name**: `pest-detection-agent` (or any name you prefer)
   - **Region**: Select the region closest to your users.
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: **Free**

4. **Add Environment Variables**
   Under the **Environment** tab, click **Add Environment Variable** and add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: *(Your Google Gemini API Key)*

5. **Deploy!**
   - Click **Deploy Web Service**. Render will automatically clone your repo, compile your React code, build your production server, and open your live website URL!

---

## 🐍 Option 2: Deploy Python Flask & MongoDB (For Advanced College Submissions)

If your college project requires a **Python Flask API**, a **MongoDB database**, and local **TensorFlow CNN** model prediction:

### Step-by-Step Instructions:

### Part A: Spin up MongoDB Atlas (Cloud Database)
Render does not host free-tier databases natively, so you must get a free cloud database from **MongoDB Atlas**:
1. Sign up on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a free-tier M0 Cluster.
3. Under **Database Access**, create a database user with a secure password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) so Render can connect to it.
5. In your cluster dashboard, click **Connect** -> **Drivers** and copy your **Connection String**:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### Part B: Deploy Flask Python API on Render
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Select your repository.
3. Configure settings:
   - **Name**: `pest-detection-flask-api`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn backend.app:app`
   - **Instance Type**: **Free**
4. Under **Environment Variables**, add:
   - **Key**: `MONGO_URI`
   - **Value**: *(Your MongoDB Atlas connection string from Part A)*
   - **Key**: `GEMINI_API_KEY`
   - **Value**: *(Your Google Gemini API Key)*
5. Click **Deploy Web Service**. Note down the provided backend URL (e.g., `https://pest-detection-flask-api.onrender.com`).

---

## 🛠️ Configuration Files Already Created

To make your deployment painless, we have created:
1. **`render.yaml`**: The blueprint configuration that allows one-click service generation in Render.
2. **Dynamic Port Mapping**: Updated `server.ts` to read the dynamic environment port `process.env.PORT` which is a strict requirement for Render services.
3. **Windows Workaround**: Adjusted `backend/app.py` watchdog reload options so your local Windows environment runs without `WinError 10038` socket errors.

Enjoy your deployed application! Let us know if you need any further customization.
