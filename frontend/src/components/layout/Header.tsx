
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { Menu, X, Shield, Wifi, WifiOff } from 'lucide-react';

/* ── Real-time WS connection indicator in the header ── */
const LiveStatusBadge = () => {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        ws = new WebSocket('ws://localhost:8765');
        ws.onopen  = () => setOnline(true);
        ws.onclose = () => { setOnline(false); retryTimer = setTimeout(connect, 6000); };
        ws.onerror = () => { setOnline(false); ws?.close(); };
      } catch { setOnline(false); }
    };
    connect();
    return () => { clearTimeout(retryTimer); ws?.close(); };
  }, []);

  return (
    <span className={`hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border
      ${online ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-gray-600/30 bg-gray-800/40 text-gray-500'}`}>
      {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {online ? 'NIDS Online' : 'Offline'}
      {online && <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />}
    </span>
  );
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'About', path: '/about' },
    { name: 'Feedback', path: '/feedback' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cyberpulse-darker/80 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4 py-3.5 flex justify-between items-center">
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`text-sm font-medium transition-colors relative group ${
                location.pathname === item.path
                  ? 'text-cyberpulse-purple'
                  : 'text-gray-300 hover:text-cyberpulse-purple'
              }`}
            >
              {item.name}
              {location.pathname === item.path && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyberpulse-purple rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right side: live status + mobile toggle */}
        <div className="flex items-center gap-3">
          <LiveStatusBadge />
          <Link to="/dashboard"
            className="hidden md:flex items-center gap-1.5 text-xs bg-cyberpulse-purple/15 border border-cyberpulse-purple/30 text-cyberpulse-purple px-3 py-1.5 rounded-full hover:bg-cyberpulse-purple/25 transition-colors">
            <Shield className="h-3.5 w-3.5" />
            Monitor
          </Link>
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cyberpulse-darker border-t border-white/10">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-cyberpulse-purple'
                    : 'text-gray-300 hover:text-cyberpulse-purple'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
