import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, Database, Network, BarChart2, Cpu, Zap, Code2, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/* ── Metric progress row ── */
const MetricRow = ({ label, value, pct, color = '#9b87f5' }: { label: string; value: string; pct: number; color?: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-gray-300">{label}</span>
      <span className="font-semibold" style={{ color }}>{value}</span>
    </div>
    <div className="h-2 bg-black/40 rounded-full overflow-hidden">
      <div className="h-2 rounded-full transition-all duration-1000"
        style={{ width: `${pct}%`, background: color }} />
    </div>
  </div>
);

/* ── Timeline step ── */
const TimelineStep = ({
  step, title, desc, icon, last = false
}: { step: string; title: string; desc: string; icon: React.ReactNode; last?: boolean }) => (
  <div className="flex gap-5">
    <div className="flex flex-col items-center">
      <div className="h-10 w-10 rounded-full bg-cyberpulse-purple/15 border border-cyberpulse-purple/40 flex items-center justify-center text-cyberpulse-purple flex-shrink-0">
        {icon}
      </div>
      {!last && <div className="w-px flex-1 bg-gradient-to-b from-cyberpulse-purple/40 to-transparent mt-1" />}
    </div>
    <div className="pb-8">
      <div className="text-xs text-cyberpulse-purple font-semibold uppercase tracking-wider mb-0.5">{step}</div>
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </div>
  </div>
);

/* ── Tech badge ── */
const TechBadge = ({ name, version, color }: { name: string; version: string; color: string }) => (
  <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-lg px-3 py-2">
    <div className="h-2 w-2 rounded-full" style={{ background: color }} />
    <span className="text-sm font-medium">{name}</span>
    <span className="text-xs text-gray-500 ml-auto">{version}</span>
  </div>
);

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12 space-y-20">

      {/* ── Hero ── */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="text-cyberpulse-purple text-sm font-semibold tracking-widest uppercase">About the Project</div>
        <h1 className="text-5xl font-extrabold">
          How <span className="cyber-heading">Cyber-Pulse</span> Works
        </h1>
        <p className="text-lg text-gray-400 leading-relaxed">
          An end-to-end Network Intrusion Detection System — from raw packets to real-time ML inference
          to an interactive web dashboard.
        </p>
      </div>

      {/* ── What & Why ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            icon: <Shield className="h-6 w-6 text-cyberpulse-purple" />,
            bg: 'bg-cyberpulse-purple/10', border: 'border-cyberpulse-purple/20',
            title: 'The Problem',
            body: 'Traditional signature-based IDS miss novel attack patterns. Cyber-Pulse uses machine learning to detect zero-day-like anomalies by learning from the statistical characteristics of network traffic rather than fixed rules.',
          },
          {
            icon: <Cpu className="h-6 w-6 text-cyberpulse-blue" />,
            bg: 'bg-cyberpulse-blue/10', border: 'border-cyberpulse-blue/20',
            title: 'The Solution',
            body: 'An XGBoost model trained on 565K+ labelled samples from CIC-IDS 2017 classifies each packet in real-time. Scapy captures live traffic; WebSocket delivers results instantly to the React dashboard.',
          },
        ].map(({ icon, bg, border, title, body }) => (
          <Card key={title} className={`bg-cyberpulse-darker border ${border} hover:scale-[1.02] transition-transform`}>
            <CardHeader className="pb-3">
              <div className={`h-11 w-11 rounded-xl ${bg} flex items-center justify-center mb-2`}>{icon}</div>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed text-sm">{body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Model development timeline ── */}
      <section>
        <div className="text-center mb-12 space-y-2">
          <div className="text-cyberpulse-blue text-sm font-semibold tracking-widest uppercase">Development</div>
          <h2 className="text-3xl font-bold cyber-heading">Model Development Pipeline</h2>
        </div>
        <div className="max-w-2xl mx-auto">
          <TimelineStep step="Step 01" icon={<Database className="h-5 w-5" />}
            title="Dataset — CIC-IDS 2017"
            desc="CICIDS 2017 contains 2.8M+ labelled network flows covering 15 attack types including DoS, DDoS, Brute Force, Web Attacks, Botnet, and Infiltration." />
          <TimelineStep step="Step 02" icon={<GitBranch className="h-5 w-5" />}
            title="Feature Selection"
            desc="Compared Filter, Wrapper (RFE), and Embedded (XGBoost importance) methods. Final 9 features selected: IP_IHL, IP_TTL, IP_Len, IP_Frag, Proto, Src_Port, Dst_Port, Window, Flags, Pkt_Len." />
          <TimelineStep step="Step 03" icon={<Cpu className="h-5 w-5" />}
            title="Model Comparison"
            desc="Evaluated XGBoost, Random Forest, and SVM. XGBoost outperformed with 96.52% overall accuracy, near-perfect intrusion recall, and best generalisation." />
          <TimelineStep step="Step 04" icon={<Zap className="h-5 w-5" />}
            title="Real-time Deployment"
            desc="Model serialised with Joblib. Scapy extracts features per-packet, StandardScaler normalises, XGBoost predicts. Results broadcast via asyncio WebSocket to the React frontend." last />
        </div>
      </section>

      {/* ── Performance metrics ── */}
      <section>
        <div className="text-center mb-10 space-y-2">
          <div className="text-cyberpulse-green text-sm font-semibold tracking-widest uppercase">Results</div>
          <h2 className="text-3xl font-bold cyber-heading">Model Performance</h2>
          <p className="text-gray-400 text-sm">Evaluated on 565,576 held-out test samples (454,089 normal · 111,487 intrusion)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall */}
          <Card className="bg-cyberpulse-darker border-cyberpulse-purple/20">
            <CardHeader><CardTitle>Overall Accuracy</CardTitle></CardHeader>
            <CardContent>
              <div className="text-5xl font-extrabold neon-text-purple mb-4">96.52%</div>
              <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                <div className="h-3 rounded-full bg-gradient-to-r from-cyberpulse-purple to-cyberpulse-blue" style={{ width: '96.52%' }} />
              </div>
            </CardContent>
          </Card>

          {/* Confusion matrix summary */}
          <Card className="bg-cyberpulse-darker border-cyberpulse-purple/20">
            <CardHeader><CardTitle>Key Metrics at a Glance</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                { label: 'Accuracy', val: '96.52%', color: '#9b87f5' },
                { label: 'Intrusion Recall', val: '99%', color: '#ea384c' },
                { label: 'Normal Precision', val: '100%', color: '#10B981' },
                { label: 'F1-Score', val: '97%', color: '#0EA5E9' },
              ].map(({ label, val, color }) => (
                <div key={label} className="bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold font-mono" style={{ color }}>{val}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Normal class */}
          <Card className="bg-cyberpulse-darker border-green-800/30">
            <CardHeader><CardTitle className="text-green-400">Normal Traffic (Class 0)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <MetricRow label="Precision" value="100%" pct={100} color="#10B981" />
              <MetricRow label="Recall"    value="96%"  pct={96}  color="#10B981" />
              <MetricRow label="F1-Score"  value="98%"  pct={98}  color="#10B981" />
            </CardContent>
          </Card>

          {/* Attack class */}
          <Card className="bg-cyberpulse-darker border-red-800/30">
            <CardHeader><CardTitle className="text-red-400">Intrusion Traffic (Class 1)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <MetricRow label="Precision" value="86%" pct={86} color="#ea384c" />
              <MetricRow label="Recall"    value="99%" pct={99} color="#ea384c" />
              <MetricRow label="F1-Score"  value="92%" pct={92} color="#ea384c" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Tech stack ── */}
      <section>
        <div className="text-center mb-10 space-y-2">
          <div className="text-cyberpulse-orange text-sm font-semibold tracking-widest uppercase">Stack</div>
          <h2 className="text-3xl font-bold cyber-heading">Technology Stack</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-cyberpulse-darker border-cyberpulse-purple/20">
            <CardHeader><CardTitle className="flex items-center gap-2"><Code2 className="h-5 w-5 text-cyberpulse-purple" />Backend</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              {[
                { name: 'Python',      version: '3.8+',    color: '#3b82f6' },
                { name: 'XGBoost',     version: 'ML Model', color: '#f59e0b' },
                { name: 'Scapy',       version: '2.5.0',   color: '#10B981' },
                { name: 'scikit-learn',version: '1.4.0',   color: '#ea384c' },
                { name: 'websockets',  version: '12.0',    color: '#9b87f5' },
                { name: 'NumPy',       version: '1.26.4',  color: '#0EA5E9' },
                { name: 'Joblib',      version: '1.3.2',   color: '#F97316' },
              ].map(t => <TechBadge key={t.name} {...t} />)}
            </CardContent>
          </Card>

          <Card className="bg-cyberpulse-darker border-cyberpulse-blue/20">
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5 text-cyberpulse-blue" />Frontend</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              {[
                { name: 'React',          version: '18.3',     color: '#61dafb' },
                { name: 'TypeScript',     version: '5.5',      color: '#3178c6' },
                { name: 'Vite',           version: '5.4',      color: '#646cff' },
                { name: 'Tailwind CSS',   version: '3.4',      color: '#38bdf8' },
                { name: 'shadcn/ui',      version: 'Radix UI', color: '#9b87f5' },
                { name: 'Recharts',       version: '2.12',     color: '#22c55e' },
                { name: 'React Router',   version: '6.26',     color: '#f43f5e' },
              ].map(t => <TechBadge key={t.name} {...t} />)}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── System requirements ── */}
      <section>
        <div className="text-center mb-10 space-y-2">
          <div className="text-gray-500 text-sm font-semibold tracking-widest uppercase">Requirements</div>
          <h2 className="text-3xl font-bold">System Requirements</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Cpu className="h-6 w-6 text-cyberpulse-blue" />,
              title: 'Hardware', border: 'border-cyberpulse-blue/20',
              items: ['4 GB RAM minimum', 'Any modern CPU', 'macOS / Linux recommended', 'Admin/sudo for live sniffing'],
            },
            {
              icon: <Code2 className="h-6 w-6 text-cyberpulse-purple" />,
              title: 'Software', border: 'border-cyberpulse-purple/20',
              items: ['Python 3.8+', 'Node.js 18+', 'pip & npm', 'Modern browser (Chrome/Firefox)'],
            },
            {
              icon: <Network className="h-6 w-6 text-cyberpulse-green" />,
              title: 'Network', border: 'border-cyberpulse-green/20',
              items: ['Local network access', 'Port 8765 (WebSocket)', 'Port 8080 (Frontend dev)', 'PCAP file for offline mode'],
            },
          ].map(({ icon, title, border, items }) => (
            <Card key={title} className={`bg-cyberpulse-darker border ${border} hover:scale-[1.02] transition-transform`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">{icon}<CardTitle className="text-base">{title}</CardTitle></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {items.map(i => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyberpulse-purple flex-shrink-0" />{i}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Ready to see it in action?</h2>
        <div className="flex justify-center gap-3 flex-wrap">
          <Button asChild size="lg" className="bg-cyberpulse-purple hover:bg-cyberpulse-purple/90">
            <Link to="/dashboard">Open Dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-white/5">
            <Link to="/feedback">Leave Feedback</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;
