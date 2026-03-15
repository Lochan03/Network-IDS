import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Shield, BarChart2, Activity, Database, Zap, Lock,
  Eye, AlertTriangle, CheckCircle, ArrowRight, Cpu, Network,
  TrendingUp, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ── Animated counter hook ── */
function useCounter(target: number, duration = 1800, suffix = '') {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current * 100) / 100);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

/* ── Live threat ticker ── */
const THREAT_EVENTS = [
  '⚡ Port scan detected from 192.168.1.44',
  '🛡️ DoS attempt blocked — 203.0.113.7',
  '🔍 Anomalous UDP flood suppressed',
  '✅ Normal traffic stream — batch #2841',
  '🚨 Brute-force SSH attempt mitigated',
  '📡 Lateral movement pattern flagged',
  '✅ Clean traffic from subnet 10.0.0.0/24',
];

const ThreatTicker = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setFade(false);
      setTimeout(() => { setIndex(i => (i + 1) % THREAT_EVENTS.length); setFade(true); }, 300);
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex items-center gap-3 bg-cyberpulse-darker/70 border border-cyberpulse-purple/20 rounded-full px-4 py-2 text-sm backdrop-blur-sm w-fit">
      <span className="h-2 w-2 rounded-full bg-cyberpulse-green animate-pulse flex-shrink-0" />
      <span
        className="font-mono text-gray-300 transition-opacity duration-300"
        style={{ opacity: fade ? 1 : 0 }}
      >
        {THREAT_EVENTS[index]}
      </span>
    </div>
  );
};

/* ── Floating hero visual ── */
const HeroVisual = () => (
  <div className="relative w-full max-w-lg mx-auto float-orb">
    {/* Outer glow ring */}
    <div className="absolute -inset-4 bg-cyberpulse-purple/10 rounded-full blur-2xl" />
    {/* Main panel */}
    <div className="relative border-glow bg-cyberpulse-darker rounded-2xl p-5 space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-cyberpulse-red animate-pulse" />
          <div className="h-3 w-3 rounded-full bg-cyberpulse-orange" />
          <div className="h-3 w-3 rounded-full bg-cyberpulse-green" />
        </div>
        <span className="text-xs font-mono text-cyberpulse-purple">NIDS — Live Monitor</span>
        <div className="flex items-center gap-1 text-xs text-green-400">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          ACTIVE
        </div>
      </div>

      {/* Mini stat row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Packets', value: '48,291', color: 'text-cyberpulse-blue' },
          { label: 'Threats', value: '312', color: 'text-cyberpulse-red' },
          { label: 'Safe', value: '99.2%', color: 'text-cyberpulse-green' },
        ].map((s) => (
          <div key={s.label} className="bg-black/30 rounded-lg p-2 text-center">
            <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mini chart bars */}
      <div className="space-y-2">
        {[
          { label: 'TCP', pct: 68, color: 'bg-cyberpulse-purple' },
          { label: 'UDP', pct: 22, color: 'bg-cyberpulse-blue' },
          { label: 'ICMP', pct: 10, color: 'bg-cyberpulse-orange' },
        ].map((p) => (
          <div key={p.label} className="flex items-center gap-2 text-xs">
            <span className="w-10 text-gray-400 font-mono">{p.label}</span>
            <div className="flex-1 bg-black/40 rounded-full h-2">
              <div
                className={`${p.color} h-2 rounded-full`}
                style={{ width: `${p.pct}%` }}
              />
            </div>
            <span className="w-8 text-right text-gray-400">{p.pct}%</span>
          </div>
        ))}
      </div>

      {/* Alert feed */}
      <div className="space-y-1.5 font-mono text-xs max-h-28 overflow-hidden">
        {[
          { type: 'NORMAL', ip: '10.0.0.12 → 8.8.8.8', proto: 'TCP', t: '09:14:02' },
          { type: 'ATTACK', ip: '172.16.3.55 → 192.168.0.1', proto: 'UDP', t: '09:14:03' },
          { type: 'NORMAL', ip: '192.168.1.5 → 1.1.1.1', proto: 'TCP', t: '09:14:04' },
          { type: 'ATTACK', ip: '10.10.10.99 → 10.0.0.1', proto: 'ICMP', t: '09:14:05' },
        ].map((r, i) => (
          <div key={i} className={`flex items-center gap-2 px-2 py-1 rounded ${r.type === 'ATTACK' ? 'bg-red-500/10 text-red-400' : 'text-gray-400'}`}>
            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${r.type === 'ATTACK' ? 'bg-red-400' : 'bg-green-400'}`} />
            <span className="flex-1 truncate">{r.ip}</span>
            <span className="text-gray-600">{r.proto}</span>
            <span className="text-gray-600">{r.t}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ── How it works step ── */
const Step = ({ num, title, desc, icon }: { num: number; title: string; desc: string; icon: React.ReactNode }) => (
  <div className="flex gap-5 group">
    <div className="flex flex-col items-center">
      <div className="h-12 w-12 rounded-full bg-cyberpulse-purple/15 border border-cyberpulse-purple/40 flex items-center justify-center text-cyberpulse-purple font-bold text-lg flex-shrink-0 group-hover:bg-cyberpulse-purple/25 transition-colors">
        {num}
      </div>
      {num < 4 && <div className="w-px flex-1 bg-cyberpulse-purple/20 mt-2" />}
    </div>
    <div className="pb-8 space-y-1">
      <div className="flex items-center gap-2 text-cyberpulse-purple">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const Home = () => {
  const acc  = useCounter(96.52, 2000);
  const rec  = useCounter(99, 1800);
  const f1   = useCounter(97, 1900);
  const pkts = useCounter(565576, 2200);

  return (
    <div className="flex flex-col w-full overflow-x-hidden">

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section className="relative py-24 px-4 cyber-grid-bg overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] bg-cyberpulse-purple/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[320px] h-[320px] bg-cyberpulse-blue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-14">
          {/* Left copy */}
          <div className="lg:w-1/2 space-y-7 animate-fade-in">
            {/* Status badge */}
            <div className="flex items-center gap-2 text-xs bg-cyberpulse-green/10 border border-cyberpulse-green/30 text-cyberpulse-green px-3 py-1.5 rounded-full w-fit">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>System Operational — LSTM + CNN Hybrid Model Active</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Detect Threats
              <br />
              <span className="cyber-heading">Before They Strike</span>
            </h1>

            <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
              <strong className="text-white">Cyber-Pulse</strong> is a real-time Network Intrusion Detection
              System powered by LSTM + CNN Hybrid ML. Monitor every packet, classify every connection, and stop
              attacks the moment they appear.
            </p>

            {/* Live ticker */}
            <ThreatTicker />

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" className="bg-cyberpulse-purple hover:bg-cyberpulse-purple/90 cyber-btn shadow-lg shadow-cyberpulse-purple/30">
                <Link to="/dashboard">
                  <Activity className="mr-2 h-4 w-4" />
                  Open Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-cyberpulse-purple/50 text-cyberpulse-purple hover:bg-cyberpulse-purple/10 cyber-btn">
                <Link to="/about">
                  Learn How It Works
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Mini trust badges */}
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-gray-500">
              {['LSTM + CNN Hybrid Powered', 'Real-time WebSocket', 'CIC-IDS 2017 Dataset', 'Open Source'].map(b => (
                <span key={b} className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-cyberpulse-purple" />{b}
                </span>
              ))}
            </div>
          </div>

          {/* Right visual */}
          <div className="lg:w-1/2 w-full">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ANIMATED STATS
      ═══════════════════════════════════════ */}
      <section className="py-16 px-4 bg-cyberpulse-darker border-y border-white/5">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { ref: acc.ref,  value: acc.count,  suffix: '%', label: 'Detection Accuracy',  color: 'neon-text-purple', icon: <TrendingUp className="h-5 w-5" /> },
              { ref: rec.ref,  value: rec.count,  suffix: '%', label: 'Intrusion Recall',    color: 'neon-text-red',    icon: <Eye className="h-5 w-5" /> },
              { ref: f1.ref,   value: f1.count,   suffix: '%', label: 'F1-Score',            color: 'neon-text-green',  icon: <CheckCircle className="h-5 w-5" /> },
              { ref: pkts.ref, value: pkts.count, suffix: '',  label: 'Test Samples',        color: 'neon-text-purple', icon: <Database className="h-5 w-5" /> },
            ].map(({ ref, value, suffix, label, color, icon }) => (
              <div ref={ref} key={label} className="cyber-card stat-card p-6 space-y-2">
                <div className={`flex justify-center ${color}`}>{icon}</div>
                <div className={`text-4xl font-extrabold font-mono ${color}`}>
                  {suffix === '%'
                    ? `${Number(value).toFixed(value === Math.floor(value) ? 0 : value < 10 ? 2 : 0)}%`
                    : Math.floor(value).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════ */}
      <section className="py-24 px-4 bg-cyberpulse-dark">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-3">
            <div className="text-cyberpulse-purple text-sm font-semibold tracking-widest uppercase">Capabilities</div>
            <h2 className="text-4xl font-bold cyber-heading">Built for Real-World Threats</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Every component is engineered to detect, classify, and report network intrusions with surgical precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Activity className="h-7 w-7" />,
                color: 'text-cyberpulse-purple',
                bg: 'bg-cyberpulse-purple/10',
                border: 'border-cyberpulse-purple/20',
                title: 'Real-time Packet Capture',
                desc: 'Scapy-powered live sniffing or PCAP replay. Every IP/TCP/UDP packet is inspected within milliseconds.',
              },
              {
                icon: <Cpu className="h-7 w-7" />,
                color: 'text-cyberpulse-blue',
                bg: 'bg-cyberpulse-blue/10',
                border: 'border-cyberpulse-blue/20',
                title: 'LSTM + CNN Hybrid Model',
                desc: 'Trained on 565K+ samples from CIC-IDS 2017. Achieves 96.52% accuracy with embedded feature selection.',
              },
              {
                icon: <Zap className="h-7 w-7" />,
                color: 'text-cyberpulse-orange',
                bg: 'bg-cyberpulse-orange/10',
                border: 'border-cyberpulse-orange/20',
                title: 'Instant WebSocket Alerts',
                desc: 'Classified packets are broadcast via WebSocket in real time. Zero polling delay for the dashboard.',
              },
              {
                icon: <BarChart2 className="h-7 w-7" />,
                color: 'text-cyberpulse-green',
                bg: 'bg-cyberpulse-green/10',
                border: 'border-cyberpulse-green/20',
                title: 'Interactive Dashboard',
                desc: 'Live charts, protocol breakdown, threat timeline, and detailed packet logs — all in one view.',
              },
              {
                icon: <Network className="h-7 w-7" />,
                color: 'text-cyberpulse-blue',
                bg: 'bg-cyberpulse-blue/10',
                border: 'border-cyberpulse-blue/20',
                title: 'Protocol Analysis',
                desc: 'TCP, UDP, and ICMP traffic are dissected and categorised. Port, TTL, window size, and flags extracted.',
              },
              {
                icon: <Lock className="h-7 w-7" />,
                color: 'text-cyberpulse-purple',
                bg: 'bg-cyberpulse-purple/10',
                border: 'border-cyberpulse-purple/20',
                title: 'Binary Classification',
                desc: 'Clean binary output: Normal (0) or Attack (1). High-confidence predictions logged persistently to JSON.',
              },
            ].map((f) => (
              <div key={f.title} className={`cyber-card border-glow p-6 space-y-4 group hover:scale-[1.02] transition-all duration-300 border ${f.border}`}>
                <div className={`${f.bg} p-3 rounded-xl w-fit ${f.color}`}>{f.icon}</div>
                <h3 className="text-lg font-bold">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                <div className={`flex items-center gap-1 text-xs ${f.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Learn more <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section className="py-24 px-4 bg-cyberpulse-darker">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-3">
            <div className="text-cyberpulse-blue text-sm font-semibold tracking-widest uppercase">Architecture</div>
            <h2 className="text-4xl font-bold cyber-heading">How Cyber-Pulse Works</h2>
          </div>

          <div className="max-w-2xl mx-auto">
            <Step num={1} icon={<Network className="h-4 w-4" />}
              title="Packet Capture"
              desc="Scapy sniffs live network traffic or replays a PCAP file. Every IP/TCP/UDP packet is captured and fed into the pipeline." />
            <Step num={2} icon={<Cpu className="h-4 w-4" />}
              title="Feature Extraction"
              desc="9 hand-picked features — IHL, TTL, packet length, source/dest port, window size, TCP flags, protocol — are extracted per packet." />
            <Step num={3} icon={<Shield className="h-4 w-4" />}
              title="ML Inference"
              desc="StandardScaler normalises features, then the LSTM + CNN Hybrid model predicts: Normal (0) or Attack (1) in microseconds." />
            <Step num={4} icon={<Activity className="h-4 w-4" />}
              title="Dashboard & Logging"
              desc="Results are broadcast via WebSocket to the React dashboard and appended to nids_logs.json for persistent audit trails." />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          THREAT TYPES
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4 bg-cyberpulse-dark">
        <div className="container mx-auto">
          <div className="text-center mb-14 space-y-3">
            <div className="text-cyberpulse-red text-sm font-semibold tracking-widest uppercase">Coverage</div>
            <h2 className="text-4xl font-bold">Attack Types Detected</h2>
            <p className="text-gray-400 max-w-lg mx-auto text-sm">
              Trained on CIC-IDS 2017, covering a wide spectrum of real-world intrusion scenarios.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: 'DoS / DDoS', icon: '🌊', severity: 'Critical' },
              { name: 'Brute Force', icon: '🔨', severity: 'High' },
              { name: 'Port Scan', icon: '🔍', severity: 'Medium' },
              { name: 'Web Attacks', icon: '🕸️', severity: 'High' },
              { name: 'Infiltration', icon: '🥷', severity: 'Critical' },
              { name: 'Botnet', icon: '🤖', severity: 'High' },
              { name: 'Heartbleed', icon: '💔', severity: 'Critical' },
              { name: 'FTP Patator', icon: '📁', severity: 'Medium' },
            ].map((t) => (
              <div key={t.name} className="cyber-card p-4 flex items-center gap-3 hover:scale-105 transition-transform duration-200">
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className={`text-xs ${
                    t.severity === 'Critical' ? 'text-red-400' :
                    t.severity === 'High' ? 'text-orange-400' : 'text-yellow-400'
                  }`}>{t.severity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA
      ═══════════════════════════════════════ */}
      <section className="py-24 px-4 bg-cyberpulse-darker relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid-bg opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyberpulse-purple/10 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto text-center relative z-10 space-y-6">
          <AlertTriangle className="h-12 w-12 text-cyberpulse-red mx-auto animate-pulse" />
          <h2 className="text-4xl md:text-5xl font-extrabold">
            Every Second Counts.
            <br />
            <span className="cyber-heading">Defend in Real-Time.</span>
          </h2>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            Start monitoring your network now — zero config needed with PCAP replay mode.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Button asChild size="lg" className="bg-cyberpulse-purple hover:bg-cyberpulse-purple/90 cyber-btn shadow-xl shadow-cyberpulse-purple/30 text-white px-8">
              <Link to="/dashboard">
                <Activity className="mr-2 h-5 w-5" />
                Launch Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/20 text-gray-300 hover:bg-white/5 cyber-btn">
              <Link to="/about">
                View Architecture
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
