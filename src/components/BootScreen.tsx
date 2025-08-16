import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal, Zap, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BootLine {
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  delay: number;
}

const bootSequence: BootLine[] = [
  { text: "NoSynt.io Terminal v1.0.0 (GNU/Linux)", type: 'system', delay: 50 },
  { text: "Copyright (C) 2024 NoSynt Intelligence Platform", type: 'info', delay: 100 },
  { text: "Initializing system...", type: 'info', delay: 150 },
  { text: "[    0.001] Memory: 32GB Available", type: 'success', delay: 200 },
  { text: "[    0.102] Network: eth0 link up", type: 'success', delay: 250 },
  { text: "[    0.234] Security: Enhanced protection enabled", type: 'success', delay: 300 },
  { text: "[    0.456] Loading OSINT modules...", type: 'info', delay: 350 },
  { text: "[    0.678] ├── Discord Intelligence Module", type: 'success', delay: 400 },
  { text: "[    0.890] ├── Email Intelligence Module", type: 'success', delay: 450 },
  { text: "[    1.012] ├── IP Geolocation Module", type: 'success', delay: 500 },
  { text: "[    1.234] ├── Social Media Scanner", type: 'success', delay: 550 },
  { text: "[    1.456] └── Telegram Integration", type: 'success', delay: 600 },
  { text: "[    1.678] Database: PostgreSQL connection established", type: 'success', delay: 650 },
  { text: "[    1.890] Authentication: Supabase ready", type: 'success', delay: 700 },
  { text: "[    2.012] System: All services operational", type: 'success', delay: 750 },
  { text: "", type: 'info', delay: 800 },
  { text: "NoSynt.io Terminal ready.", type: 'system', delay: 850 },
  { text: "", type: 'info', delay: 900 }
];

interface BootScreenProps {
  onBootComplete: () => void;
}

export function BootScreen({ onBootComplete }: BootScreenProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<BootLine[]>([]);
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentLine < bootSequence.length) {
      const timer = setTimeout(() => {
        setDisplayedLines(prev => [...prev, bootSequence[currentLine]]);
        setCurrentLine(prev => prev + 1);
      }, bootSequence[currentLine].delay);

      return () => clearTimeout(timer);
    } else if (!isComplete) {
      setTimeout(() => {
        setIsComplete(true);
      }, 300);
    }
  }, [currentLine, isComplete]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorTimer);
  }, []);

  const getLineIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-400 inline mr-2" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-yellow-400 inline mr-2" />;
      case 'error':
        return <AlertTriangle className="h-3 w-3 text-red-400 inline mr-2" />;
      case 'system':
        return <Terminal className="h-3 w-3 text-green-400 inline mr-2" />;
      default:
        return null;
    }
  };

  const getLineColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      case 'system':
        return 'text-green-400';
      default:
        return 'text-green-300';
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono text-sm relative overflow-hidden">
      {/* Imgur Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: "url('https://i.imgur.com/9XRCUPu.gif')"
        }}
      ></div>

      {/* Terminal Screen */}
      <div className="p-6 max-w-4xl mx-auto relative z-20">

        <div className="space-y-1">
          {displayedLines.map((line, index) => (
            <div 
              key={index} 
              className={`font-mono ${getLineColor(line.type)} flex items-start`}
            >
              {getLineIcon(line.type)}
              <span className="terminal-text">{line.text}</span>
            </div>
          ))}
          
          {/* Terminal Cursor */}
          <div className="flex items-center">
            <span className="text-green-400">root@nosynt:~# </span>
            <span className={`ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity text-green-400`}>
              █
            </span>
          </div>
        </div>

        {/* Boot Complete Actions */}
        {isComplete && (
          <div className="mt-8 space-y-4 animate-fade-in">
            <div className="border border-green-400/30 bg-black/80 p-4 rounded backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-3">
                <Terminal className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-bold">SYSTEM READY</span>
              </div>
              <p className="text-green-300/70 text-xs mb-4">
                All NoSynt.io modules loaded successfully. Ready to execute intelligence gathering operations.
              </p>
              <div className="flex space-x-3">
                <Button 
                  onClick={onBootComplete}
                  className="bg-green-400 text-black hover:bg-green-300 font-mono text-xs"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  ENTER SYSTEM
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-green-400/30 text-green-400 hover:bg-green-400/10 font-mono text-xs bg-transparent"
                  onClick={() => window.location.reload()}
                >
                  <Loader2 className="h-3 w-3 mr-1" />
                  REBOOT
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Matrix Rain Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-10">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute text-green-400 text-xs font-mono animate-pulse"
            style={{
              left: `${(i * 3.33) % 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.1}s`,
            }}
          >
            {Math.random() > 0.5 ? '1' : '0'}
          </div>
        ))}
      </div>
    </div>
  );
}