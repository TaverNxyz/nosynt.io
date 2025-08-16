import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommandPalette } from "@/components/CommandPalette";
import { BootScreen } from "@/components/BootScreen";
import { 
  Shield, 
  Key, 
  Database, 
  Layers, 
  Lock, 
  Calculator,
  Activity,
  LogOut,
  User,
  Terminal,
  BarChart3,
  Search,
  Crown
} from "lucide-react";

const navigation = [
  { name: "terminal", href: "/", icon: Activity, badge: "live" },
  { name: "commands", href: "/commands", icon: Terminal, badge: "25+" },
  { name: "analytics", href: "/analytics", icon: BarChart3, badge: "8" },
  { name: "api-keys", href: "/api-keys", icon: Key, badge: null },
  { name: "providers", href: "/providers", icon: Database, badge: "6/6" },
  { name: "implementation", href: "/implementation", icon: Layers, badge: "75%" },
  { name: "security", href: "/security", icon: Lock, badge: "soc2" },
  { name: "subscriptions", href: "/subscriptions", icon: Crown, badge: "free" },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showBootScreen, setShowBootScreen] = useState(true);
  const [bootComplete, setBootComplete] = useState(false);

  // Show boot screen on first load
  useEffect(() => {
    const hasSeenBoot = sessionStorage.getItem('boot-complete');
    if (hasSeenBoot) {
      setShowBootScreen(false);
      setBootComplete(true);
    }
  }, []);

  const handleBootComplete = () => {
    setShowBootScreen(false);
    setBootComplete(true);
    sessionStorage.setItem('boot-complete', 'true');
  };

  // Redirect to auth if not authenticated (except for auth page)
  if (!loading && !user && location.pathname !== "/auth") {
    navigate("/auth", { replace: true });
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">redirecting to authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render layout for auth page
  if (location.pathname === "/auth") {
    return <>{children}</>;
  }

  // Show boot screen
  if (showBootScreen && !bootComplete) {
    return <BootScreen onBootComplete={handleBootComplete} />;
  }

  return (
    <div className="min-h-screen bg-background relative font-mono screen-flicker">
      {/* Scanlines Effect */}
      <div className="scanlines absolute inset-0 z-0 pointer-events-none" />
      
      {/* Terminal Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm relative z-50 shadow-terminal">
        <div className="flex h-12 items-center px-4 text-sm">
          <div className="flex items-center space-x-2 group">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-terminal-green text-black">
              <Terminal className="h-4 w-4" />
            </div>
            <span className="font-bold text-terminal-green terminal-text">
              root@osint-terminal
            </span>
            <span className="text-muted-foreground">:</span>
            <span className="text-terminal-cyan">~</span>
            <span className="text-muted-foreground">#</span>
          </div>
          
          <nav className="ml-8 flex items-center space-x-1">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-1 text-xs font-mono transition-all duration-200",
                    isActive
                      ? "text-terminal-green shadow-terminal bg-terminal-green/10 border border-terminal-green/30"
                      : "text-muted-foreground hover:text-terminal-green hover:bg-terminal-green/5"
                  )}
                >
                  <item.icon className="h-3 w-3" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <Badge variant="outline" className="text-[10px] h-4 px-1 border-terminal-green/30 text-terminal-green">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
            
            {/* Command Palette Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandPaletteOpen(true)}
              className="ml-4 h-8 px-3 text-xs font-mono border-terminal-green/30 text-terminal-green hover:bg-terminal-green/10"
            >
              <Search className="h-3 w-3 mr-2" />
              search...
              <Badge variant="outline" className="text-[10px] h-4 px-1 ml-2 border-terminal-amber/30 text-terminal-amber">
                ^k
              </Badge>
            </Button>
            
            {user && (
              <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-border">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span className="font-mono">{user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-terminal-red"
                >
                  <LogOut className="h-3 w-3" />
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 relative z-10">
        {children}
      </main>
      
      {/* Command Palette */}
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </div>
  );
}