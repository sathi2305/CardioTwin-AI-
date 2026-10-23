import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Languages, 
  Send, 
  HelpCircle, 
  CheckCircle2, 
  Activity, 
  Heart, 
  Moon, 
  BrainCircuit, 
  AlertTriangle,
  RotateCcw,
  Copy,
  Check
} from 'lucide-react';
import { DigitalTwinState } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n/types';

interface HealthcareLanguageAssistantProps {
  twinState: DigitalTwinState;
  compact?: boolean;
}

interface AssistantResponse {
  title: string;
  summary: string;
  points: string[];
  clinicalDisclaimer: string;
}

export const HealthcareLanguageAssistant: React.FC<HealthcareLanguageAssistantProps> = ({
  twinState,
  compact = false
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [selectedTopic, setSelectedTopic] = useState<'trend' | 'hrv' | 'risk' | 'questions'>('trend');
  const [customQuery, setCustomQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchExplanation = async (topic: 'trend' | 'hrv' | 'risk' | 'questions', lang: SupportedLanguage, queryText?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/multilingual-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: twinState.ehr.patientId,
          topic,
          language: lang,
          query: queryText || ''
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.explanation) {
          setResponse(data.explanation);
        }
      }
    } catch (err) {
      console.error('Failed to fetch multilingual explanation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplanation(selectedTopic, language);
  }, [twinState.ehr.patientId, selectedTopic, language]);

  const handleSelectTopic = (topic: 'trend' | 'hrv' | 'risk' | 'questions') => {
    setSelectedTopic(topic);
    fetchExplanation(topic, language);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    fetchExplanation(selectedTopic, language, customQuery);
  };

  const handleCopy = () => {
    if (!response) return;
    const text = `${response.title}\n\n${response.summary}\n\n${response.points.map(p => `• ${p}`).join('\n')}\n\n[Clinical Notice: ${response.clinicalDisclaimer}]`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800 transition-colors space-y-5">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                {t('assistant.title')}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                {t('assistant.badge')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('assistant.subtitle')}
            </p>
          </div>
        </div>

        {/* Language Quick Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs">
          <Languages className="w-3.5 h-3.5 text-cyan-500 ml-1 shrink-0" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            aria-label="Select Assistant Language"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Topic selection tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'trend' as const, label: t('assistant.quickPromptTrend'), icon: Activity },
          { id: 'hrv' as const, label: t('assistant.quickPromptHrv'), icon: Heart },
          { id: 'risk' as const, label: t('assistant.quickPromptRisk'), icon: BrainCircuit },
          { id: 'questions' as const, label: t('assistant.quickPromptQuestions'), icon: HelpCircle },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = selectedTopic === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTopic(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-500' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation Content Box */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3 relative">
        {loading ? (
          <div className="flex items-center justify-center py-8 space-x-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span>Generating multilingual physiological explanation...</span>
          </div>
        ) : response ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {response.title}
              </h4>
              <button
                onClick={handleCopy}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Copy Explanation"
                aria-label="Copy explanation"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {response.summary}
            </p>

            <ul className="space-y-1.5 pt-1">
              {response.points.map((pt, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{pt}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2 text-[10px] text-amber-700 dark:text-amber-400/90 flex items-center space-x-1.5 font-medium border-t border-slate-200/80 dark:border-slate-800">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{response.clinicalDisclaimer}</span>
            </div>
          </>
        ) : (
          <p className="text-xs text-slate-500">No explanation available for this selection.</p>
        )}
      </div>

      {/* Interactive Question Input in Any Language */}
      <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={customQuery}
          onChange={(e) => setCustomQuery(e.target.value)}
          placeholder={t('assistant.promptPlaceholder')}
          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !customQuery.trim()}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold disabled:opacity-50 transition-all shrink-0 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{t('assistant.askButton')}</span>
        </button>
      </form>
    </div>
  );
};
