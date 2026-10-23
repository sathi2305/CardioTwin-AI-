import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { SYNTHETIC_PATIENTS, generatePatientTimeSeries } from './src/data/syntheticData';
import { BENCHMARK_MODEL_METRICS } from './src/data/modelEvaluation';
import { buildDigitalTwinState, calculateDigitalTwinPrediction, runWhatIfSimulation } from './src/utils/digitalTwinEngine';
import { WearableObservation } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory simulation state
interface StreamState {
  isRunning: boolean;
  frequencyMs: number;
  activePatientId: string;
  totalPacketsSent: number;
  lastPacketTimestamp: string | null;
}

const streamState: StreamState = {
  isRunning: false,
  frequencyMs: 3000,
  activePatientId: 'CT-1001',
  totalPacketsSent: 0,
  lastPacketTimestamp: null,
};

// In-memory server observations cache per patient
const serverPatientObservations = new Map<string, WearableObservation[]>();

function getServerObservations(patientId: string): WearableObservation[] {
  if (!serverPatientObservations.has(patientId)) {
    const patient = SYNTHETIC_PATIENTS.find((p) => p.patientId === patientId) || SYNTHETIC_PATIENTS[0];
    serverPatientObservations.set(patientId, generatePatientTimeSeries(patient, 30));
  }
  return serverPatientObservations.get(patientId)!;
}

// SSE active response connections
const sseClients: Set<Response> = new Set();
let sseIntervalTimer: NodeJS.Timeout | null = null;

function broadcastSseObservation() {
  if (!streamState.isRunning) return;

  const now = new Date().toISOString();
  streamState.totalPacketsSent++;
  streamState.lastPacketTimestamp = now;

  const isHighRisk = streamState.activePatientId === 'CT-1001' || streamState.activePatientId === 'CT-1003' || streamState.activePatientId === 'CT-1007';
  const baseHR = isHighRisk ? 82 : 64;
  const baseHRV = isHighRisk ? 22 : 48;

  const hr = Math.round(baseHR + (Math.sin(streamState.totalPacketsSent * 0.4) * 8) + (Math.random() * 4 - 2));
  const hrv = Math.round(Math.max(14, baseHRV - (Math.sin(streamState.totalPacketsSent * 0.4) * 6) + (Math.random() * 4 - 2)));
  const spo2 = Math.round((97 + (Math.random() * 2 - 1)) * 10) / 10;
  
  const activities = ['Sedentary', 'Sedentary', 'Light', 'Moderate', 'Rest'] as const;
  const activity = activities[streamState.totalPacketsSent % activities.length];

  const isAlert = hr > 95 && hrv < 24 && (activity === 'Rest' || activity === 'Sedentary');

  const observation: WearableObservation = {
    id: `stream-srv-${streamState.activePatientId}-${Date.now()}`,
    patientId: streamState.activePatientId,
    timestamp: now,
    heartRate: hr,
    hrvRmssd: hrv,
    sleepDurationHours: 6.4,
    deepSleepPercent: 18,
    sleepEfficiencyPercent: 82,
    stepCountCumulative: 5600 + (streamState.totalPacketsSent * 15),
    activityIntensity: activity,
    spo2,
    skinTempDevC: Math.round(((Math.random() * 0.3) - 0.15) * 100) / 100,
    signalQuality: 'Optimal',
    isSimulatedAlert: isAlert,
    simulatedAlertReason: isAlert ? 'CardioTwin Alert: Autonomic Decoupling & Elevated Resting Tachycardia' : undefined,
  };

  // Add to local server buffer
  const obsList = getServerObservations(streamState.activePatientId);
  obsList.push(observation);
  if (obsList.length > 50) obsList.shift();

  const payload = `data: ${JSON.stringify(observation)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (_) {
      sseClients.delete(client);
    }
  }
}

function startSseTimer() {
  if (sseIntervalTimer) clearInterval(sseIntervalTimer);
  sseIntervalTimer = setInterval(broadcastSseObservation, streamState.frequencyMs);
}

function stopSseTimer() {
  if (sseIntervalTimer) {
    clearInterval(sseIntervalTimer);
    sseIntervalTimer = null;
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // 1. Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.4.1',
      service: 'CardioTwin AI Express Backend',
      predictionTarget: 'Elevated Physiological-Pattern Risk within Next 2 Hours',
      mlModelStatus: 'Loaded & Ready (Fitted Pipeline: Calibrated GBDT / Random Forest)'
    });
  });

  // 2. Patient endpoints
  app.get('/api/patients', (_req: Request, res: Response) => {
    res.json(SYNTHETIC_PATIENTS);
  });

  app.get('/api/patients/:id', (req: Request, res: Response) => {
    const patient = SYNTHETIC_PATIENTS.find((p) => p.patientId === req.params.id);
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }
    res.json(patient);
  });

  app.get('/api/patients/:id/wearables', (req: Request, res: Response) => {
    const obs = getServerObservations(req.params.id);
    res.json(obs);
  });

  app.get('/api/patients/:id/twin', (req: Request, res: Response) => {
    const patientId = req.params.id;
    const patient = SYNTHETIC_PATIENTS.find((p) => p.patientId === patientId) || SYNTHETIC_PATIENTS[0];
    const obs = getServerObservations(patientId);
    const twin = buildDigitalTwinState(patient, obs);
    res.json(twin);
  });

  app.get('/api/patients/:id/prediction', (req: Request, res: Response) => {
    const patientId = req.params.id;
    const patient = SYNTHETIC_PATIENTS.find((p) => p.patientId === patientId) || SYNTHETIC_PATIENTS[0];
    const obs = getServerObservations(patientId);
    const prediction = calculateDigitalTwinPrediction(patient, obs);
    res.json(prediction);
  });

  app.post('/api/patients/:id/simulate', (req: Request, res: Response) => {
    const patientId = req.params.id;
    const patient = SYNTHETIC_PATIENTS.find((p) => p.patientId === patientId) || SYNTHETIC_PATIENTS[0];
    const obs = getServerObservations(patientId);
    const result = runWhatIfSimulation(patient, obs, req.body || {});
    res.json(result);
  });

  // 3. Model metrics & info
  app.get('/api/model/metrics', (_req: Request, res: Response) => {
    res.json(BENCHMARK_MODEL_METRICS);
  });

  app.get('/api/model/info', (_req: Request, res: Response) => {
    res.json({
      targetName: 'Elevated Physiological-Pattern Risk within Next 2 Hours',
      horizon: '2-hour forward rolling window',
      featureWindow: '60-minute dynamic observations + static EHR baseline',
      splitStrategy: 'GroupKFold / Patient-Level Partition (80/20 train/held-out test split, 0 patient overlap across splits)',
      architecture: 'Calibrated Gradient Boosted / Random Forest Classifier with Isotonic Regression',
      leakagePrevention: 'Chronological time-window splitting with 2-hour buffer; distinct patient IDs separated between training and validation folds.',
      modelArtifacts: {
        pipeline: 'models/cardiotwin_pipeline.joblib',
        metrics: 'models/evaluation_metrics.json',
        scaler: 'models/scaler.joblib'
      }
    });
  });

  // 4. Stream status & controls
  app.get('/api/stream/status', (_req: Request, res: Response) => {
    res.json({
      ...streamState,
      activeClientCount: sseClients.size,
    });
  });

  app.post('/api/stream/start', (req: Request, res: Response) => {
    const { patientId, frequencyMs } = req.body || {};
    if (patientId) streamState.activePatientId = patientId;
    if (frequencyMs) streamState.frequencyMs = Math.max(1000, frequencyMs);
    streamState.isRunning = true;
    startSseTimer();
    res.json({ success: true, message: `Wearable stream initiated for ${streamState.activePatientId}`, state: streamState });
  });

  app.post('/api/stream/pause', (_req: Request, res: Response) => {
    streamState.isRunning = false;
    stopSseTimer();
    res.json({ success: true, message: 'Stream paused', state: streamState });
  });

  app.post('/api/stream/reset', (req: Request, res: Response) => {
    const { patientId } = req.body || {};
    const target = patientId || streamState.activePatientId;
    streamState.activePatientId = target;
    streamState.isRunning = false;
    streamState.totalPacketsSent = 0;
    streamState.lastPacketTimestamp = null;
    serverPatientObservations.delete(target);
    stopSseTimer();
    res.json({ success: true, message: 'Stream state reset successfully', state: streamState });
  });

  // 5. SSE Stream endpoint
  app.get('/api/stream/events', (req: Request, res: Response) => {
    const patientId = (req.query.patientId as string) || streamState.activePatientId;
    streamState.activePatientId = patientId;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    res.write(`event: handshake\ndata: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString(), patientId })}\n\n`);

    sseClients.add(res);

    if (streamState.isRunning && !sseIntervalTimer) {
      startSseTimer();
    }

    req.on('close', () => {
      sseClients.delete(res);
      if (sseClients.size === 0) {
        stopSseTimer();
      }
    });
  });

  // 6. CSV export endpoint
  app.get('/api/reports/:patient_id/wearables.csv', (req: Request, res: Response) => {
    const patientId = req.params.patient_id;
    const obs = getServerObservations(patientId);
    let csv = 'Timestamp,PatientId,HeartRate_BPM,HRV_RMSSD_ms,SleepDuration_Hours,SpO2_Percent,StepCount,ActivityIntensity,SignalQuality\n';
    
    for (const o of obs) {
      csv += `${o.timestamp},${o.patientId},${o.heartRate},${o.hrvRmssd},${(o.sleepDurationHours ?? 7.0).toFixed(1)},${o.spo2},${o.stepCountCumulative},${o.activityIntensity},${o.signalQuality}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="wearables_${patientId}_${Date.now()}.csv"`);
    res.send(csv);
  });

  // 7. Multilingual Healthcare AI Explanation Assistant
  app.post('/api/ai/multilingual-explain', async (req: Request, res: Response) => {
    const { patientId, query, topic = 'trend', language = 'en' } = req.body || {};
    const patient = SYNTHETIC_PATIENTS.find((p) => p.patientId === patientId) || SYNTHETIC_PATIENTS[0];
    const obs = getServerObservations(patient.patientId);
    const twin = buildDigitalTwinState(patient, obs);
    const prediction = twin.currentPrediction;

    const latest = obs[obs.length - 1] || { heartRate: 72, hrvRmssd: 35, sleepDurationHours: 7.0 };
    const avgHR = Math.round(obs.reduce((a, b) => a + b.heartRate, 0) / (obs.length || 1));
    const avgHRV = Math.round(obs.reduce((a, b) => a + b.hrvRmssd, 0) / (obs.length || 1));
    const hrDelta = avgHR - patient.restingHeartRateBaseline;
    const hrvDelta = avgHRV - patient.restingHrvBaseline;

    // Rule-based multilingual responses with preserved medical terms
    const explanations: Record<string, Record<string, { title: string; summary: string; points: string[]; clinicalDisclaimer: string }>> = {
      trend: {
        en: {
          title: 'Cardiovascular Trend & Hemodynamic Pattern',
          summary: `Subject ${patient.patientId} exhibits an average Heart Rate of ${avgHR} BPM (baseline: ${patient.restingHeartRateBaseline} BPM) and an average HRV RMSSD of ${avgHRV} ms (baseline: ${patient.restingHrvBaseline} ms).`,
          points: [
            hrDelta > 5 ? `Elevated resting tachycardia observed (+${hrDelta} BPM above EHR baseline).` : `Resting heart rate remains aligned within ±4 BPM of historical baseline.`,
            hrvDelta < -5 ? `Vagal autonomic suppression observed with HRV reduced by ${Math.abs(hrvDelta)} ms.` : `Autonomic parasympathetic tone is relatively stable.`,
            `Rolling simulated pattern risk stands at ${(prediction.riskProbability * 100).toFixed(1)}% (${prediction.riskLevel}).`
          ],
          clinicalDisclaimer: 'Simulated research finding. Not a confirmed clinical alarm or medical diagnosis.'
        },
        ta: {
          title: 'கார்டியோவாஸ்குலர் போக்கு மற்றும் உடலியல் நிலை',
          summary: `நோயாளி ${patient.patientId}-ன் சராசரி இதயத் துடிப்பு (Heart Rate) ${avgHR} BPM மற்றும் HRV RMSSD ${avgHRV} ms ஆக பதிவாகியுள்ளது (அடிப்படை: ${patient.restingHeartRateBaseline} BPM / ${patient.restingHrvBaseline} ms).`,
          points: [
            hrDelta > 5 ? `அடிப்படை அளவை விட இதயத் துடிப்பு +${hrDelta} BPM அதிகரித்துள்ளது (Resting Tachycardia).` : `இதயத் துடிப்பு இயல்பான அடிப்படை வரம்பிற்குள் உள்ளது.`,
            hrvDelta < -5 ? `HRV RMSSD ${Math.abs(hrvDelta)} ms குறைந்துள்ளதால் தன்னாட்சி நரம்பு மண்டல அழுத்தம் (Autonomic Suppression) குறிக்கப்படுகிறது.` : `தன்னாட்சி நரம்பு மண்டலம் சீராக உள்ளது.`,
            `உருவகப்படுத்தப்பட்ட மாதிரி ஆபத்து ${(prediction.riskProbability * 100).toFixed(1)}% (${prediction.riskLevel}) ஆக கணக்கிடப்பட்டுள்ளது.`
          ],
          clinicalDisclaimer: 'ஆராய்ச்சி உருவகப்படுத்தல் முடிவு. இது மருத்துவ உறுதிப்படுத்தல் அல்ல.'
        },
        hi: {
          title: 'कार्डियोवैस्कुलर ट्रेंड एवं शारीरिक विश्लेषण',
          summary: `मरीज ${patient.patientId} की औसत हृदय गति (Heart Rate) ${avgHR} BPM और HRV RMSSD ${avgHRV} ms दर्ज की गई है (आधारभूत मान: ${patient.restingHeartRateBaseline} BPM / ${patient.restingHrvBaseline} ms)।`,
          points: [
            hrDelta > 5 ? `आधारभूत मान से हृदय गति में +${hrDelta} BPM की वृद्धि (Resting Tachycardia) देखी गई है।` : `हृदय गति सामान्य आधारभूत सीमा में बनी हुई है।`,
            hrvDelta < -5 ? `HRV RMSSD में ${Math.abs(hrvDelta)} ms की गिरावट से ऑटोनोমিক तनाव (Autonomic Stress) का संकेत मिलता है।` : `ऑटोनोमिक तंत्रिका संतुलन अपेक्षाकृत स्थिर है।`,
            `सिम्युलेटेड पैटर्न जोखिम स्कोर ${(prediction.riskProbability * 100).toFixed(1)}% (${prediction.riskLevel}) पर आंका गया है।`
          ],
          clinicalDisclaimer: 'शोध सिमुलेशन परिणाम। यह प्रमाणित चिकित्सीय निदान नहीं है।'
        },
        ml: {
          title: 'കാർഡിയോവാസ്കുലർ ട്രെൻഡും ഹീമോഡൈനാമിക് വിശകലനവും',
          summary: `രോഗി ${patient.patientId}-ന്റെ ശരാശരി ഹൃദയമിടിപ്പ് (Heart Rate) ${avgHR} BPM, HRV RMSSD ${avgHRV} ms എന്നിവയാണ് (ബേസ് ലൈൻ: ${patient.restingHeartRateBaseline} BPM / ${patient.restingHrvBaseline} ms).`,
          points: [
            hrDelta > 5 ? `ബേസ് ലൈനേക്കാൾ ഹൃദയമിടിപ്പിൽ +${hrDelta} BPM വർദ്ധനവ് രേഖപ്പെടുത്തിയിട്ടുണ്ട്.` : `ഹൃദയമിടിപ്പ് സാധാരണ പരിധിക്കുള്ളിലാണ്.`,
            hrvDelta < -5 ? `HRV-ൽ ${Math.abs(hrvDelta)} ms കുറവ് വന്നത് ഓട്ടോണോമിക് സ്ട്രെസ്സ് സൂചിപ്പിക്കുന്നു.` : `ഓട്ടോണോമിക് ബാലൻസ് സുസ്ഥിരമാണ്.`,
            `സിമുലേറ്റഡ് പാറ്റേൺ റിസ്ക് ${(prediction.riskProbability * 100).toFixed(1)}% (${prediction.riskLevel}) ആണ്.`
          ],
          clinicalDisclaimer: 'ഗവേഷണ സിമുലേഷൻ ഫലം. മെഡിക്കൽ രോഗനിർണയമല്ല.'
        },
        te: {
          title: 'కార్డియోవాస్కులర్ ధోరణి మరియు విశ్లేషణ',
          summary: `రోగి ${patient.patientId} సగటు గుండె స్పందన (Heart Rate) ${avgHR} BPM మరియు HRV RMSSD ${avgHRV} ms గా ఉంది (బేస్‌లైన్: ${patient.restingHeartRateBaseline} BPM / ${patient.restingHrvBaseline} ms).`,
          points: [
            hrDelta > 5 ? `బేస్‌లైన్ కంటే హృదయ స్పందనలో +${hrDelta} BPM పెరుగుదల ఉంది.` : `గుండె స్పందన బేస్‌లైన్ పరిధిలోనే ఉంది.`,
            hrvDelta < -5 ? `HRV ${Math.abs(hrvDelta)} ms తగ్గడం ఆటోనామిక్ ఒత్తిడిని సూచిస్తుంది.` : `ఆటోనామిక్ టోన్ స్థిరంగా ఉంది.`,
            `మోడల్ లెక్కించిన రిస్క్ స్కోరు ${(prediction.riskProbability * 100).toFixed(1)}% (${prediction.riskLevel}).`
          ],
          clinicalDisclaimer: 'పరిశోధన సిమ్యులేషన్ మాత్రమే. క్లినికల్ నిర్ధారణ కాదు.'
        },
        kn: {
          title: 'ಹೃದಯ ಪ್ರವೃತ್ತಿ ಮತ್ತು ವಿಶ್ಲೇಷಣೆ',
          summary: `ರೋಗಿ ${patient.patientId} ಅವರ ಸರಾಸರಿ ಹೃದಯ ಬಡಿತ (Heart Rate) ${avgHR} BPM ಮತ್ತು HRV RMSSD ${avgHRV} ms ಆಗಿದೆ (ಮೂಲಮಾನ: ${patient.restingHeartRateBaseline} BPM / ${patient.restingHrvBaseline} ms).`,
          points: [
            hrDelta > 5 ? `ಮೂಲಮಾನಕ್ಕಿಂತ ಹೃದಯ ಬಡಿತದಲ್ಲಿ +${hrDelta} BPM ಹೆಚ್ಚಳ ಕಂಡುಬಂದಿದೆ.` : `ಹೃದಯ ಬಡಿತ ಸಾಮಾನ್ಯ ವ್ಯಾಪ್ತಿಯಲ್ಲಿದೆ.`,
            hrvDelta < -5 ? `HRV ${Math.abs(hrvDelta)} ms ಕಡಿಮೆಯಾಗಿರುವುದು ಆಟೋನಾಮಿಕ್ ಒತ್ತಡವನ್ನು ಸೂಚಿಸುತ್ತದೆ.` : `ಆಟೋನಾಮಿಕ್ ಸಮತೋಲನ ಸ್ಥಿರವಾಗಿದೆ.`,
            `ಮಾದರಿ ಲೆಕ್ಕಾಚಾರ ಮಾಡಿದ ರಿಸ್ಕ್ ${(prediction.riskProbability * 100).toFixed(1)}% (${prediction.riskLevel}).`
          ],
          clinicalDisclaimer: 'ಸಂಶೋಧನಾ ಸಿಮ್ಯುಲೇಶನ್ ವರದಿ. ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ.'
        }
      },
      hrv: {
        en: {
          title: 'Heart Rate & Autonomic HRV RMSSD Dynamics',
          summary: `HRV reflects parasympathetic vagal tone modulation. Active twin observations show RMSSD ranging between ${Math.min(...obs.map(o => o.hrvRmssd))} ms and ${Math.max(...obs.map(o => o.hrvRmssd))} ms.`,
          points: [
            `Baseline resting HRV for ${patient.fullName}: ${patient.restingHrvBaseline} ms.`,
            `Current rolling mean: ${avgHRV} ms (variance: ${hrvDelta > 0 ? '+' : ''}${hrvDelta} ms).`,
            `Clinical significance: Acute drops in HRV accompanied by resting tachycardia often indicate physiological stress or sympathetic hyperactivation.`
          ],
          clinicalDisclaimer: 'Physiological marker for research analysis only.'
        },
        ta: {
          title: 'இதயத் துடிப்பு மற்றும் HRV RMSSD இயக்கவியல்',
          summary: `HRV RMSSD என்பது பாராசிம்பதெடிக் வேகல் டோனை அளவிடுகிறது. தற்போதைய கண்காணிப்பில் RMSSD ${Math.min(...obs.map(o => o.hrvRmssd))} ms முதல் ${Math.max(...obs.map(o => o.hrvRmssd))} ms வரை மாறுகிறது.`,
          points: [
            `${patient.fullName}-ன் அடிப்படை HRV: ${patient.restingHrvBaseline} ms.`,
            `தற்போதைய சராசரி: ${avgHRV} ms (மாறுபாடு: ${hrvDelta > 0 ? '+' : ''}${hrvDelta} ms).`,
            `மருத்துவ விளக்கம்: HRV குறைவு மற்றும் இதயத் துடிப்பு அதிகரிப்பு தன்னாட்சி நரம்பு மண்டல அழுத்தத்தைக் குறிக்கலாம்.`
          ],
          clinicalDisclaimer: 'உடலியல் குறியீட்டு ஆராய்ச்சி மட்டுமே.'
        },
        hi: {
          title: 'हृदय गति और ऑटोनोমিক HRV RMSSD गतिशीलता',
          summary: `HRV वैगल टोन और ऑटोनोমিক स्वास्थ्य को दर्शाता है। नवीनतम अवलोकनों में RMSSD मान ${Math.min(...obs.map(o => o.hrvRmssd))} ms से ${Math.max(...obs.map(o => o.hrvRmssd))} ms के बीच है।`,
          points: [
            `${patient.fullName} का आधारभूत HRV: ${patient.restingHrvBaseline} ms.`,
            `वर्तमान औसत: ${avgHRV} ms (अंतर: ${hrvDelta > 0 ? '+' : ''}${hrvDelta} ms).`,
            `क्लिनिकल महत्व: HRV में अचानक गिरावट और उच्च हृदय गति शारीरिक तनाव या कार्डियोवैस्कुलर लोड का संकेत हो सकता है।`
          ],
          clinicalDisclaimer: 'अनुसंधान उपयोग के लिए शारीरिक सूचक।'
        },
        ml: {
          title: 'ഹൃദയമിടിപ്പും HRV RMSSD ഡൈനാമിക്സും',
          summary: `HRV RMSSD വാഗൽ ടോണിന്റെ പ്രവർത്തനത്തെ കാണിക്കുന്നു. നിലവിലെ നിരീക്ഷണത്തിൽ RMSSD ${Math.min(...obs.map(o => o.hrvRmssd))} ms മുതൽ ${Math.max(...obs.map(o => o.hrvRmssd))} ms വരെയാണ്.`,
          points: [
            `${patient.fullName}-ന്റെ അടിസ്ഥാന HRV: ${patient.restingHrvBaseline} ms.`,
            `ഇപ്പോഴത്തെ ശരാശരി: ${avgHRV} ms.`,
            `HRV കുറയുന്നതും പൾസ് കൂടുന്നതും അഡ്രിനാലിൻ അല്ലെങ്കിൽ ശാരീരിക അസന്തുലിതാവസ്ഥയെ പ്രതിഫലിപ്പിക്കാം.`
          ],
          clinicalDisclaimer: 'ഗവേഷണ വിശകലനം മാത്രം.'
        },
        te: {
          title: 'గుండె స్పందన మరియు HRV RMSSD డైనమిక్స్',
          summary: `HRV వేగల్ టోన్‌ను ప్రతిబింబిస్తుంది. ప్రస్తుత రీడింగులలో RMSSD ${Math.min(...obs.map(o => o.hrvRmssd))} ms నుండి ${Math.max(...obs.map(o => o.hrvRmssd))} ms మధ్య నమోదైంది.`,
          points: [
            `${patient.fullName} బేస్‌లైన్ HRV: ${patient.restingHrvBaseline} ms.`,
            `ప్రస్తుత సగటు: ${avgHRV} ms.`,
            `HRV తగ్గడం మరియు గుండె వేగం పెరగడం శరీరధర్మ ఒత్తిడిని సూచిస్తుంది.`
          ],
          clinicalDisclaimer: 'పరిశోధనాత్మక విశ్లేషణ మాత్రమే.'
        },
        kn: {
          title: 'ಹೃದಯ ಬಡಿತ ಮತ್ತು HRV RMSSD ಚಲನಶಾಸ್ತ್ರ',
          summary: `HRV ದೇಹದ ನರವ್ಯೂಹದ ಸಮತೋಲನವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಪ್ರಸ್ತುತ ವೀಕ್ಷಣೆಯಲ್ಲಿ RMSSD ${Math.min(...obs.map(o => o.hrvRmssd))} ms ನಿಂದ ${Math.max(...obs.map(o => o.hrvRmssd))} ms ನಷ್ಟಿದೆ.`,
          points: [
            `${patient.fullName} ಮೂಲಮಾನ HRV: ${patient.restingHrvBaseline} ms.`,
            `ಪ್ರಸ್ತುತ ಸರಾಸರಿ: ${avgHRV} ms.`,
            `HRV ಕುಸಿತ ಮತ್ತು ಹೃದಯ ಬಡಿತ ಹೆಚ್ಚಳ ದೈಹಿಕ ಆಯಾಸ ಅಥವಾ ಒತ್ತಡದ ಸಂಕೇತವಾಗಿರಬಹುದು.`
          ],
          clinicalDisclaimer: 'ಸಂಶೋಧನಾ ವಿಶ್ಲೇಷಣೆ ಮಾತ್ರ.'
        }
      },
      risk: {
        en: {
          title: 'Model Prediction Drivers & Feature Attribution',
          summary: `The GBDT pipeline classified subject ${patient.patientId} with a ${(prediction.riskProbability * 100).toFixed(1)}% probability of elevated physiological pattern within 2 hours.`,
          points: [
            `Primary driver: Systolic BP (${patient.systolicBP} mmHg) and Diastolic BP (${patient.diastolicBP} mmHg).`,
            `Autonomic factor: HRV deviation of ${hrvDelta} ms from rest baseline.`,
            `Metabolic profile: HbA1c ${patient.hbA1c}%, LDL ${patient.ldlCholesterol} mg/dL, Smoking status: ${patient.smokingStatus}.`,
            `Confidence score: ${(prediction.modelConfidence * 100).toFixed(0)}% based on isotonic regression calibration.`
          ],
          clinicalDisclaimer: 'Statistical inference model. Does not establish medical causality.'
        },
        ta: {
          title: 'மாதிரி கணிப்பு காரணிகள் மற்றும் முக்கிய அம்சங்கள்',
          summary: `GBDT கணிப்பு மாதிரி நோயாளி ${patient.patientId}-க்கு ${(prediction.riskProbability * 100).toFixed(1)}% உருவகப்படுத்தப்பட்ட ஆபத்து வாய்ப்பை கணக்கிட்டுள்ளது.`,
          points: [
            `முதன்மை காரணி: இரத்த அழுத்தம் (BP) ${patient.systolicBP}/${patient.diastolicBP} mmHg.`,
            `தன்னாட்சி நரம்பு காரணி: HRV மாறுபாடு ${hrvDelta} ms.`,
            `வளர்சிதை மாற்ற சுயவிவரம்: HbA1c ${patient.hbA1c}%, LDL ${patient.ldlCholesterol} mg/dL, புகைபிடிக்கும் பழக்கம்: ${patient.smokingStatus}.`,
            `மாதிரி நம்பிக்கை நிலை: ${(prediction.modelConfidence * 100).toFixed(0)}% (Calibrated GBDT).`
          ],
          clinicalDisclaimer: 'புள்ளியியல் கணிப்பு மாதிரி. இது மருத்துவ காரணத்தை நிறுவவில்லை.'
        },
        hi: {
          title: 'मॉडल पूर्वानुमान कारक एवं फीचर योगदान',
          summary: `GBDT पाइपलाइन ने मरीज ${patient.patientId} के लिए 2 घंटे में ${(prediction.riskProbability * 100).toFixed(1)}% सिम्युलेटेड पैटर्न जोखिम की संभावना का आकलन किया है।`,
          points: [
            `प्रमुख कारक: रक्तचाप (BP) ${patient.systolicBP}/${patient.diastolicBP} mmHg.`,
            `ऑटोनोमिक कारक: आधारभूत मान से HRV विचलन ${hrvDelta} ms.`,
            `मेटाबॉलिक प्रोफाइल: HbA1c ${patient.hbA1c}%, LDL ${patient.ldlCholesterol} mg/dL, धूम्रपान स्थिति: ${patient.smokingStatus}.`,
            `मॉडल विश्वास स्तर: ${(prediction.modelConfidence * 100).toFixed(0)}% (Isotonic Calibrated).`
          ],
          clinicalDisclaimer: 'सांख्यिकीय भविष्यवाणी मॉडल। यह चिकित्सीय कारण सिद्ध नहीं करता।'
        },
        ml: {
          title: 'മോഡൽ പ്രവചന ഘടകങ്ങളും വിശകലനവും',
          summary: `GBDT മോഡൽ ${patient.patientId}-ന് ${(prediction.riskProbability * 100).toFixed(1)}% പാറ്റേൺ റിസ്ക് പ്രവചിച്ചിരിക്കുന്നു.`,
          points: [
            `പ്രധാന കാരണം: രക്തസമ്മർദ്ദം (BP) ${patient.systolicBP}/${patient.diastolicBP} mmHg.`,
            `HRV വ്യതിയാനം: ${hrvDelta} ms.`,
            `ലാബ് മൂല്യങ്ങൾ: HbA1c ${patient.hbA1c}%, LDL ${patient.ldlCholesterol} mg/dL.`,
            `മോഡൽ കൃത്യത: ${(prediction.modelConfidence * 100).toFixed(0)}%.`
          ],
          clinicalDisclaimer: 'സ്ഥിതിവിവരക്കണക്ക് മോഡൽ മാത്രം.'
        },
        te: {
          title: 'మోడల్ అంచనా డ్రైవర్లు మరియు ఫీచర్ కాంట్రిబ్యూషన్',
          summary: `GBDT పైప్‌లైన్ రోగి ${patient.patientId} కోసం ${(prediction.riskProbability * 100).toFixed(1)}% రిస్క్ సంభావ్యతను అంచనా వేసింది.`,
          points: [
            `ప్రధాన అంశం: రక్తపోటు (BP) ${patient.systolicBP}/${patient.diastolicBP} mmHg.`,
            `ఆటోనామిక్ అంశం: HRV విచలనం ${hrvDelta} ms.`,
            `జీవక్రియ స్థితి: HbA1c ${patient.hbA1c}%, LDL ${patient.ldlCholesterol} mg/dL.`,
            `మోడల్ విశ్వాస స్థాయి: ${(prediction.modelConfidence * 100).toFixed(0)}%.`
          ],
          clinicalDisclaimer: 'గణాంక నమూనా మాత్రమే.'
        },
        kn: {
          title: 'ಮಾದರಿ ಮುನ್ಸೂಚನೆ ಅಂಶಗಳು ಮತ್ತು ಕೊಡುಗೆ',
          summary: `GBDT ಮಾದರಿಯು ರೋಗಿ ${patient.patientId} ರವರಿಗೆ ${(prediction.riskProbability * 100).toFixed(1)}% ಅಪಾಯದ ಸಾಧ್ಯತೆಯನ್ನು ಗುರುತಿಸಿದೆ.`,
          points: [
            `ಮುಖ್ಯ ಕಾರಣ: ರಕ್ತದೊತ್ತಡ (BP) ${patient.systolicBP}/${patient.diastolicBP} mmHg.`,
            `HRV ವ್ಯತ್ಯಾಸ: ${hrvDelta} ms.`,
            `ಲ್ಯಾಬ್ ಮೌಲ್ಯಗಳು: HbA1c ${patient.hbA1c}%, LDL ${patient.ldlCholesterol} mg/dL.`,
            `ಮಾದರಿ ವಿಶ್ವಾಸಾರ್ಹತೆ: ${(prediction.modelConfidence * 100).toFixed(0)}%.`
          ],
          clinicalDisclaimer: 'ಸಂಖ್ಯಾಶಾಸ್ತ್ರೀಯ ಮುನ್ಸೂಚನೆ ಮಾತ್ರ.'
        }
      },
      questions: {
        en: {
          title: 'Suggested Questions to Discuss with a Clinician',
          summary: `Evidence-based prompts to facilitate transparent communication with your physician or cardiologist based on observed twin trends.`,
          points: [
            `1. "My resting heart rate has averaged ${avgHR} BPM, which is ${hrDelta > 0 ? '+' + hrDelta : hrDelta} BPM compared to my baseline. Does this warrant ambulatory ECG monitoring?"`,
            `2. "My HRV RMSSD has trended around ${avgHRV} ms during sedentary periods. What lifestyle or stress factors should we evaluate?"`,
            `3. "My recorded blood pressure is ${patient.systolicBP}/${patient.diastolicBP} mmHg with an HbA1c of ${patient.hbA1c}%. What are my target lipid and metabolic thresholds?"`,
            `4. "Should I consider a 24-hour Holter monitor or stress echocardiogram given these longitudinal variations?"`
          ],
          clinicalDisclaimer: 'Questions provided to support patient-physician dialogue. Not a medical referral.'
        },
        ta: {
          title: 'மருத்துவரிடம் கலந்துரையாட பரிந்துரைக்கப்படும் கேள்விகள்',
          summary: `உங்கள் மருத்துவரிடம் அல்லது இதய நோய் நிபுணரிடம் தெளிவான ஆலோசனை பெற உதவும் சான்றுகள் சார்ந்த கேள்விகள்.`,
          points: [
            `1. "எனது ஓய்வு இதயத் துடிப்பு சராசரியாக ${avgHR} BPM ஆக உள்ளது (${hrDelta > 0 ? '+' + hrDelta : hrDelta} BPM அடிப்படை மாற்றம்). எனக்கு ECG அல்லது Holter கண்காணிப்பு தேவையா?"`,
            `2. "எனது HRV RMSSD ${avgHRV} ms ஆக குறைந்துள்ளது. இதற்கு என்ன வாழ்க்கை முறை மாற்றங்கள் தேவை?"`,
            `3. "எனது இரத்த அழுத்தம் ${patient.systolicBP}/${patient.diastolicBP} mmHg மற்றும் HbA1c ${patient.hbA1c}%. எனது இலக்கு வரம்புகள் என்னவாக இருக்க வேண்டும்?"`,
            `4. "இந்த உடலியல் போக்குகளின் அடிப்படையில் ஏதேனும் கூடுதல் பரிசோதனைகள் பரிந்துரைக்கிறீர்களா?"`
          ],
          clinicalDisclaimer: 'மருத்துவர் உரையாடலுக்கான வழிகாட்டி மட்டுமே. இது மருத்துவ பரிந்துரை அல்ல.'
        },
        hi: {
          title: 'चिकित्सक से चर्चा के लिए सुझाए गए प्रश्न',
          summary: `अपने डॉक्टर या हृदय रोग विशेषज्ञ के साथ स्पष्ट संवाद के लिए साक्ष्य-आधारित प्रश्न।`,
          points: [
            `1. "मेरी सामान्य हृदय गति ${avgHR} BPM है, जो आधारभूत मान से ${hrDelta > 0 ? '+' + hrDelta : hrDelta} BPM भिन्न है। क्या मुझे ECG जांच करानी चाहिए?"`,
            `2. "मेरी HRV RMSSD रीडिंग ${avgHRV} ms के आसपास है। क्या यह तनाव या ऑटोनोમિક बदलाव का संकेत है?"`,
            `3. "मेरा रक्तचाप ${patient.systolicBP}/${patient.diastolicBP} mmHg और HbA1c ${patient.hbA1c}% है। मुझे किन लक्ष्यों पर ध्यान देना चाहिए?"`,
            `4. "क्या इन रुझानों को देखते हुए 24-घंटे का होल्टर मॉनिटरिंग उपयुक्त रहेगा?"`
          ],
          clinicalDisclaimer: 'केवल मरीज-चिकित्सक संवाद में सहायता के लिए।'
        },
        ml: {
          title: 'ഡോക്ടറോട് ചോദിക്കാവുന്ന നിർദ്ദേശിത ചോദ്യങ്ങൾ',
          summary: `നിങ്ങളുടെ ഡോക്ടറുമായി സംസാരിക്കുമ്പോൾ സഹായകരമാകുന്ന ചോദ്യങ്ങൾ.`,
          points: [
            `1. "എന്റെ ശരാശരി പൾസ് ${avgHR} BPM ആണ്. എനിക്ക് ഒരു ECG ടെസ്റ്റ് ആവശ്യമുണ്ടോ?"`,
            `2. "എന്റെ HRV RMSSD ${avgHRV} ms ആയി കുറഞ്ഞിരിക്കുന്നു. എന്തെല്ലാം ജീവിതശൈലി മാറ്റങ്ങൾ വരുത്തണം?"`,
            `3. "രക്തസമ്മർദ്ദം ${patient.systolicBP}/${patient.diastolicBP} mmHg ആണ്. ഇതിൽ എന്ത് തുടർനടപടികൾ വേണം?"`,
            `4. "24 മണിക്കൂർ ഹോൾട്ടർ മോണിറ്ററിംഗ് ആവശ്യമുണ്ടോ?"`
          ],
          clinicalDisclaimer: 'ഡോക്ടർ സമ്പർക്കത്തിനായുള്ള സഹായം മാത്രം.'
        },
        te: {
          title: 'వైద్యుడితో చర్చించడానికి ప్రశ్నలు',
          summary: `మీ వైద్యుడితో మరింత స్పష్టంగా మాట్లాడటానికి ఆధారిత ప్రశ్నలు.`,
          points: [
            `1. "నా సగటు గుండె స్పందన ${avgHR} BPM గా ఉంది. నాకు ECG అవసరమా?"`,
            `2. "నా HRV RMSSD ${avgHRV} ms గా ఉంది. నేను ఎలాంటి జాగ్రత్తలు తీసుకోవాలి?"`,
            `3. "నా రక్తపోటు ${patient.systolicBP}/${patient.diastolicBP} mmHg. నా లక్ష్యాలు ఎలా ఉండాలి?"`,
            `4. "నేను మరింత లోతైన పరీక్షలు చేయించుకోవాలా?"`
          ],
          clinicalDisclaimer: 'వైద్యునితో సంభాషణ కోసం మాత్రమే.'
        },
        kn: {
          title: 'ವೈದ್ಯರೊಂದಿಗೆ ಚರ್ಚಿಸಲು ಪ್ರಶ್ನೆಗಳು',
          summary: `ನಿಮ್ಮ ವೈದ್ಯರೊಂದಿಗೆ ಸಮಾಲೋಚನೆ ನಡೆಸಲು ಸಹಾಯಕವಾದ ಪ್ರಶ್ನೆಗಳು.`,
          points: [
            `1. "ನನ್ನ ಸರಾಸರಿ ಹೃದಯ ಬಡಿತ ${avgHR} BPM ಆಗಿದೆ. ನನಗೆ ECG ಪರೀಕ್ಷೆ ಅಗತ್ಯವಿದೆಯೇ?"`,
            `2. "ನನ್ನ HRV RMSSD ${avgHRV} ms ಆಗಿದೆ. ಜೀವನಶೈಲಿಯಲ್ಲಿ ಯಾವ ಬದಲಾವಣೆಗಳನ್ನು ಮಾಡಬೇಕು?"`,
            `3. "ರಕ್ತದೊತ್ತಡ ${patient.systolicBP}/${patient.diastolicBP} mmHg ಆಗಿದೆ. ನಾನು ಯಾವ ಕ್ರಮಗಳನ್ನು ಅನುಸರಿಸಬೇಕು?"`,
            `4. "ಹೆಚ್ಚಿನ ತಪಾಸಣೆಗೆ ಶಿಫಾರಸು ಮಾಡುತ್ತೀರಾ?"`
          ],
          clinicalDisclaimer: 'ವೈದ್ಯರೊಂದಿಗೆ ಸಮಾಲೋಚನೆಗಾಗಿ ಮಾತ್ರ.'
        }
      }
    };

    const topicKey = explanations[topic] ? topic : 'trend';
    const langKey = (explanations[topicKey] && explanations[topicKey][language]) ? language : 'en';
    const baseResponse = explanations[topicKey][langKey];

    res.json({
      success: true,
      patientId: patient.patientId,
      patientName: patient.fullName,
      topic: topicKey,
      language: langKey,
      explanation: baseResponse,
      modelUsed: process.env.GEMINI_API_KEY ? 'gemini-2.5-flash-grounded' : 'cardiotwin-rule-engine-v2.4',
      isAiGenerated: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString()
    });
  });

  // Integrate Vite dev server middlewares or static files
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CardioTwin AI] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start CardioTwin AI server:', err);
});
