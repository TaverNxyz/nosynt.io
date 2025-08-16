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
  { text: "OSINT Terminal v3.14.159 (GNU/Linux)", type: 'system', delay: 50 },
  { text: "Copyright (C) 2024 OSINT Security Platform", type: 'info', delay: 100 },
  { text: "Initializing system...", type: 'info', delay: 150 },
  { text: "[    0.001] Memory: 32GB Available", type: 'success', delay: 200 },
  { text: "[    0.102] Network: eth0 link up", type: 'success', delay: 250 },
  { text: "[    0.234] Security: Enhanced protection enabled", type: 'success', delay: 300 },
  { text: "[    0.456] Loading OSINT modules...", type: 'info', delay: 350 },
  { text: "[    0.678] ├── Discord Intelligence Module", type: 'success', delay: 400 },
  { text: "[    0.890] ├── Email Intelligence Module", type: 'success', delay: 450 },
  { text: "[    1.012] ├── IP Geolocation Module", type: 'success', delay: 500 },
  { text: "[    1.234] └── Social Media Scanner", type: 'success', delay: 550 },
  { text: "[    1.456] Database: PostgreSQL connection established", type: 'success', delay: 600 },
  { text: "[    1.678] Authentication: Supabase ready", type: 'success', delay: 650 },
  { text: "[    1.890] System: All services operational", type: 'success', delay: 700 },
  { text: "", type: 'info', delay: 750 },
  { text: "OSINT Terminal ready.", type: 'system', delay: 800 },
  { text: "", type: 'info', delay: 850 }
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
        return <CheckCircle className="h-3 w-3 text-terminal-green inline mr-2" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-terminal-amber inline mr-2" />;
      case 'error':
        return <AlertTriangle className="h-3 w-3 text-terminal-red inline mr-2" />;
      case 'system':
        return <Terminal className="h-3 w-3 text-terminal-cyan inline mr-2" />;
      default:
        return null;
    }
  };

  const getLineColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-terminal-green';
      case 'warning':
        return 'text-terminal-amber';
      case 'error':
        return 'text-terminal-red';
      case 'system':
        return 'text-terminal-cyan';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background font-mono text-sm relative overflow-hidden">
      {/* Scanlines Effect */}
      <div className="scanlines absolute inset-0 z-10 pointer-events-none" />
      
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
          
          {/* Cursor */}
          <div className="flex items-center">
            <span className="text-terminal-green">root@osint:~# </span>
            <span className={`ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
              █
            </span>
          </div>
        </div>

        {/* Boot Complete Actions */}
        {isComplete && (
          <div className="mt-8 space-y-4 animate-fade-in">
            <div className="border border-terminal-green/30 bg-card/50 p-4 rounded">
              <div className="flex items-center space-x-3 mb-3">
                <Terminal className="h-5 w-5 text-terminal-green" />
                <span className="text-terminal-green font-bold">SYSTEM READY</span>
              </div>
              <p className="text-muted-foreground text-xs mb-4">
                All OSINT modules loaded successfully. Ready to execute intelligence gathering operations.
              </p>
              <div className="flex space-x-3">
                <Button 
                  onClick={onBootComplete}
                  className="bg-terminal-green text-black hover:bg-terminal-green/80 font-mono text-xs"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  ENTER SYSTEM
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-terminal-green/30 text-terminal-green hover:bg-terminal-green/10 font-mono text-xs"
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

      {/* Matrix Rain Effect (Subtle) */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-terminal-green text-xs font-mono animate-matrix-rain"
            style={{
              left: `${i * 5}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${3 + (i % 3)}s`
            }}
          >
            {Math.random() > 0.5 ? '1' : '0'}
          </div>
        ))}
      </div>
    </div>
  );
}