
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Leaf, 
  ClipboardList, 
  Zap, 
  Thermometer, 
  User, 
  Send,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { SensorData, ShiftReport, HistoryItem } from './types';
import { generateShiftReport } from './geminiService';

const App: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData>({
    workerId: "W-8821",
    heartRate: 72,
    machineTemp: 45,
    energyConsumption: 32,
    activeTasks: "Calibration of Line A",
    timestamp: new Date().toISOString()
  });

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentReport, setCurrentReport] = useState<ShiftReport | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Safety Protocol Alert Logic
  const isSafetyCritical = sensorData.heartRate > 110 || sensorData.machineTemp > 85;
  const isEcoWarning = sensorData.energyConsumption > 50;

  const handleGenerateReport = async () => {
    setIsAnalyzing(true);
    setCurrentReport(null);
    try {
      const report = await generateShiftReport(sensorData);
      setCurrentReport(report);
      
      const newHistoryItem: HistoryItem = {
        ...sensorData,
        id: crypto.randomUUID(),
        report
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 10));
    } catch (error) {
      setShowNotification("Error: Failed to sync with EcoSync OS neural link.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setShowNotification("Feedback received. Human-centric parameters updated.");
    setFeedback("");
  };

  const updateSensor = (key: keyof SensorData, value: any) => {
    setSensorData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/20 p-2 rounded-lg border border-cyan-500/30">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                EcoSync <span className="text-cyan-400">OS</span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">Human-Centric Smart Factory Interface</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-mono text-slate-500">SYSTEM STATUS</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> OPTIMAL
              </span>
            </div>
            <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <LogOut className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls & Real-time Sensors */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Safety Alert Banner */}
            {isSafetyCritical && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-4 animate-bounce">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <ShieldAlert className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-red-500 font-bold uppercase text-sm tracking-wider">Safety Protocol Alert</h3>
                  <p className="text-red-200/80 text-xs mt-1">
                    System detected thresholds breach. Initiating automatic cooling and worker health check.
                  </p>
                </div>
              </div>
            )}

            {/* Sensor Input Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
                <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Sensor Integration
                </h2>
                <span className="text-[10px] font-mono text-slate-500">LINK: SYNCED</span>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Worker ID
                    </label>
                    <input 
                      type="text" 
                      value={sensorData.workerId}
                      onChange={(e) => updateSensor('workerId', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-cyan-500/50 outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                      <Thermometer className="w-3 h-3" /> Machine Temp (°C)
                    </label>
                    <input 
                      type="number" 
                      value={sensorData.machineTemp}
                      onChange={(e) => updateSensor('machineTemp', Number(e.target.value))}
                      className={`w-full bg-slate-950 border ${sensorData.machineTemp > 85 ? 'border-red-500/50' : 'border-slate-800'} rounded-lg px-3 py-2 text-sm focus:border-cyan-500/50 outline-none transition-colors`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                      <Activity className="w-3 h-3" /> Heart Rate (BPM)
                    </label>
                    <input 
                      type="number" 
                      value={sensorData.heartRate}
                      onChange={(e) => updateSensor('heartRate', Number(e.target.value))}
                      className={`w-full bg-slate-950 border ${sensorData.heartRate > 110 ? 'border-red-500/50' : 'border-slate-800'} rounded-lg px-3 py-2 text-sm focus:border-cyan-500/50 outline-none transition-colors`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                      <Leaf className="w-3 h-3" /> Energy (kWh)
                    </label>
                    <input 
                      type="number" 
                      value={sensorData.energyConsumption}
                      onChange={(e) => updateSensor('energyConsumption', Number(e.target.value))}
                      className={`w-full bg-slate-950 border ${sensorData.energyConsumption > 50 ? 'border-amber-500/50' : 'border-slate-800'} rounded-lg px-3 py-2 text-sm focus:border-cyan-500/50 outline-none transition-colors`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <ClipboardList className="w-3 h-3" /> Active Operation
                  </label>
                  <textarea 
                    value={sensorData.activeTasks}
                    onChange={(e) => updateSensor('activeTasks', e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-cyan-500/50 outline-none transition-colors resize-none"
                  />
                </div>
                <button 
                  onClick={handleGenerateReport}
                  disabled={isAnalyzing}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Activity className="w-5 h-5" />
                  )}
                  {isAnalyzing ? "SYNCING DATA..." : "GENERATE SHIFT REPORT"}
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Avg HR Today</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold">78</span>
                  <span className="text-xs text-slate-400">bpm</span>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Green Efficiency</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-emerald-400">92%</span>
                  <span className="text-xs text-slate-400">rank</span>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-64 shadow-lg">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Vitals History
              </h3>
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={history.map((h, i) => ({ name: i, hr: h.heartRate, temp: h.machineTemp })).reverse()}>
                  <defs>
                    <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="hr" stroke="#22d3ee" fillOpacity={1} fill="url(#colorHr)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column: AI Output & Logs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* AI Report Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl min-h-[600px] flex flex-col">
              <div className="p-6 border-b border-slate-800 bg-slate-800/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-widest">Shift Intelligence Report</h2>
                </div>
                {currentReport && (
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1.5 ${
                    currentReport.safetyStatus === 'Red' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                    currentReport.safetyStatus === 'Yellow' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                  }`}>
                    <span className="w-1.5 h-1.5 bg-current rounded-full" />
                    STATUS: {currentReport.safetyStatus}
                  </div>
                )}
              </div>

              <div className="flex-1 p-8 overflow-y-auto font-mono text-sm leading-relaxed space-y-6">
                {!currentReport && !isAnalyzing && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <Activity className="w-16 h-16" />
                    <div>
                      <p className="text-lg font-bold">Awaiting Sensor Sync</p>
                      <p className="text-xs max-w-xs mx-auto">Upload machine telemetry and worker vitals to generate a Human-Centric report.</p>
                    </div>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                    <div className="h-32 bg-slate-800 rounded w-full"></div>
                  </div>
                )}

                {currentReport && (
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-slate-300">
                      {currentReport.content.split('\n').map((line, i) => {
                        if (line.startsWith('#')) return <h3 key={i} className="text-cyan-400 font-bold mt-4 mb-2">{line.replace(/#/g, '')}</h3>;
                        if (line.includes('SAFETY PROTOCOL ALERT')) return <span key={i} className="block bg-red-500/20 text-red-400 border border-red-500/30 p-2 my-2 rounded font-bold uppercase">{line}</span>;
                        return <p key={i} className="mb-2">{line}</p>;
                      })}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-slate-800">
                      <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">Factory Log Payload (JSON)</h4>
                      <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-[11px] text-cyan-300/80">
                        <code>{currentReport.rawJson}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback Footer */}
              {currentReport && (
                <div className="p-6 border-t border-slate-800 bg-slate-800/10">
                  <form onSubmit={handleFeedbackSubmit} className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="Share your thoughts on these suggestions..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-cyan-500/50 outline-none transition-colors"
                    />
                    <button 
                      type="submit"
                      className="bg-slate-800 hover:bg-slate-700 text-white p-2 px-4 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* History Logs */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest">Neural Link History</h3>
              </div>
              <div className="divide-y divide-slate-800">
                {history.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">No shift history found.</div>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-slate-800/30 transition-colors group cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          item.report?.safetyStatus === 'Red' ? 'bg-red-500/10 text-red-500' : 
                          item.report?.safetyStatus === 'Yellow' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-200">{item.activeTasks}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{new Date(item.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-3">
                          <div className="text-center">
                            <p className="text-[10px] text-slate-500 uppercase">HR</p>
                            <p className="text-xs font-bold">{item.heartRate}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] text-slate-500 uppercase">Energy</p>
                            <p className="text-xs font-bold">{item.energyConsumption}k</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-cyan-500 transition-colors" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Persistent Notification Toast */}
      {showNotification && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-cyan-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-bold">{showNotification}</span>
          <button onClick={() => setShowNotification(null)} className="ml-2 hover:text-white/70 transition-colors">
            &times;
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500">
          <p className="text-xs font-mono">&copy; 2024 ECOSYNC OS - NEURAL FACTORY LINK V2.4</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs hover:text-cyan-400 transition-colors uppercase tracking-widest">Protocol Documentation</a>
            <a href="#" className="text-xs hover:text-cyan-400 transition-colors uppercase tracking-widest">Human Safety Standards</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
