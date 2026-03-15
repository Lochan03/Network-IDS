import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  AlertTriangle, ShieldCheck, Activity, Settings,
  ChevronDown, ChevronUp, Calendar, Wifi, WifiOff,
  Filter, Download, RefreshCw, Bell, BellOff, TrendingUp,
  TrendingDown, Minus, Eye, EyeOff, Zap, Globe, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

interface PacketLog {
  id: string;
  timestamp: string;
  src_ip: string;
  dst_ip: string;
  protocol: string;
  prediction: number;
  label: string;
  packet_length: string;
  ttl: string;
}

/* ── Circular threat gauge ── */
const ThreatGauge = ({ pct }: { pct: number }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = circ - (pct / 100) * circ;
  const color = pct > 50 ? '#ea384c' : pct > 20 ? '#F97316' : '#10B981';
  const label = pct > 50 ? 'HIGH' : pct > 20 ? 'MEDIUM' : 'LOW';
  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#2d2d3a" strokeWidth="12" />
        <circle
          cx="72" cy="72" r={r} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={`${circ}`}
          strokeDashoffset={dash}
          strokeLinecap="round"
          transform="rotate(-90 72 72)"
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-extrabold font-mono" style={{ color }}>{Math.round(pct)}%</div>
        <div className="text-xs text-gray-400 mt-0.5">{label}</div>
      </div>
    </div>
  );
};

/* ── Connection status pill ── */
const ConnBadge = ({ connected }: { connected: boolean }) => (
  <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium ${connected ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
    {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
    {connected ? 'Connected' : 'Disconnected'}
    {connected && <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />}
  </span>
);

/* ── Mini sparkline bar (used in stat cards) ── */
const TrendIcon = ({ val }: { val: number }) =>
  val > 0 ? <TrendingUp className="h-3 w-3 text-red-400" />
  : val < 0 ? <TrendingDown className="h-3 w-3 text-green-400" />
  : <Minus className="h-3 w-3 text-gray-500" />;

const PROTO_COLORS: Record<string, string> = {
  TCP: '#9b87f5', UDP: '#0EA5E9', ICMP: '#F97316', Other: '#888'
};
const PIE_COLORS = ['#10B981', '#ea384c'];

/* ── Scrolling attack alert feed ── */
const AlertFeed = ({ logs }: { logs: PacketLog[] }) => {
  const attacks = logs.filter(l => l.prediction === 1).slice(0, 8);
  if (attacks.length === 0)
    return <p className="text-xs text-gray-500 text-center py-4">No attacks detected yet.</p>;
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {attacks.map((a, i) => (
        <div key={`${a.id}-${i}`} className="flex items-start gap-3 bg-red-500/8 border border-red-500/20 rounded-lg p-2.5 animate-fade-in">
          <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5 min-w-0">
            <div className="font-mono text-red-300 truncate">{a.src_ip} → {a.dst_ip}</div>
            <div className="text-gray-500 flex gap-2">
              <span>Proto {a.protocol}</span>
              <span>·</span>
              <span>Len {a.packet_length}</span>
              <span>·</span>
              <span>{a.timestamp}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── Custom tooltip ── */
const CyberTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1f2c] border border-cyberpulse-purple/30 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.dataKey}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const { toast } = useToast();
  const [showLogs, setShowLogs]                   = useState(true);
  const [showOnlyIntrusions, setShowOnlyIntrusions] = useState(false);
  const [refreshInterval, setRefreshInterval]     = useState(3);
  const [activeTab, setActiveTab]                 = useState('overview');
  const [packetLogs, setPacketLogs]               = useState<PacketLog[]>([]);
  const [showAllLogs, setShowAllLogs]             = useState(false);
  const [normalPackets, setNormalPackets]         = useState(0);
  const [intrusionPackets, setIntrusionPackets]   = useState(0);
  const [trafficData, setTrafficData]             = useState<Array<{timestamp:string;normal:number;intrusion:number}>>([]);
  const [protocolData, setProtocolData]           = useState<Array<{name:string;value:number}>>([]);
  const [connected, setConnected]                 = useState(false);
  const [notificationsOn, setNotificationsOn]     = useState(true);
  const [filterProtocol, setFilterProtocol]       = useState<string>('all');
  const [lastEvent, setLastEvent]                 = useState<string>('—');
  const ws = useRef<WebSocket | null>(null);

  const threatPct = normalPackets + intrusionPackets === 0
    ? 0
    : Math.round((intrusionPackets / (normalPackets + intrusionPackets)) * 100);

  const piData = [
    { name: 'Normal', value: normalPackets },
    { name: 'Attack', value: intrusionPackets },
  ];

  const handlePacket = useCallback((packet: PacketLog) => {
    setPacketLogs(prev => [packet, ...prev].slice(0, 200));
    setLastEvent(packet.timestamp);

    if (packet.prediction === 0) setNormalPackets(p => p + 1);
    else {
      setIntrusionPackets(p => p + 1);
      if (notificationsOn) {
        toast({
          title: '🚨 Intrusion Detected',
          description: `${packet.src_ip} → ${packet.dst_ip} | Proto ${packet.protocol}`,
          variant: 'destructive',
        });
      }
    }

    setTrafficData(prev => {
      const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const copy = [...prev];
      if (copy.length && copy[copy.length - 1].timestamp === now) {
        const last = { ...copy[copy.length - 1] };
        if (packet.prediction === 0) last.normal += 1; else last.intrusion += 1;
        copy[copy.length - 1] = last;
      } else {
        copy.push({ timestamp: now, normal: packet.prediction === 0 ? 1 : 0, intrusion: packet.prediction === 1 ? 1 : 0 });
      }
      return copy.slice(-20);
    });

    setProtocolData(prev => {
      const proto = packet.protocol === '6' ? 'TCP' : packet.protocol === '17' ? 'UDP' : packet.protocol === '1' ? 'ICMP' : 'Other';
      const copy = [...prev];
      const idx = copy.findIndex(x => x.name === proto);
      if (idx !== -1) copy[idx] = { ...copy[idx], value: copy[idx].value + 1 };
      else copy.push({ name: proto, value: 1 });
      return copy;
    });
  }, [notificationsOn, toast]);

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket('ws://localhost:8765');
      ws.current.onopen  = () => setConnected(true);
      ws.current.onclose = () => { setConnected(false); setTimeout(connect, 5000); };
      ws.current.onerror = () => setConnected(false);
      ws.current.onmessage = (e) => { try { handlePacket(JSON.parse(e.data)); } catch {} };
    };
    connect();
    return () => ws.current?.close();
  }, [handlePacket]);

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(packetLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'nids-logs.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = packetLogs
    .filter(l => !showOnlyIntrusions || l.prediction === 1)
    .filter(l => filterProtocol === 'all' || (
      filterProtocol === 'TCP' ? l.protocol === '6' :
      filterProtocol === 'UDP' ? l.protocol === '17' :
      filterProtocol === 'ICMP' ? l.protocol === '1' : true
    ));

  const protoLabel = (p: string) => p === '6' ? 'TCP' : p === '17' ? 'UDP' : p === '1' ? 'ICMP' : `#${p}`;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Activity className="h-7 w-7 text-cyberpulse-purple" />
            Network Traffic Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">Real-time monitoring &amp; ML-powered intrusion detection</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ConnBadge connected={connected} />
          <Button variant="outline" size="sm" onClick={() => setNotificationsOn(n => !n)} title="Toggle alerts">
            {notificationsOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={exportLogs} title="Export logs">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">{new Date().toLocaleDateString()}</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-sm">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* ══════════════════════════════
            OVERVIEW TAB
        ══════════════════════════════ */}
        <TabsContent value="overview" className="space-y-6">

          {/* ── Top stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Normal Packets', value: normalPackets.toLocaleString(), icon: <ShieldCheck className="h-5 w-5 text-green-400" />, color: 'border-green-800/30', trend: 0 },
              { title: 'Intrusions',     value: intrusionPackets.toLocaleString(), icon: <AlertTriangle className="h-5 w-5 text-red-400" />, color: 'border-red-800/30', trend: intrusionPackets },
              { title: 'Total Packets',  value: (normalPackets + intrusionPackets).toLocaleString(), icon: <Activity className="h-5 w-5 text-blue-400" />, color: 'border-blue-800/30', trend: 0 },
              { title: 'Last Event',     value: lastEvent, icon: <Clock className="h-5 w-5 text-purple-400" />, color: 'border-purple-800/30', trend: 0 },
            ].map((s) => (
              <Card key={s.title} className={`bg-cyberpulse-darker stat-card border ${s.color}`}>
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="text-xs font-medium text-gray-400 flex items-center justify-between">
                    {s.title}
                    {s.icon}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-2xl font-bold font-mono">{s.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Threat gauge + pie + alert feed ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gauge */}
            <Card className="bg-cyberpulse-darker border-cyberpulse-purple/20 flex flex-col items-center justify-center py-6">
              <CardHeader className="pb-2 text-center">
                <CardTitle className="text-sm text-gray-400">Threat Level</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-2">
                <ThreatGauge pct={threatPct} />
                <p className="text-xs text-gray-500">% of traffic classified as attacks</p>
              </CardContent>
            </Card>

            {/* Pie */}
            <Card className="bg-cyberpulse-darker border-cyberpulse-purple/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Traffic Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={piData} cx="50%" cy="50%" innerRadius={45} outerRadius={68}
                         dataKey="value" paddingAngle={3}>
                      {piData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx]} />)}
                    </Pie>
                    <Tooltip content={<CyberTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Alert feed */}
            <Card className="bg-cyberpulse-darker border-red-800/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-red-400" /> Live Attack Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlertFeed logs={packetLogs} />
              </CardContent>
            </Card>
          </div>

          {/* ── Area chart ── */}
          <Card className="bg-cyberpulse-darker border-cyberpulse-purple/20">
            <CardHeader>
              <CardTitle>Traffic Timeline</CardTitle>
              <CardDescription>Normal vs. intrusion packets over time</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {trafficData.length === 0
                ? <div className="flex items-center justify-center h-full text-gray-600 text-sm">Waiting for packets…</div>
                : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient id="gNormal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gAttack" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ea384c" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#ea384c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                    <XAxis dataKey="timestamp" stroke="#555" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#555" tick={{ fontSize: 10 }} />
                    <Tooltip content={<CyberTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="normal"    stroke="#10B981" fill="url(#gNormal)" strokeWidth={2} />
                    <Area type="monotone" dataKey="intrusion" stroke="#ea384c" fill="url(#gAttack)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* ── Protocol bar chart ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-cyberpulse-darker border-cyberpulse-purple/20">
              <CardHeader>
                <CardTitle>Protocol Distribution</CardTitle>
                <CardDescription>Traffic breakdown by protocol</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {protocolData.length === 0
                  ? <div className="flex items-center justify-center h-full text-gray-600 text-sm">No data yet…</div>
                  : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={protocolData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                      <XAxis dataKey="name" stroke="#555" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#555" tick={{ fontSize: 11 }} />
                      <Tooltip content={<CyberTooltip />} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {protocolData.map((d) => (
                          <Cell key={d.name} fill={PROTO_COLORS[d.name] ?? '#888'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* ── Top source IPs ── */}
            <Card className="bg-cyberpulse-darker border-cyberpulse-purple/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Globe className="h-4 w-4 text-cyberpulse-blue" /> Top Source IPs</CardTitle>
                <CardDescription>Most active sources</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const counts: Record<string, number> = {};
                  packetLogs.forEach(l => { counts[l.src_ip] = (counts[l.src_ip] ?? 0) + 1; });
                  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
                  const max = sorted[0]?.[1] ?? 1;
                  if (sorted.length === 0) return <p className="text-xs text-gray-500 text-center py-8">No data yet…</p>;
                  return (
                    <div className="space-y-3 mt-1">
                      {sorted.map(([ip, cnt]) => (
                        <div key={ip} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-mono text-gray-300 truncate max-w-[70%]">{ip}</span>
                            <span className="text-gray-500">{cnt}</span>
                          </div>
                          <div className="h-1.5 bg-black/40 rounded-full">
                            <div className="h-1.5 bg-cyberpulse-purple rounded-full" style={{ width: `${(cnt / max) * 100}%`, transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ══════════════════════════════
            LOGS TAB
        ══════════════════════════════ */}
        <TabsContent value="logs">
          <Card className="bg-cyberpulse-darker border-cyberpulse-purple/20">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle>Packet Logs</CardTitle>
                <CardDescription>{filteredLogs.length} entries (total captured: {packetLogs.length})</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Protocol filter */}
                <div className="flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5 text-gray-400" />
                  {['all', 'TCP', 'UDP', 'ICMP'].map(p => (
                    <button key={p} onClick={() => setFilterProtocol(p)}
                      className={`text-xs px-2 py-1 rounded ${filterProtocol === p ? 'bg-cyberpulse-purple text-white' : 'text-gray-400 hover:text-white'}`}>
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
                {/* Intrusion only toggle */}
                <button onClick={() => setShowOnlyIntrusions(s => !s)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${showOnlyIntrusions ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-gray-600 text-gray-400'}`}>
                  {showOnlyIntrusions ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  Attacks only
                </button>
                {/* Show more/less */}
                {filteredLogs.length > 20 && (
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowAllLogs(s => !s)}>
                    {showAllLogs ? 'Show Less' : `+${filteredLogs.length - 20} more`}
                  </Button>
                )}
                {/* Collapse */}
                <Button variant="outline" size="icon" onClick={() => setShowLogs(!showLogs)}>
                  {showLogs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {showLogs && (
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-700/50 text-gray-500 uppercase tracking-wider">
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Timestamp</th>
                        <th className="text-left py-3 px-4">Source</th>
                        <th className="text-left py-3 px-4">Destination</th>
                        <th className="text-left py-3 px-4">Protocol</th>
                        <th className="text-left py-3 px-4">Length</th>
                        <th className="text-left py-3 px-4">TTL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.length === 0 && (
                        <tr><td colSpan={7} className="py-10 text-center text-gray-600">No packets yet — start the backend to see live data.</td></tr>
                      )}
                      {(showAllLogs ? filteredLogs : filteredLogs.slice(0, 20)).map((log, i) => (
                        <tr key={`${log.id}-${i}`}
                          className={`border-b border-gray-800/40 hover:bg-white/3 transition-colors ${log.prediction === 1 ? 'log-row-attack' : 'log-row-normal'}`}>
                          <td className="py-2.5 px-4">
                            <Badge variant={log.prediction === 0 ? 'outline' : 'destructive'}
                              className={`text-[10px] px-1.5 ${log.prediction === 0 ? 'border-green-500/40 text-green-400' : ''}`}>
                              {log.prediction === 0 ? 'Normal' : 'ATTACK'}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-4 font-mono text-gray-400">{log.timestamp}</td>
                          <td className="py-2.5 px-4 font-mono">{log.src_ip}</td>
                          <td className="py-2.5 px-4 font-mono text-gray-400">{log.dst_ip}</td>
                          <td className="py-2.5 px-4">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                              style={{ background: `${PROTO_COLORS[protoLabel(log.protocol)]}22`, color: PROTO_COLORS[protoLabel(log.protocol)] }}>
                              {protoLabel(log.protocol)}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono text-gray-400">{log.packet_length}</td>
                          <td className="py-2.5 px-4 font-mono text-gray-400">{log.ttl}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredLogs.length > 20 && !showAllLogs && (
                  <p className="text-center text-xs text-gray-500 py-3">Showing 20 of {filteredLogs.length}</p>
                )}
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* ══════════════════════════════
            SETTINGS TAB
        ══════════════════════════════ */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-cyberpulse-darker border-cyberpulse-purple/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Settings className="h-4 w-4" /> Dashboard Settings</CardTitle>
              <CardDescription>Configure your monitoring preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Intrusion Alerts</Label>
                  <p className="text-xs text-gray-400 mt-0.5">Show toast notifications when an attack is detected</p>
                </div>
                <Switch checked={notificationsOn} onCheckedChange={setNotificationsOn} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Attacks Only View</Label>
                  <p className="text-xs text-gray-400 mt-0.5">Filter the log table to show only intrusion events</p>
                </div>
                <Switch checked={showOnlyIntrusions} onCheckedChange={setShowOnlyIntrusions} />
              </div>
              <div className="space-y-3">
                <Label>Refresh Interval: <span className="text-cyberpulse-purple">{refreshInterval}s</span></Label>
                <Slider min={1} max={10} step={1} value={[refreshInterval]} onValueChange={v => setRefreshInterval(v[0])} />
              </div>
              <div className="pt-2 border-t border-gray-800 space-y-2">
                <Label>System Info</Label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { k: 'WebSocket URL', v: 'ws://localhost:8765' },
                    { k: 'Model',         v: 'XGBoost (nids_xgboost_model3.pkl)' },
                    { k: 'Scaler',        v: 'StandardScaler' },
                    { k: 'Features',      v: '9 extracted features' },
                    { k: 'Status',        v: connected ? '🟢 Online' : '🔴 Offline' },
                    { k: 'Total Packets', v: (normalPackets + intrusionPackets).toLocaleString() },
                  ].map(({ k, v }) => (
                    <div key={k} className="bg-black/30 rounded-lg p-3">
                      <div className="text-gray-500">{k}</div>
                      <div className="text-gray-200 font-mono mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
