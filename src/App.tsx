import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Activity, 
  Zap, 
  Cpu, 
  Globe, 
  Sprout, 
  GraduationCap, 
  Droplet, 
  ArrowRight,
  ShieldAlert,
  Search,
  Database,
  ExternalLink,
  Volume2,
  VolumeX,
  X,
  Clock,
  Info,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { traceButterflyEffect, ButterflyEffect } from './services/geminiService';
import mermaid from 'mermaid';

// --- Initialize Mermaid ---
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#F59E0B',
    primaryTextColor: '#0F172A',
    primaryBorderColor: '#F59E0B',
    lineColor: '#CBD5E1',
    secondaryColor: '#2563EB',
    tertiaryColor: '#FFFFFF'
  },
  securityLevel: 'loose',
  fontFamily: 'JetBrains Mono',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis'
  }
});

// --- Components ---

const StatusIndicator = ({ active }: { active: boolean }) => (
  <div className="flex items-center gap-2 group cursor-help">
    <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-red-600 animate-neon-pulse shadow-[0_0_10px_#EF4444]' : 'bg-slate-200'} transition-all`} />
    <span className={`text-[9px] font-mono font-bold tracking-tighter uppercase transition-colors ${active ? 'text-red-500' : 'text-slate-400'}`}>
      SIGNAL INGEST: {active ? 'ACTIVE' : 'IDLE'}
    </span>
  </div>
);

const RiskMeter = ({ value }: { value: number }) => (
  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3 relative border border-slate-200">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      className={`h-full relative ${value > 80 ? 'bg-red-500' : value > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
    >
      <div className="absolute inset-0 bg-white/30 animate-progress-shimmer" />
    </motion.div>
  </div>
);

const TacticalCard = ({ icon: Icon, title, description, risk, fact }: any) => (
  <motion.div 
    whileHover={{ scale: 1.02, borderColor: 'var(--color-industrial-amber)' }}
    className="glass-card p-4 rounded-2xl group transition-all relative overflow-hidden bg-white/40 border-slate-200/50"
  >
    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={64} className="text-slate-900" />
    </div>
    <div className="flex items-start justify-between mb-2">
      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
        <Icon className="w-4 h-4 text-industrial-amber" />
      </div>
      <div className="text-[10px] font-mono text-industrial-amber font-black">RISK {risk}%</div>
    </div>
    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">{title}</h4>
    <p className="text-[9px] text-slate-500 leading-tight mb-2 line-clamp-1">{description}</p>
    <div className="flex justify-between items-center text-[8px] font-mono mb-0.5">
      <span className="text-slate-400 uppercase">TELEMETRY STABILITY</span>
      <span className="text-slate-900 font-bold">{fact}</span>
    </div>
    <RiskMeter value={risk} />
  </motion.div>
);

const MermaidRenderer = ({ definition, onNodeClick }: { definition: string, onNodeClick: (id: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (definition && containerRef.current) {
      containerRef.current.innerHTML = `<div class="mermaid">${definition}</div>`;
      mermaid.contentLoaded();
      
      const timeout = setTimeout(() => {
        const nodes = containerRef.current?.querySelectorAll('.node');
        nodes?.forEach(node => {
          node.setAttribute('style', 'cursor: pointer');
          node.addEventListener('click', () => {
            const nodeId = node.id.split('-')[1];
            onNodeClick(nodeId);
          });
        });
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [definition, onNodeClick]);

  return <div ref={containerRef} className="w-full flex justify-center py-8" />;
};

// --- Main Application ---

export default function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ButterflyEffect | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState('T+24h');
  const [intensity, setIntensity] = useState(5);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedLens, setSelectedLens] = useState<any | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const beepRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    beepRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    beepRef.current.volume = 0.2;
  }, []);

  const playBeep = () => {
    if (soundEnabled && beepRef.current) {
      beepRef.current.currentTime = 0;
      beepRef.current.play().catch(() => {});
    }
  };

  const handleTrace = async (customSignal?: string, horizonArg?: string) => {
    const horizon = horizonArg || selectedHorizon;
    const signalToTrace = customSignal || input;
    if (!signalToTrace.trim()) return;
    
    setLoading(true);
    setResult(null);
    setSelectedNode(null);
    setError(null);
    try {
      const data = await traceButterflyEffect(signalToTrace, horizon, intensity);
      setResult(data);
      playBeep();
    } catch (err: any) {
      setError(err.message || "Failed to connect to the intelligence engine.");
    } finally {
      setLoading(false);
    }
  };

  const mermaidImageUrl = useMemo(() => {
    if (!result) return '';
    
    // Hardened sanitize function: remove all problematic characters for mermaid syntax
    const clean = (text: string) => {
      const truncated = text.length > 50 ? text.substring(0, 47) + '...' : text;
      return truncated.replace(/["'\[\]\(\)\{\}\\\.]/g, '').replace(/\n/g, ' ');
    };

    const sNode = clean(result.signal);
    const tNode = clean(result.transmission);
    const oNode = clean(result.regionalOutfall);
    const eNode = clean(result.economicImpact);
    const iNode = clean(result.infrastructureRisk);
    const aNode = clean(result.sovereignAction);

    const definition = `
      graph LR
        SIGNAL["${sNode}"]
        TRANS["${tNode}"]
        OUTFALL{"${oNode}"}
        
        ECON["${eNode}"]
        INFRA["${iNode}"]
        ACTION["${aNode}"]

        SIGNAL -->|TRANSMISSION| TRANS
        TRANS -->|OUTFALL| OUTFALL
        
        OUTFALL -->|ECONOMIC| ECON
        OUTFALL -->|INFRA| INFRA
        OUTFALL -->|SOVEREIGN| ACTION

        style SIGNAL fill:#3B82F6,stroke:#3B82F6,stroke-width:2px,color:#FFFFFF
        style TRANS fill:#F59E0B,stroke:#F59E0B,stroke-width:2px,color:#FFFFFF
        style OUTFALL fill:#EF4444,stroke:#EF4444,stroke-width:2px,color:#FFFFFF
        
        style ECON fill:#FFFFFF,stroke:#3B82F6,stroke-width:1px,color:#0F172A
        style INFRA fill:#FFFFFF,stroke:#EF4444,stroke-width:1px,color:#0F172A
        style ACTION fill:#FFFFFF,stroke:#F59E0B,stroke-width:1px,color:#0F172A
    `;

    try {
      const base64 = btoa(definition);
      return `https://mermaid.ink/img/${base64}`;
    } catch (e) {
      console.error('Base64 encoding failed', e);
      return '';
    }
  }, [result]);

  const radarLenses = [
    { icon: Zap, title: "Energy & Grid", description: "Load-shedding probability and tariff shifts.", risk: 42, fact: "98.4%" },
    { icon: ShieldAlert, title: "Sovereign Assets", description: "Currency erosion risk (PKR/DXY) and hedging advice.", risk: 78, fact: "99.1%" },
    { icon: Cpu, title: "IT & Connectivity", description: "Cloud infrastructure costs and semiconductor flow.", risk: 25, fact: "99.9%" },
    { icon: Globe, title: "Internet Continuity", description: "Subsea cable health and 'Doomsday' blackout risks.", risk: 15, fact: "97.2%" },
    { icon: Sprout, title: "Agriculture", description: "Fertilizer supply chain shocks and food export parity.", risk: 55, fact: "92.4%" },
    { icon: GraduationCap, title: "Academic Calendar", description: "Predicting exam delays or shifts to remote learning.", risk: 12, fact: "100%" },
    { icon: Droplet, title: "Petroleum", description: "Real-time pump price ripple forecasts.", risk: 88, fact: "84.1%" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-industrial-amber/30 selection:text-slate-900 overflow-hidden bg-white industrial-grid">
      {/* Ticker */}
      <div className="h-8 bg-slate-50 border-b border-slate-100 flex items-center overflow-hidden z-[60]">
        <div className="flex whitespace-nowrap animate-ticker text-[10px] uppercase font-mono tracking-[0.2em] text-slate-400 font-bold">
          <span className="mx-12">[TRUTH FLAG: {result?.truthFlag || 'PENDING'}]</span>
          <span className="mx-12 text-slate-800">[SIGNAL] SUEZ CANAL THROUGHPUT DECREASED 12.4%</span>
          <span className="mx-12">[ANALYSIS] SEMICONDUCTOR FABRICATION NODES IN TAIWAN REPORTED NOMINAL</span>
          <span className="mx-12">[INTEL] SHANGHAI PORT BACKLOG INCREASING AT T+24H</span>
          <span className="mx-12 text-industrial-amber">[ALERT] SOVEREIGN WEALTH DIVERSIFICATION DETECTED IN GCC</span>
          <span className="mx-12 font-bold">[TRUTH FLAG: {result?.truthFlag || 'PENDING'}]</span>
          {/* Duplicate for seamless scroll */}
          <span className="mx-12 text-slate-800">[SIGNAL] SUEZ CANAL THROUGHPUT DECREASED 12.4%</span>
          <span className="mx-12">[ANALYSIS] SEMICONDUCTOR FABRICATION NODES IN TAIWAN REPORTED NOMINAL</span>
          <span className="mx-12">[INTEL] SHANGHAI PORT BACKLOG INCREASING AT T+24H</span>
          <span className="mx-12 text-industrial-amber">[ALERT] SOVEREIGN WEALTH DIVERSIFICATION DETECTED IN GCC</span>
        </div>
      </div>

      <header className="h-16 glass-card backdrop-blur-xl flex items-center px-6 justify-between shrink-0 sticky top-0 z-50 border-slate-200/50 bg-white/70">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900 italic uppercase">ASTRAEA SENTINEL</h1>
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-black">The Intelligence to Build. The Resilience to Lead.</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-100 hidden md:block" />
          <div className="hidden lg:flex items-center gap-4">
            <StatusIndicator active={loading || !!result} />
            {result && (
              <div className={`px-2 py-0.5 rounded text-[8px] font-black border ${result.truthFlag === 'VERIFIED' ? 'bg-emerald-50 border-emerald-500/20 text-emerald-600' : 'bg-red-50 border-red-500/20 text-red-600 animate-pulse'}`}>
                {result.truthFlag}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex glass-card rounded-lg p-1 w-48 md:w-80 group border-slate-200 focus-within:border-industrial-amber/50 transition-all bg-white">
            <input 
              type="text" 
              placeholder="LIVE SIGNAL INPUT..."
              className="bg-transparent border-none focus:ring-0 text-[10px] font-mono text-slate-900 flex-1 px-3 placeholder:text-slate-300 uppercase font-bold"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrace()}
            />
            <button 
              onClick={() => handleTrace()}
              disabled={loading}
              className="bg-industrial-amber hover:bg-industrial-amber/90 text-white p-1.5 rounded transition-all disabled:opacity-30"
            >
              <Search size={14} />
            </button>
          </div>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-full glass-card transition-colors ${soundEnabled ? 'text-industrial-amber border-industrial-amber/40 shadow-inner bg-industrial-amber/5' : 'text-slate-400 border-slate-100'}`}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden industrial-grid bg-slate-50/30">
        {/* Left Side: Butterfly Engine */}
        <section className="flex-[3] flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 glass-card rounded-3xl p-6 relative flex flex-col min-h-0 bg-white shadow-sm border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <Activity size={16} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Butterfly Effect Engine</h3>
                  <p className="text-[9px] text-slate-400 uppercase tracking-tighter">Causality Mapping // Interactive</p>
                </div>
              </div>

              {/* Time Horizon Slider Wrapper */}
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/50 gap-1">
                <button 
                  onClick={() => {
                    setInput("Hormuz Blockade Escalation");
                    handleTrace("Hormuz Blockade Escalation");
                  }}
                  disabled={loading}
                  className="px-3 py-1.5 text-[9px] font-black rounded-lg transition-all uppercase bg-industrial-amber text-white hover:bg-industrial-amber/90 disabled:opacity-50"
                >
                  Sim: Hormuz
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                {['T+24h', 'T+72h', '1 Week'].map((h) => (
                  <button
                    key={h}
                    onClick={() => { setSelectedHorizon(h); if (result) handleTrace(undefined, h); }}
                    className={`px-4 py-1.5 text-[9px] font-black rounded-lg transition-all uppercase ${selectedHorizon === h ? 'bg-white shadow-sm text-slate-900 border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 relative flex items-center justify-center overflow-auto scrollbar-hide min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    className="relative"
                  >
                    <Globe className="w-20 h-20 text-slate-200" />
                    <div className="absolute inset-0 border-2 border-industrial-amber/20 rounded-full animate-ping" />
                  </motion.div>
                  <p className="text-[10px] font-mono text-industrial-amber uppercase tracking-[0.4em] mt-8 font-black">Tracing Casuality...</p>
                </div>
              ) : result && mermaidImageUrl ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img 
                    src={mermaidImageUrl} 
                    alt="Butterfly Effect Map" 
                    className="max-w-full max-h-full object-contain filter drop-shadow-md hover:drop-shadow-xl transition-all"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-6 opacity-40">
                    <Radio size={80} strokeWidth={0.5} className="mx-auto text-slate-300" />
                  </div>
                  <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest italic">Awaiting Sentinel Input</h4>
                  <p className="text-[10px] text-slate-400 italic max-w-xs mx-auto mt-2 font-mono">Input a geopolitical or logistics event to begin casualty propagation tracing.</p>
                </div>
              )}
            </div>

            {/* Evidence Legend */}
            <div className="flex gap-6 mt-6 border-t border-slate-50 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full border border-blue-500 bg-blue-50" />
                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Signal Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded bg-amber-50 border border-amber-500 border-dashed" />
                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Transmission Jump</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rotate-45 border border-red-500 bg-red-50" />
                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Sovereign Outfall</span>
              </div>
            </div>
          </div>

          <div className="h-40 glass-card rounded-3xl p-5 flex flex-col shrink-0 bg-white border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute right-[-2%] bottom-[-10%] opacity-5">
              <Database size={100} className="text-slate-900" />
            </div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <Database className="w-3 h-3 text-emerald-500" />
                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Hard Data Grounding</h3>
              </div>
              <span className="text-[8px] font-mono text-slate-400 uppercase font-bold">Alpha Validation: Verified</span>
            </div>
            <div className="flex-1 relative z-10 rounded-xl bg-slate-50/50 p-2 overflow-y-auto scrollbar-hide">
              {result ? (
                <div className="flex flex-wrap gap-3">
                  {result.indices.map((idx, i) => (
                    <div key={i} className="px-3 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-sm group hover:border-emerald-500/50 transition-all">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                      <span className="text-slate-700 font-black text-[9px] uppercase tracking-tighter">{idx}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-4 opacity-5">
                  {[1,2,3,4].map(i => <div key={i} className="w-32 h-12 bg-slate-200 rounded-xl" />)}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Side: Grid */}
        <aside className="flex-1 flex flex-col gap-4 overflow-hidden min-w-[320px]">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Sovereign Radar</h3>
            <span className="text-[9px] text-slate-400 font-black uppercase">Sector Ops</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 scrollbar-hide">
            <div className="px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest leading-none">Global Shock Intensity</span>
                <span className="text-[10px] font-mono font-bold text-industrial-amber">{intensity}/10</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={intensity} 
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full accent-industrial-amber h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-slate-400 mt-1 uppercase font-bold">
                <span>Nominal</span>
                <span>Collapse</span>
              </div>
            </div>

            {radarLenses.map((lens, i) => (
              <div key={i} onClick={() => setSelectedLens(lens)} className="cursor-pointer">
                <TacticalCard {...lens} />
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-3xl relative overflow-hidden shadow-sm">
            <div className="absolute right-[-15%] bottom-[-15%] opacity-[0.03] rotate-12">
              <ShieldAlert size={120} className="text-slate-900" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Info size={12} className="text-industrial-amber" />
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Astraea Insight</span>
            </div>
            
            {result && (
              <div className="mb-4 p-3 bg-slate-900 rounded-2xl border-l-[6px] border-industrial-amber shadow-lg">
                <span className="text-[9px] font-black text-industrial-amber uppercase tracking-widest block mb-1">SOVEREIGN PIVOT</span>
                <p className="text-[11px] text-white font-black leading-tight italic">
                  {result.pivot}
                </p>
              </div>
            )}

            <p className="text-[10px] text-slate-500 leading-relaxed font-bold italic border-l-2 border-slate-200 pl-3">
              {result ? `Subjective drift identified in ${result.regionalOutfall.split(' ')[0]} corridor. Deployment of redundant knowledge nodes recommended for ${selectedHorizon} horizon.` 
              : "Cross-referencing real-time telemetry with Astraea historical archives. Readiness levels nominal."}
            </p>
          </div>
        </aside>
      </main>

      {/* Forensic Sidebar */}
      <AnimatePresence>
        {selectedLens && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSelectedLens(null)}
          >
            <motion.div 
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full border border-slate-100 relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <selectedLens.icon size={160} />
              </div>
              <div className="flex items-center gap-4 mb-6 relative">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <selectedLens.icon className="w-8 h-8 text-industrial-amber" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">{selectedLens.title}</h2>
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Sector Data Dump // Alpha Stream</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-8 relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-industrial-amber/30">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-1">Resource Allocation ID</span>
                    <span className="text-lg font-black text-slate-900 leading-none">0x{selectedLens.risk.toString(16).toUpperCase()}4A</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-industrial-amber/30">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-1">Information Friction</span>
                    <span className="text-lg font-black text-slate-900 leading-none">+{Math.floor(selectedLens.risk / 5)}ms</span>
                  </div>
                </div>
                
                <div className="p-6 bg-slate-900 rounded-3xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-industrial-amber/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[9px] font-black text-industrial-amber uppercase tracking-widest block mb-4 border-b border-industrial-amber/20 pb-2">SYSTEM VITALS // ALPHA STREAM</span>
                  <table className="w-full text-[10px] font-mono">
                    <tbody>
                      <tr className="border-b border-white/5">
                        <td className="py-2 text-slate-500 uppercase tracking-tighter">Data Integrity</td>
                        <td className={`py-2 text-right font-bold ${parseFloat(selectedLens.fact) > 95 ? 'text-emerald-400' : 'text-amber-400'}`}>{selectedLens.fact}</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 text-slate-500 uppercase tracking-tighter">Redundancy Posture</td>
                        <td className="py-2 text-right font-bold text-blue-400 animate-pulse">ACTIVE</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-500 uppercase tracking-tighter">Sovereign Exposure</td>
                        <td className={`py-2 text-right font-bold ${selectedLens.risk > 70 ? 'text-red-400' : 'text-slate-300'}`}>{selectedLens.risk > 70 ? 'CRITICAL' : 'NOMINAL'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-5 bg-industrial-amber shadow-sm rounded-3xl">
                  <span className="text-[9px] font-black text-white uppercase tracking-widest block mb-2 font-mono">Architect's Briefing</span>
                  <p className="text-[11px] text-white/90 leading-relaxed font-bold italic">
                    {selectedLens.risk > 60 
                      ? "Integrity drift detected in primary corridor; suggest switching to Hard Data Anchors immediately to maintain sovereign baseline."
                      : "Telemetry remains within nominal operating bands. Recommend maintaining current hedging profile for 24h horizon."}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedLens(null)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all"
              >
                Close Data Stream
              </button>
            </motion.div>
          </motion.div>
        )}

        {selectedNode && result && (
          <motion.div 
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            className="fixed right-0 top-0 h-full w-full max-w-md glass-card z-[100] p-10 shadow-2xl backdrop-blur-3xl border-l border-slate-200 bg-white/90"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl border ${selectedNode === 'SIGNAL' ? 'border-blue-500 bg-blue-50' : selectedNode === 'TRANS' ? 'border-amber-500 bg-amber-50' : 'border-red-500 bg-red-50'}`}>
                  <Maximize2 size={20} className={selectedNode === 'SIGNAL' ? 'text-blue-500' : selectedNode === 'TRANS' ? 'text-amber-500' : 'text-red-500'} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tighter italic uppercase">Forensic Vault</h2>
                  <p className="text-[10px] font-mono font-bold text-slate-400">SENTINEL-ALPHA DECRYPTION</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="p-3 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-900"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-10 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 scrollbar-hide">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Subject</h4>
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl">
                  <p className="text-base text-slate-900 font-black italic leading-tight">
                    {selectedNode === 'SIGNAL' ? result.signal : selectedNode === 'TRANS' ? result.transmission : result.regionalOutfall}
                  </p>
                </div>
              </div>

              {selectedNode === 'SIGNAL' && (
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Intelligence Verification</h4>
                  <div className="p-5 bg-industrial-amber shadow-sm rounded-3xl">
                    <p className="text-[11px] text-white font-black uppercase mb-2 tracking-tighter">Reality Check: vs Noise</p>
                    <p className="text-xs text-white/90 leading-relaxed font-bold italic">{result.realityCheck}</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Verified Grounding</h4>
                <div className="space-y-4">
                  {result.evidence.map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-3xl group hover:border-industrial-amber transition-all shadow-sm">
                      <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 text-[11px] font-black text-slate-900 border border-slate-100">0{i+1}</div>
                      <p className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-900 transition-colors font-bold italic">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Telemetric Indices</h4>
                <div className="grid grid-cols-2 gap-4">
                  {result.indices.map((idx, i) => (
                    <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                      <div className="text-[8px] font-black text-slate-300 uppercase mb-1 tracking-widest">Active Index</div>
                      <div className="text-[10px] font-black text-slate-900">{idx}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 left-10 right-10">
              <div className={`p-5 rounded-2xl font-black text-[11px] uppercase flex items-center justify-between shadow-2xl transition-all ${result.truthFlag === 'VERIFIED' ? 'bg-slate-900 text-white shadow-slate-900/10' : 'bg-red-500 text-white shadow-red-500/10 animate-pulse'}`}>
                <span>Integrity: {result.truthFlag}</span>
                <ChevronRight size={16} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
