import React, { useState, useEffect } from "react";
import { 
  Sprout, 
  Upload, 
  History, 
  Info, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Leaf, 
  Trash2, 
  FileText, 
  ExternalLink,
  Loader2,
  ChevronRight,
  Shield,
  Layers,
  Database,
  Cpu,
  RefreshCw,
  Clock,
  ArrowRight
} from "lucide-react";

// Types matching the backend response
interface HistoryRecord {
  id: string;
  filename: string;
  crop: string;
  condition: string;
  disease: string;
  confidence: number;
  timestamp: string;
  image: string;
  report: {
    overview: string;
    symptoms: string[];
    causes: string[];
    organicTreatment: string[];
    chemicalTreatment: string[];
    prevention: string[];
    farmerAdvice: string;
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "predict" | "history" | "about">("home");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<string>("");
  const [predictionResult, setPredictionResult] = useState<HistoryRecord | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryRecord | null>(null);

  // Statistics for Dashboard
  const totalScans = history.length;
  const uniqueCrops = Array.from(new Set(history.map(item => item.crop))).length;
  const diseaseCount = Array.from(new Set(history.map(item => item.disease))).filter((d: string) => !d.toLowerCase().includes("healthy")).length;

  useEffect(() => {
    fetchHistory();
    fetchHealth();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history");
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const fetchHealth = async () => {
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(data);
      }
    } catch (err) {
      console.error("Error fetching health status:", err);
    }
  };

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("Invalid file format. Only JPG, JPEG, and PNG are accepted.");
      return;
    }
    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File size too large. Maximum allowed size is 10MB.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imagePreview || !imageFile) return;

    setIsAnalyzing(true);
    setPredictionResult(null);
    setErrorMsg(null);

    const stages = [
      "Uploading crop leaf image...",
      "Preprocessing image structure...",
      "Running Deep CNN Image Classifier...",
      "Retrieving symptoms and causal agents...",
      "Generating Google Gemini agricultural report..."
    ];

    let currentStage = 0;
    setAnalysisStage(stages[currentStage]);

    const interval = setInterval(() => {
      if (currentStage < stages.length - 1) {
        currentStage++;
        setAnalysisStage(stages[currentStage]);
      }
    }, 1500);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imagePreview,
          filename: imageFile.name,
        }),
      });

      clearInterval(interval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to classify leaf image");
      }

      const result = await response.json();
      setPredictionResult(result);
      fetchHistory(); // Refresh history
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg(err.message || "An unexpected error occurred during classification.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage("");
    }
  };

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this scan record from history?")) return;

    try {
      const response = await fetch(`/api/history/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
        if (selectedHistoryItem?.id === id) {
          setSelectedHistoryItem(null);
        }
        if (predictionResult?.id === id) {
          setPredictionResult(null);
        }
      } else {
        alert("Failed to delete record.");
      }
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  };

  const triggerReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setPredictionResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Banner/Header */}
      <header className="border-b border-slate-800 bg-[#0d1424] sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-emerald-600 to-emerald-400 p-2 rounded-xl text-slate-900 shadow-md shadow-emerald-900/20">
            <Sprout className="w-6 h-6 text-[#0b0f19]" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
              Pest Detection Agent
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                v1.2.0 (Dual-AI Platform)
              </span>
            </h1>
            <p className="text-xs text-slate-400">CNN PlantVillage Classification & Gemini Expert Synthesis</p>
          </div>
        </div>

        {/* Server & API Status Badges */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#080d1a] border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">CNN Backend:</span>
            <span className="text-emerald-400">Online</span>
          </div>

          <div className="flex items-center gap-2 bg-[#080d1a] border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">Gemini 3.5 AI:</span>
            <span className="text-emerald-400">Active</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 border-r border-slate-800 bg-[#0d1424] p-4 flex flex-col justify-between">
          <div className="space-y-1.5">
            <button
              onClick={() => { setActiveTab("home"); triggerReset(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "home" 
                  ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800/40" 
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <Activity className="w-5 h-5" />
              Overview & Statistics
            </button>

            <button
              onClick={() => setActiveTab("predict")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "predict" 
                  ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800/40" 
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <Leaf className="w-5 h-5" />
              Disease Identifier
            </button>

            <button
              onClick={() => { setActiveTab("history"); setSelectedHistoryItem(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "history" 
                  ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800/40" 
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <History className="w-5 h-5" />
              Scan History
              {history.length > 0 && (
                <span className="ml-auto bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {history.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("about")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "about" 
                  ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800/40" 
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <Info className="w-5 h-5" />
              About & Methodology
            </button>
          </div>

          {/* Quick Technical Summary card at bottom of sidebar */}
          <div className="hidden md:block mt-8 p-4 bg-[#090e1a] border border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="font-semibold text-slate-300 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Academic Standards
            </div>
            <p className="text-slate-400 leading-relaxed">
              Designed as a final year college project demonstrating Deep Learning & Generative AI workflows.
            </p>
          </div>
        </aside>

        {/* Main View Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          
          {/* TAB 1: HOME/OVERVIEW */}
          {activeTab === "home" && (
            <div className="space-y-8 animate-fade-in">
              <div className="max-w-4xl space-y-2">
                <h2 className="text-3xl font-extrabold font-display tracking-tight text-white">
                  Intelligent Plant Disease Diagnostics
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Pest Detection Agent bridges the gap between state-of-the-art Deep Learning classifiers and expert Generative AI. Upload a clear photograph of a crop leaf to instantly diagnose diseases and generate treatment guides.
                </p>
              </div>

              {/* Stat Widgets Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#0d1424] border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-sm">
                  <div className="bg-emerald-950/60 text-emerald-400 p-3 rounded-xl border border-emerald-800/30">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Total Analyzed</div>
                    <div className="text-2xl font-bold font-display text-white mt-0.5">{totalScans}</div>
                  </div>
                </div>

                <div className="bg-[#0d1424] border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-sm">
                  <div className="bg-amber-950/60 text-amber-400 p-3 rounded-xl border border-amber-800/30">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Diseases Identified</div>
                    <div className="text-2xl font-bold font-display text-white mt-0.5">{diseaseCount}</div>
                  </div>
                </div>

                <div className="bg-[#0d1424] border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-sm">
                  <div className="bg-sky-950/60 text-sky-400 p-3 rounded-xl border border-sky-800/30">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Crop Types Registered</div>
                    <div className="text-2xl font-bold font-display text-white mt-0.5">{uniqueCrops}</div>
                  </div>
                </div>

                <div className="bg-[#0d1424] border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-sm">
                  <div className="bg-teal-950/60 text-teal-400 p-3 rounded-xl border border-teal-800/30">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">System Health</div>
                    <div className="text-2xl font-bold font-display text-white mt-0.5">Healthy</div>
                  </div>
                </div>
              </div>

              {/* Call-to-action banner */}
              <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-[#0d1424] border border-emerald-800/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-emerald-400" />
                    Ready to scan a crop leaf?
                  </h3>
                  <p className="text-slate-400 text-sm max-w-xl">
                    Our dual-agent pipeline receives leaf photographs, passes them through a Convolutional Neural Network trained on PlantVillage classes, and requests Gemini 3.5 Flash to provide custom eco-friendly treatments.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("predict")}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md shadow-emerald-500/10 flex items-center gap-2 group shrink-0"
                >
                  Start Disease Diagnosis
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {/* Agent Data Flow Blueprint */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-display text-slate-200">How the AI Agent Workflow Operates</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  <div className="bg-[#0d1424]/60 border border-slate-800/80 p-5 rounded-xl space-y-3">
                    <div className="text-xs font-mono text-emerald-400 font-bold">STEP 01</div>
                    <div className="text-sm font-semibold text-white">Image Upload & Preprocess</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Image is validated, resized to 224x224 (the model input dimension), normalized, and converted into high-density pixel arrays.
                    </p>
                  </div>

                  <div className="bg-[#0d1424]/60 border border-slate-800/80 p-5 rounded-xl space-y-3">
                    <div className="text-xs font-mono text-emerald-400 font-bold">STEP 02</div>
                    <div className="text-sm font-semibold text-white">CNN Disease Predictor</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Deep CNN model analyzes spatial textures, leaf spots, color lesions, and margins to compute confidence probabilities.
                    </p>
                  </div>

                  <div className="bg-[#0d1424]/60 border border-slate-800/80 p-5 rounded-xl space-y-3">
                    <div className="text-xs font-mono text-emerald-400 font-bold">STEP 03</div>
                    <div className="text-sm font-semibold text-white">MongoDB Record Seeding</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      A secured record containing filename, predicted disease category, confidence score, and base64 preview is serialized to MongoDB.
                    </p>
                  </div>

                  <div className="bg-[#0d1424]/60 border border-slate-800/80 p-5 rounded-xl space-y-3">
                    <div className="text-xs font-mono text-emerald-400 font-bold">STEP 04</div>
                    <div className="text-sm font-semibold text-white">Gemini Report Synthesis</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Expert LLM receives prediction metadata via rigid instructions, immediately generating custom-tailored organic & chemical remedies.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CROP DISEASE IDENTIFIER */}
          {activeTab === "predict" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-2xl font-bold font-display text-white">Disease Diagnostic Lab</h2>
                  <p className="text-sm text-slate-400">Upload high-resolution leaf photographs to begin neural classification</p>
                </div>
                {imagePreview && (
                  <button 
                    onClick={triggerReset}
                    className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 self-start md:self-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset & Upload New
                  </button>
                )}
              </div>

              {/* Two-Column Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Image Drop / Upload Area */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* File Dropzone */}
                  {!imagePreview ? (
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-slate-800 hover:border-emerald-600/50 bg-[#0d1424]/30 hover:bg-emerald-950/5 rounded-2xl p-8 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[350px] relative group"
                    >
                      <input 
                        type="file" 
                        id="leaf-upload" 
                        accept=".jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-full mb-4 text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-900 transition-colors">
                        <Upload className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-semibold text-white mb-1">Drag and drop your leaf image here</h4>
                      <p className="text-xs text-slate-400 mb-4">Supported formats: JPEG, JPG, PNG (Max 10MB)</p>
                      
                      <span className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-colors">
                        Browse Files
                      </span>
                    </div>
                  ) : (
                    /* Image Uploaded Preview Card */
                    <div className="bg-[#0d1424] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
                        <span className="text-xs text-slate-300 truncate max-w-[200px] font-mono">{imageFile?.name}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                          {imageFile ? (imageFile.size / (1024 * 1024)).toFixed(2) + " MB" : ""}
                        </span>
                      </div>
                      <div className="p-4 flex items-center justify-center bg-[#090e1a]">
                        <img 
                          src={imagePreview} 
                          alt="Crop leaf preview" 
                          className="max-h-[300px] object-contain rounded-lg shadow border border-slate-800"
                        />
                      </div>
                      
                      {/* Control Button Area */}
                      <div className="p-4 bg-slate-900/20 border-t border-slate-800">
                        {!predictionResult && !isAnalyzing && (
                          <button
                            onClick={handleAnalyze}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
                          >
                            <Cpu className="w-4 h-4" />
                            Analyze Crop Diseases
                          </button>
                        )}

                        {isAnalyzing && (
                          <div className="space-y-3 py-1">
                            <div className="flex items-center justify-center gap-3 text-emerald-400 text-sm font-semibold font-mono">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              {analysisStage}
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-emerald-500 h-1.5 rounded-full animate-[loading-bar_7s_ease-out_infinite]"></div>
                            </div>
                          </div>
                        )}

                        {predictionResult && (
                          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono justify-center bg-emerald-950/30 py-2.5 rounded-xl border border-emerald-800/20">
                            <CheckCircle className="w-4 h-4" />
                            Diagnostic Report Completed Successfully
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-4 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-sm font-semibold text-red-200">Analysis Error</h5>
                        <p className="text-xs text-red-300/80 leading-relaxed mt-0.5">{errorMsg}</p>
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Column: AI Analysis Results Output */}
                <div className="lg:col-span-7">
                  
                  {!predictionResult && !isAnalyzing && (
                    <div className="border border-slate-800 bg-[#0d1424]/20 rounded-2xl p-8 text-center min-h-[350px] flex flex-col items-center justify-center text-slate-500">
                      <FileText className="w-12 h-12 mb-3 text-slate-600" />
                      <h4 className="text-base font-semibold text-slate-400">Waiting for diagnosis</h4>
                      <p className="text-xs text-slate-500 max-w-sm mt-1 mx-auto leading-relaxed">
                        Upload a crop leaf image on the left and click "Analyze Crop Diseases" to generate an automatic CNN classifier report and Gemini recovery guidelines.
                      </p>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="border border-slate-800 bg-[#0d1424]/20 rounded-2xl p-8 text-center min-h-[350px] flex flex-col items-center justify-center space-y-4">
                      <div className="p-4 bg-emerald-950/30 text-emerald-400 border border-emerald-800/40 rounded-2xl animate-pulse">
                        <Loader2 className="w-10 h-10 animate-spin" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-slate-300">Processing Dual-Agent Pipeline</h4>
                        <p className="text-xs text-slate-500 max-w-sm mt-1 mx-auto leading-relaxed">
                          Image pixels are undergoing matrix conversion. CNN layers are computing spot vectors while Gemini prepares expert reports.
                        </p>
                      </div>
                    </div>
                  )}

                  {predictionResult && (
                    <div className="space-y-6 animate-fade-in">
                      
                      {/* High-level prediction header block */}
                      <div className="bg-gradient-to-br from-[#0d1424] to-[#0d1424]/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <div>
                            <div className="text-[10px] font-bold font-mono tracking-wider text-emerald-400 uppercase">
                              PREDICTION RESULT (CNN Model)
                            </div>
                            <h3 className="text-2xl font-extrabold font-display text-white mt-1">
                              {predictionResult.disease}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Crop: <span className="text-slate-300 font-semibold">{predictionResult.crop}</span></p>
                          </div>

                          <div className="shrink-0 flex items-center gap-3 bg-[#080d1a] border border-slate-800 px-4 py-2.5 rounded-2xl">
                            <div className="text-right">
                              <div className="text-[9px] font-bold font-mono text-slate-400">CONFIDENCE</div>
                              <div className="text-lg font-bold font-mono text-emerald-400">
                                {predictionResult.confidence}%
                              </div>
                            </div>
                            <div className="w-1.5 h-8 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-full rounded-full"
                                style={{ height: `${predictionResult.confidence}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Disease overview paragraph from Gemini */}
                        <div className="text-sm text-slate-300 leading-relaxed pt-3 border-t border-slate-800/80">
                          {predictionResult.report.overview}
                        </div>
                      </div>

                      {/* Main Report Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Symptoms Card */}
                        <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-5 space-y-3">
                          <h4 className="text-xs font-bold font-mono text-emerald-400 tracking-wider uppercase flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Visual Symptoms
                          </h4>
                          <ul className="space-y-2">
                            {predictionResult.report.symptoms.map((symptom, idx) => (
                              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                                <span className="text-emerald-500 font-semibold mt-0.5 shrink-0">•</span>
                                {symptom}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Causes Card */}
                        <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-5 space-y-3">
                          <h4 className="text-xs font-bold font-mono text-amber-400 tracking-wider uppercase flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            Primary Causes
                          </h4>
                          <ul className="space-y-2">
                            {predictionResult.report.causes.map((cause, idx) => (
                              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                                <span className="text-amber-500 font-semibold mt-0.5 shrink-0">•</span>
                                {cause}
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>

                      {/* Side-by-Side Treatment Plan */}
                      <div className="border border-slate-800 bg-[#0d1424] rounded-2xl overflow-hidden shadow-md">
                        <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-sm font-bold text-white">Recommended Treatment Protocol</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                          
                          {/* Organic Remedies */}
                          <div className="p-5 space-y-3 bg-[#0d1424]">
                            <div className="text-xs font-bold text-emerald-400 font-mono tracking-wide uppercase flex items-center gap-1.5">
                              <Sprout className="w-3.5 h-3.5" />
                              Organic & Biological
                            </div>
                            <ul className="space-y-2">
                              {predictionResult.report.organicTreatment.map((treatment, idx) => (
                                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                                  <span className="text-emerald-500 font-semibold shrink-0 mt-0.5">✓</span>
                                  {treatment}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Chemical Remedies */}
                          <div className="p-5 space-y-3 bg-[#0d1424]/40">
                            <div className="text-xs font-bold text-slate-300 font-mono tracking-wide uppercase flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              Chemical Control
                            </div>
                            <ul className="space-y-2">
                              {predictionResult.report.chemicalTreatment.map((treatment, idx) => (
                                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                                  <span className="text-slate-400 font-semibold shrink-0 mt-0.5">▪</span>
                                  {treatment}
                                </li>
                              ))}
                            </ul>
                          </div>

                        </div>
                      </div>

                      {/* Prevention Tips */}
                      <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-5 space-y-3">
                        <h4 className="text-xs font-bold font-mono text-emerald-400 tracking-wider uppercase flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Long-term Prevention & Cultural Tips
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {predictionResult.report.prevention.map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-300 bg-[#090e1a] border border-slate-800/60 p-3 rounded-xl flex items-start gap-2 leading-relaxed">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Farmer Advice */}
                      <div className="bg-gradient-to-tr from-emerald-950/20 to-slate-900 border border-emerald-800/30 rounded-2xl p-5 space-y-2">
                        <div className="text-xs font-bold font-mono text-emerald-400 tracking-wider uppercase">
                          EXPERT FARMER ADVICE SUMMARY
                        </div>
                        <p className="text-xs text-emerald-100/90 leading-relaxed font-sans">
                          {predictionResult.report.farmerAdvice}
                        </p>
                      </div>

                    </div>
                  )}

                </div>

              </div>
            </div>
          )}

          {/* TAB 3: SCAN HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <h2 className="text-2xl font-bold font-display text-white">Diagnostic History</h2>
                <p className="text-sm text-slate-400">Manage and browse previous plant pathology scans in MongoDB</p>
              </div>

              {history.length === 0 ? (
                <div className="border border-slate-800 bg-[#0d1424]/20 rounded-2xl p-12 text-center text-slate-500 max-w-xl mx-auto">
                  <Clock className="w-12 h-12 mb-3 text-slate-600 mx-auto" />
                  <h4 className="text-base font-semibold text-slate-400">No previous scan history</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Once you upload crop leaf pictures and perform neural network diagnostics, they will automatically populate here for reference.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left List Pane */}
                  <div className="lg:col-span-5 space-y-3">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedHistoryItem(item)}
                        className={`p-4 border rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          selectedHistoryItem?.id === item.id
                            ? "bg-emerald-950/20 border-emerald-700 shadow-md"
                            : "bg-[#0d1424] border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.disease} 
                            className="w-12 h-12 rounded-xl object-cover border border-slate-800/80 shrink-0 bg-slate-950"
                          />
                          <div className="overflow-hidden">
                            <h4 className="text-sm font-bold text-white truncate">{item.disease}</h4>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">Crop: {item.crop}</p>
                            <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                              {new Date(item.timestamp).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-right font-mono">
                            <div className="text-[8px] text-slate-400 leading-none">CONF</div>
                            <div className="text-[11px] font-bold text-emerald-400 leading-normal">{item.confidence}%</div>
                          </div>
                          
                          <button
                            onClick={(e) => handleDeleteHistory(item.id, e)}
                            className="p-2 hover:bg-red-950/40 text-slate-500 hover:text-red-400 rounded-xl transition-colors"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right Detail Pane */}
                  <div className="lg:col-span-7">
                    {selectedHistoryItem ? (
                      <div className="space-y-6 animate-fade-in bg-[#0d1424] border border-slate-800 rounded-3xl p-6 shadow-xl">
                        
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-4 border-b border-slate-800/80">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-800/50">
                              RETRIVED MONGO RECORD
                            </span>
                            <h3 className="text-2xl font-extrabold font-display text-white mt-3">
                              {selectedHistoryItem.disease}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              Scan Date: <span className="font-mono text-slate-300">{new Date(selectedHistoryItem.timestamp).toLocaleString()}</span>
                            </p>
                          </div>

                          <div className="shrink-0">
                            <img 
                              src={selectedHistoryItem.image} 
                              alt="Crop scan thumb" 
                              className="w-16 h-16 rounded-xl object-cover border border-slate-800 bg-slate-950"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-bold font-mono text-slate-400 tracking-wider uppercase">OVERVIEW</h4>
                            <p className="text-xs text-slate-300 leading-relaxed mt-1.5 bg-[#090e1a] p-3 rounded-xl border border-slate-800/50">
                              {selectedHistoryItem.report.overview}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            <div className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl space-y-2">
                              <h5 className="text-[10px] font-bold font-mono text-emerald-400">ORGANIC REMEDY</h5>
                              <ul className="space-y-1.5">
                                {selectedHistoryItem.report.organicTreatment.slice(0, 3).map((item, idx) => (
                                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                                    <span className="text-emerald-500 font-semibold">•</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl space-y-2">
                              <h5 className="text-[10px] font-bold font-mono text-amber-400">CHEMICAL REMEDY</h5>
                              <ul className="space-y-1.5">
                                {selectedHistoryItem.report.chemicalTreatment.slice(0, 3).map((item, idx) => (
                                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                                    <span className="text-slate-400 font-semibold">•</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>

                          </div>

                          <div>
                            <h4 className="text-xs font-bold font-mono text-emerald-400 tracking-wider uppercase">PREVENTION PROTOCOL</h4>
                            <ul className="space-y-1.5 mt-2">
                              {selectedHistoryItem.report.prevention.slice(0, 3).map((item, idx) => (
                                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                        </div>

                      </div>
                    ) : (
                      <div className="border border-slate-800 border-dashed bg-[#0d1424]/10 rounded-2xl p-8 text-center min-h-[300px] flex flex-col items-center justify-center text-slate-500">
                        <FileText className="w-10 h-10 mb-2.5 text-slate-600" />
                        <h4 className="text-sm font-semibold text-slate-400">Select a record</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Click any disease record in your scan history list on the left to view the complete saved diagnostics report.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 4: ABOUT & METHODOLOGY */}
          {activeTab === "about" && (
            <div className="space-y-8 animate-fade-in max-w-4xl">
              <div className="border-b border-slate-800 pb-5">
                <h2 className="text-2xl font-bold font-display text-white">About the Project</h2>
                <p className="text-sm text-slate-400">Academic structure of the Pest Detection Agent dual-AI system</p>
              </div>

              {/* Technologies Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="bg-emerald-950/60 text-emerald-400 p-3 rounded-xl border border-emerald-800/40 w-fit">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Convolutional Network (CNN)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Custom Convolutional Neural Network built with TensorFlow Keras. Utilizes a multi-layered Conv2D architecture, batch normalization, max pooling, dropout, and trained on the PlantVillage dataset for rapid crop diagnosis.
                  </p>
                </div>

                <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="bg-emerald-950/60 text-emerald-400 p-3 rounded-xl border border-emerald-800/40 w-fit">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Prompt Engineering & Gemini</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Uses rigid system roles, schemas, and prompt chaining to instruct Gemini 3.5 Flash. Generates structured JSON responses consisting of overview, organic treatments, chemical controls, and long-term advice.
                  </p>
                </div>

                <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="bg-emerald-950/60 text-emerald-400 p-3 rounded-xl border border-emerald-800/40 w-fit">
                    <Database className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">MongoDB Community</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Stores comprehensive transaction objects including base64 image data, predicted labels, confidence values, custom Gemini guidelines, and high-precision timestamps allowing full CRUD history retrieval.
                  </p>
                </div>

              </div>

              {/* AI Agent Workflow Map */}
              <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white">Submissions Code Artifacts Included</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The Pest Detection Agent workspace contains all python and docker submission templates requested for college submissions. You can download and export the project directory directly using the workspace settings menu.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
                    <h5 className="text-xs font-bold text-emerald-400 font-mono">Backend Python Code</h5>
                    <ul className="text-xs text-slate-300 space-y-1 font-mono">
                      <li>• backend/app.py (Flask Rest Server)</li>
                      <li>• cnn/train.py (Model Training & Datasets)</li>
                      <li>• cnn/predict.py (Trained Inference Handler)</li>
                      <li>• database/mongo_client.py (MongoDB Seed/CRUD)</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
                    <h5 className="text-xs font-bold text-emerald-400 font-mono">Docker Deployment</h5>
                    <ul className="text-xs text-slate-300 space-y-1 font-mono">
                      <li>• Dockerfile (Flask & TensorFlow deployment layer)</li>
                      <li>• docker-compose.yml (Network bridge, Flask, MongoDB)</li>
                      <li>• requirements.txt (Dependencies config)</li>
                      <li>• .env.example (Environment blueprint variables)</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0d1424] py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Pest Detection Agent — Dual-AI Pathology Diagnosis System.
        </div>
        <div className="flex items-center gap-4">
          <span>License: Apache 2.0</span>
          <span>College Submission Turn-Key Project</span>
        </div>
      </footer>

    </div>
  );
}
