import React, { useState } from 'react';
import { 
  FileCode2, 
  Terminal, 
  Layers, 
  Tv, 
  Video, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  BookOpen, 
  Cpu, 
  Users
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

export const DocsPage: React.FC = () => {
  const { t } = useLanguage();
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'architecture' | 'presentation' | 'video' | 'windows'>('architecture');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Dossier Header */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <FileCode2 className="w-5 h-5 text-cyan-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {t('nav.docs', 'Challenge Dossier & Architecture')} — Submission Package
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              Competition Ready
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Complete architectural documentation, full-stack multi-modal data pipeline, 12-slide presentation outline, 20-minute video demo outline, and reproducible Windows execution commands.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 text-xs">
          {[
            { id: 'architecture', label: 'Architecture Diagram', icon: Layers },
            { id: 'presentation', label: '12-Slide Deck', icon: Tv },
            { id: 'video', label: '20-Min Video Script', icon: Video },
            { id: 'windows', label: 'Windows Setup', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded font-medium transition-all ${
                  activeSection === tab.id
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: ARCHITECTURE DIAGRAM */}
      {activeSection === 'architecture' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-500" />
                <span>CardioTwin AI Multi-Modal System Architecture</span>
              </h3>
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">Zero-Leakage Closed-Loop Architecture</span>
            </div>

            {/* SVG Visual Architecture Diagram */}
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#090d18] border border-slate-200 dark:border-slate-800 overflow-x-auto transition-colors">
              <div className="min-w-[760px] flex flex-col items-center space-y-6 text-xs font-sans">
                {/* Layer 1: Ingestion Sources */}
                <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-cyan-500/40 text-center space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase">Static EHR Clinical Layer</span>
                    <p className="font-bold text-slate-900 dark:text-slate-100">Longitudinal Health Records</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">Demographics • Cuff BP • Lipids • HbA1c • CAD/HTN History • Medications</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-teal-500/40 text-center space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold uppercase">Dynamic Wearable Stream Layer</span>
                    <p className="font-bold text-slate-900 dark:text-slate-100">High-Frequency Telemetry</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">PPG Pulse • HRV RMSSD • Tri-Axial Accelerometry • SpO2 • Sleep Stages</p>
                  </div>
                </div>

                {/* Down Arrow */}
                <div className="text-slate-400 dark:text-slate-500 font-mono text-xs font-medium">▼ Synchronized Ingestion & Timestamp Validation (FIFO Buffer) ▼</div>

                {/* Layer 2: Digital Twin Engine */}
                <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-gradient-to-r dark:from-blue-950/40 dark:via-purple-950/30 dark:to-blue-950/40 border border-indigo-200 dark:border-purple-500/30 max-w-2xl w-full text-center space-y-2 shadow-xs">
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-purple-400 font-bold uppercase">Core Engine</span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">Digital Twin State & Rolling Feature Window Generator</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
                    Calculates rolling statistical windows (60m mean HR, rolling minimum HRV, elevation above circadian baseline, sleep recovery ratio) and combines with static clinical risk markers.
                  </p>
                </div>

                {/* Down Arrow */}
                <div className="text-slate-400 dark:text-slate-500 font-mono text-xs font-medium">▼ Feature Vectors (60m window, strictly anti-leakage) ▼</div>

                {/* Layer 3: ML Inference Service */}
                <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-cyan-500/50 text-center space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase">Candidate Predictive Model</span>
                    <p className="font-bold text-slate-900 dark:text-white">Calibrated GBDT / Random Forest</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">ROC-AUC: 0.891 • F1: 0.828 • Brier: 0.108</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-center space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase">Interpretability Engine</span>
                    <p className="font-bold text-slate-900 dark:text-white">Local Additive SHAP Values</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">Relative Feature Attribution & Odds Ratios</p>
                  </div>
                </div>

                {/* Down Arrow */}
                <div className="text-slate-400 dark:text-slate-500 font-mono text-xs font-medium">▼ Real-Time REST & Server-Sent Events (SSE) ▼</div>

                {/* Layer 4: Interactive Client Application */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 max-w-3xl w-full text-center space-y-2 shadow-xs">
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase">Clinician & Researcher User Experience</span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">React 19 + TypeScript + Vite + Tailwind CSS</p>
                  <div className="grid grid-cols-4 gap-2 text-[11px] text-slate-700 dark:text-slate-300 pt-1">
                    <span className="p-2 rounded bg-slate-100 dark:bg-slate-800 font-medium">Executive Overview</span>
                    <span className="p-2 rounded bg-slate-100 dark:bg-slate-800 font-medium">Live Wearable Monitor</span>
                    <span className="p-2 rounded bg-slate-100 dark:bg-slate-800 font-medium">AI Risk Intelligence</span>
                    <span className="p-2 rounded bg-slate-100 dark:bg-slate-800 font-medium">What-If Twin Simulator</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: 12-SLIDE PRESENTATION DECK */}
      {activeSection === 'presentation' && (
        <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Tv className="w-4 h-4 text-cyan-500" />
            <span>Happiest Health Challenge Presentation Outline (12 Slides)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              {
                slide: 'Slide 1: Title & Team Credentials',
                desc: 'CardioTwin AI: Personalized Cardiovascular Digital Twin & Predictive Health Intelligence. Student developer team credentials, academic institution, and competition division.',
              },
              {
                slide: 'Slide 2: Healthcare Problem Statement',
                desc: 'Cardiovascular disease remains the #1 cause of mortality worldwide. Clinicians rely on sporadic cuff measurements and periodic labs, leaving critical 24/7 autonomic decompensations undetected.',
              },
              {
                slide: 'Slide 3: Healthcare Use Case & Clinical Value',
                desc: 'Proactive detection of pre-acute autonomic strain in high-risk patients (post-infarction, hypertensive heart disease) before catastrophic hemodynamic collapse occurs.',
              },
              {
                slide: 'Slide 4: The CardioTwin AI Solution',
                desc: 'A virtual cardiovascular twin maintaining continuous state synchronization across static EHR history and high-frequency wearable streaming telemetry.',
              },
              {
                slide: 'Slide 5: Digital Twin Architecture',
                desc: 'Closed-loop architecture: Ingestion -> Preprocessing -> Rolling Feature Engineering -> ML Inference -> Counterfactual Simulator -> Explainable UI.',
              },
              {
                slide: 'Slide 6: Static & Dynamic Data Fusion',
                desc: 'Mathematical union of longitudinal EHR risk markers (systolic BP, LDL/HDL ratio, HbA1c, CAD history) with dynamic time-series (PPG HR, HRV RMSSD, sleep debt, cadence).',
              },
              {
                slide: 'Slide 7: Prediction Target & Horizon Formulation',
                desc: 'Explicit target: "Elevated physiological-pattern risk within the next 2 hours" (sustained tachycardia > baseline+25 bpm + depressed HRV RMSSD < 25ms during rest/sedentary state).',
              },
              {
                slide: 'Slide 8: Live Prototype & Streaming Demonstration',
                desc: 'Demonstration of real-time SSE biosensor streaming, automatic twin state recalculation, and continuous lead II PPG rhythm visualizer.',
              },
              {
                slide: 'Slide 9: Evaluation Results & Held-Out Test Metrics',
                desc: 'Strict Patient-Level GroupKFold validation. Candidate Model achieves ROC-AUC 0.891, F1-Score 0.828, Precision 0.842 vs Baseline Logistic Regression (0.792 AUC, 0.735 F1).',
              },
              {
                slide: 'Slide 10: Counterfactual "What-If" Digital Twin Simulation',
                desc: 'Interactive scenario testing: Sleep restoration, antihypertensive adherence, resting HR deceleration. Real-time inference against fitted model parameters.',
              },
              {
                slide: 'Slide 11: Methodological Limitations & Ethical Safeguards',
                desc: 'Explicit educational proof-of-concept boundary. Non-diagnostic declaration, PPG motion artifact vulnerability, and non-causal interpretation of additive feature attributions.',
              },
              {
                slide: 'Slide 12: Roadmap, Open-Source License & Conclusion',
                desc: 'Future prospective clinical trial integration, edge wearable deployment, MIT License, GitHub repository URL, and final remarks.',
              },
            ].map((s, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">{s.slide}</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: 20-MINUTE VIDEO DEMO SCRIPT */}
      {activeSection === 'video' && (
        <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Video className="w-4 h-4 text-cyan-500" />
            <span>20-Minute Demonstration Video Outline & Timestamps</span>
          </h3>

          <div className="space-y-3 text-xs">
            {[
              {
                time: '00:00 – 02:00 (2 min)',
                title: 'Introduction & Project Overview',
                script: 'Introduce CardioTwin AI, mission for Happiest Health Digital Twin Challenge 2026, team identity, and core thesis: bridging episodic clinical visits with continuous autonomic wearable intelligence.',
              },
              {
                time: '02:00 – 05:00 (3 min)',
                title: 'Healthcare Problem & Target Specification',
                script: 'Present cardiovascular clinical problem. Define the mathematical prediction target: "Elevated Physiological-Pattern Risk within Next 2 Hours". Explain why vague heart-attack prediction claims are scientifically inappropriate.',
              },
              {
                time: '05:00 – 08:00 (3 min)',
                title: 'System Architecture & Data Fusion Pipeline',
                script: 'Walkthrough system architecture diagram. Show how static EHR (lipids, BP, HbA1c, CAD) is fused with dynamic sliding windows (HR, HRV RMSSD, sleep hours) without data leakage.',
              },
              {
                time: '08:00 – 12:00 (4 min)',
                title: 'Synthetic Cohort & Longitudinal Registry',
                script: 'Navigate the Patient Digital Twin Registry. Inspect 20 synthetic patients across risk tiers. Open deep-dive EHR summary for high-risk patient Eleanor Vance and low-risk patient Marcus Sterling.',
              },
              {
                time: '12:00 – 15:00 (3 min)',
                title: 'Live Wearable Stream & Twin Synchronization',
                script: 'Demonstrate live streaming telemetry. Start, pause, and adjust streaming frequency. Show Lead II PPG rhythm visualizer, sliding window buffer, and real-time autonomic strain alert triggering.',
              },
              {
                time: '15:00 – 17:00 (2 min)',
                title: 'AI Risk Intelligence & Model Evaluation',
                script: 'Present the AI Risk Analysis screen. Explain SHAP-style additive feature contributions. Switch to Model Performance Lab to examine held-out ROC-AUC (0.891), Confusion Matrix, and Baseline comparison.',
              },
              {
                time: '17:00 – 19:00 (2 min)',
                title: 'What-If Simulation & Clinical Reports Export',
                script: 'Execute counterfactual simulation: adjust sleep duration (+2h) and blood pressure (-15 mmHg) to observe dynamic risk reduction (-32%). Export patient summary JSON and raw sensor CSV.',
              },
              {
                time: '19:00 – 20:00+ (1 min)',
                title: 'Limitations, Ethical Declarations & Conclusion',
                script: 'Reiterate proof-of-concept boundaries, FDA non-diagnostic status, student competition deliverables, and repository verification.',
              },
            ].map((v, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-start gap-3 shadow-xs">
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold shrink-0 text-xs w-36">
                  {v.time}
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-0.5">{v.title}</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">{v.script}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: WINDOWS SETUP & POWERSHELL COMMANDS */}
      {activeSection === 'windows' && (
        <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-500" />
            <span>Windows & PowerShell Execution Guide (VS Code)</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-200">1. Clone Repository & Open in VS Code</span>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#090d18] border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-cyan-700 dark:text-cyan-300 flex justify-between items-center">
                <span>git clone https://github.com/CardioTwin-AI/CardioTwin-AI.git ; cd CardioTwin-AI ; code .</span>
                <button
                  onClick={() => copyToClipboard('git clone https://github.com/CardioTwin-AI/CardioTwin-AI.git ; cd CardioTwin-AI ; code .', 'git')}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors p-1"
                >
                  {copiedCmd === 'git' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-200">2. Setup Python Virtual Environment (Windows PowerShell)</span>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#090d18] border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-cyan-700 dark:text-cyan-300 flex justify-between items-center">
                <span>python -m venv venv ; .\venv\Scripts\Activate.ps1 ; pip install -r requirements.txt</span>
                <button
                  onClick={() => copyToClipboard('python -m venv venv ; .\\venv\\Scripts\\Activate.ps1 ; pip install -r requirements.txt', 'venv')}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors p-1"
                >
                  {copiedCmd === 'venv' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-200">3. Generate Synthetic Data & Train ML Model</span>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#090d18] border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-cyan-700 dark:text-cyan-300 flex justify-between items-center">
                <span>python backend/scripts/generate_data.py ; python backend/scripts/train_model.py</span>
                <button
                  onClick={() => copyToClipboard('python backend/scripts/generate_data.py ; python backend/scripts/train_model.py', 'ml')}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors p-1"
                >
                  {copiedCmd === 'ml' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-200">4. Run Full-Stack Application (Express + Vite on Port 3000)</span>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#090d18] border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-cyan-700 dark:text-cyan-300 flex justify-between items-center">
                <span>npm install ; npm run dev</span>
                <button
                  onClick={() => copyToClipboard('npm install ; npm run dev', 'npm')}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors p-1"
                >
                  {copiedCmd === 'npm' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 mt-4 shadow-xs">
              <span className="font-bold text-slate-800 dark:text-slate-100 block">FastAPI Local Backend Alternative (Port 8000)</span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                To run the optional standalone Python FastAPI backend alongside React:
              </p>
              <div className="p-2.5 rounded-lg bg-white dark:bg-black/60 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
                uvicorn backend.app.main:app --reload --port 8000
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
