import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  Heart, 
  Activity, 
  ShieldAlert, 
  ExternalLink, 
  FileText, 
  Pill, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { PatientEHR, RiskLevel } from '../types';
import { Badge } from '../components/ui/Badge';
import { useLanguage } from '../context/LanguageContext';

interface PatientsPageProps {
  patients: PatientEHR[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  onNavigateTab,
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [activePatientDetail, setActivePatientDetail] = useState<PatientEHR | null>(null);

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.medications.some((m) => m.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRisk = riskFilter === 'ALL' || p.baselineRiskCategory === riskFilter;

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {t('nav.patients', 'Patient Digital Twin Registry')}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              N = {patients.length} Synthetic Profiles
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Each digital twin integrates static clinical EHR records (demographics, lipid panels, HbA1c, documented diagnoses) with dynamic wearable baseline parameters.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t('action.search', 'Search by ID, name, medication...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 w-64"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 text-xs">
            {['ALL', 'Low', 'Moderate', 'Elevated', 'High'].map((tier) => (
              <button
                key={tier}
                onClick={() => setRiskFilter(tier)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  riskFilter === tier
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white dark:bg-[#0f172a]/90 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#0b1224] text-slate-600 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Demographics</th>
                <th className="py-3 px-4">Blood Pressure</th>
                <th className="py-3 px-4">Lipids & HbA1c</th>
                <th className="py-3 px-4">Comorbidities</th>
                <th className="py-3 px-4">Baseline HR / HRV</th>
                <th className="py-3 px-4">Risk Tier</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredPatients.map((patient) => {
                const isSelected = patient.patientId === selectedPatientId;
                return (
                  <tr
                    key={patient.patientId}
                    className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      isSelected ? 'bg-cyan-500/10 dark:bg-cyan-950/20' : ''
                    }`}
                  >
                    {/* Subject */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isSelected
                              ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {patient.fullName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                            <span>{patient.fullName}</span>
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{patient.patientId}</span>
                        </div>
                      </div>
                    </td>

                    {/* Demographics */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <div>{patient.age} yrs, {patient.gender}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">BMI: {patient.bmi} | {patient.smokingStatus}</div>
                    </td>

                    {/* Blood Pressure */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-200">
                        {patient.systolicBP}/{patient.diastolicBP}
                      </span>{' '}
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">mmHg</span>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Exam: {patient.lastExamDate}</div>
                    </td>

                    {/* Lipids & HbA1c */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 dark:text-slate-300">
                        LDL: <strong className="text-slate-900 dark:text-slate-100">{patient.ldlCholesterol}</strong> | HDL: <strong className="text-slate-900 dark:text-slate-100">{patient.hdlCholesterol}</strong>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Ratio: {(patient.ldlCholesterol / patient.hdlCholesterol).toFixed(2)} | HbA1c: {patient.hbA1c}%
                      </div>
                    </td>

                    {/* Comorbidities */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {patient.hasCAD && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                            CAD
                          </span>
                        )}
                        {patient.hasHypertension && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            HTN
                          </span>
                        )}
                        {patient.hasDiabetes && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                            T2D
                          </span>
                        )}
                        {!patient.hasCAD && !patient.hasHypertension && !patient.hasDiabetes && (
                          <span className="text-[10px] text-slate-400">None reported</span>
                        )}
                      </div>
                    </td>

                    {/* Baseline HR / HRV */}
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                      <div>{patient.restingHeartRateBaseline} bpm</div>
                      <div className="text-[10px] text-teal-600 dark:text-teal-400">{patient.restingHrvBaseline} ms RMSSD</div>
                    </td>

                    {/* Risk Tier */}
                    <td className="py-3.5 px-4">
                      <Badge riskLevel={patient.baselineRiskCategory}>{patient.baselineRiskCategory}</Badge>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            onSelectPatient(patient.patientId);
                            onNavigateTab('overview');
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 shadow-sm'
                              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {isSelected ? 'Active Twin' : 'Load Twin'}
                        </button>
                        <button
                          onClick={() => setActivePatientDetail(patient)}
                          className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="View In-Depth Longitudinal Record"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Modal / Expander */}
      {activePatientDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-300 font-bold">
                  {activePatientDetail.fullName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>{activePatientDetail.fullName}</span>
                    <Badge riskLevel={activePatientDetail.baselineRiskCategory}>
                      {activePatientDetail.baselineRiskCategory} Risk
                    </Badge>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Synthetic ID: {activePatientDetail.patientId} | Last Clinical Visit: {activePatientDetail.lastExamDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePatientDetail(null)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Demographics</span>
                <span className="font-bold text-slate-900 dark:text-slate-200 text-sm mt-0.5 block">
                  {activePatientDetail.age} yrs • {activePatientDetail.gender}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">BMI: {activePatientDetail.bmi}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Cuff Blood Pressure</span>
                <span className="font-bold text-slate-900 dark:text-slate-200 text-sm mt-0.5 block font-mono">
                  {activePatientDetail.systolicBP}/{activePatientDetail.diastolicBP} mmHg
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">{activePatientDetail.systolicBP >= 140 ? 'Hypertensive' : 'Normotensive'}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">HbA1c & Glycemia</span>
                <span className="font-bold text-slate-900 dark:text-slate-200 text-sm mt-0.5 block font-mono">
                  {activePatientDetail.hbA1c}%
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">{activePatientDetail.hasDiabetes ? 'Type 2 Diabetes' : 'Non-diabetic'}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Lipid Breakdown</span>
                <span className="font-bold text-slate-900 dark:text-slate-200 text-xs mt-0.5 block">
                  LDL: {activePatientDetail.ldlCholesterol} | HDL: {activePatientDetail.hdlCholesterol}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Triglycerides: {activePatientDetail.triglycerides} mg/dL</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Resting Vitals Baseline</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-300 text-xs mt-0.5 block font-mono">
                  HR: {activePatientDetail.restingHeartRateBaseline} bpm | HRV: {activePatientDetail.restingHrvBaseline} ms
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Circadian calibrated</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Family History</span>
                <span className="font-bold text-slate-900 dark:text-slate-200 text-xs mt-0.5 block">
                  {activePatientDetail.familyHistoryCAD ? 'Positive (1st Degree)' : 'Negative'}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Smoking: {activePatientDetail.smokingStatus}</span>
              </div>
            </div>

            {/* Prescribed Medications */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-300">
                <Pill className="w-4 h-4 text-purple-500" />
                <span>Documented Historical Pharmacotherapy</span>
              </div>
              {activePatientDetail.medications.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activePatientDetail.medications.map((med, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono border border-slate-200 dark:border-slate-700"
                    >
                      {med}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">No active cardiovascular medications recorded.</p>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActivePatientDetail(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onSelectPatient(activePatientDetail.patientId);
                  setActivePatientDetail(null);
                  onNavigateTab('overview');
                }}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20"
              >
                Activate This Digital Twin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
