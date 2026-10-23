export type SupportedLanguage = 'en' | 'ta' | 'hi' | 'ml' | 'te' | 'kn';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  script: string;
  locale: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', locale: 'en-US' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', locale: 'ta-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', locale: 'hi-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', locale: 'ml-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', locale: 'te-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', locale: 'kn-IN' },
];

export interface TranslationDictionary {
  // Brand & Subtitle
  'brand.title': string;
  'brand.subtitle': string;
  'brand.badge': string;

  // Navigation
  'nav.workspace': string;
  'nav.intelligence': string;
  'nav.dataManagement': string;
  'nav.reporting': string;
  'nav.system': string;

  'nav.overview': string;
  'nav.patients': string;
  'nav.monitoring': string;
  'nav.riskAnalysis': string;
  'nav.simulator': string;
  'nav.insights': string;
  'nav.modelLab': string;
  'nav.timeline': string;
  'nav.dataQuality': string;
  'nav.reports': string;
  'nav.notifications': string;
  'nav.settings': string;
  'nav.docs': string;

  // Header & Controls
  'header.commandPalette': string;
  'header.streamStart': string;
  'header.streamPause': string;
  'header.resetBuffer': string;
  'header.activeSubject': string;
  'header.takeSnapshot': string;
  'header.notifications': string;
  'header.shortcuts': string;
  'header.theme': string;
  'header.language': string;

  // Clinical & Vitals Labels
  'vital.heartRate': string;
  'vital.hrv': string;
  'vital.spo2': string;
  'vital.bloodPressure': string;
  'vital.sleepDuration': string;
  'vital.deepSleep': string;
  'vital.activity': string;
  'vital.temperatureDev': string;
  'vital.riskScore': string;

  // Risk Categories
  'risk.low': string;
  'risk.moderate': string;
  'risk.elevated': string;
  'risk.high': string;
  'risk.simulatedElevated': string;

  // Common Actions
  'action.search': string;
  'action.filter': string;
  'action.reset': string;
  'action.export': string;
  'action.downloadCsv': string;
  'action.printReport': string;
  'action.close': string;
  'action.apply': string;
  'action.runSimulation': string;
  'action.resetScenario': string;
  'action.compareScenarios': string;

  // Status & Provenance
  'status.online': string;
  'status.live': string;
  'status.simulated': string;
  'status.synthetic': string;
  'status.freshness': string;
  'status.lastUpdated': string;
  'status.samplingFrequency': string;

  // Medical Disclaimers
  'disclaimer.banner': string;
  'disclaimer.researchOnly': string;

  // Healthcare Language Assistant
  'assistant.title': string;
  'assistant.subtitle': string;
  'assistant.badge': string;
  'assistant.promptPlaceholder': string;
  'assistant.askButton': string;
  'assistant.quickPromptTrend': string;
  'assistant.quickPromptHrv': string;
  'assistant.quickPromptSleep': string;
  'assistant.quickPromptRisk': string;
  'assistant.quickPromptQuality': string;
  'assistant.quickPromptQuestions': string;
  'assistant.disclaimer': string;

  // Dynamic index signatures
  [key: string]: string;
}
