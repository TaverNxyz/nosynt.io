import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Shield, 
  Key, 
  Database, 
  Layers, 
  Lock, 
  Calculator,
  Activity,
  ChevronRight
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Activity },
  { name: "API Keys", href: "/api-keys", icon: Key },
  { name: "Providers", href: "/providers", icon: Database },
  { name: "Implementation", href: "/implementation", icon: Layers },
  { name: "Security", href: "/security", icon: Lock },
  { name: "Premium", href: "/premium", icon: Calculator },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-hero relative">
      {/* Cosmic Background Elements */}
      <div className="absolute inset-0 bg-gradient-cosmic pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-primary rounded-full opacity-10 blur-3xl animate-float" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-security rounded-full opacity-5 blur-3xl animate-pulse-glow" />
      
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-xl relative z-50 shadow-floating">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-3 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow group-hover:animate-pulse-glow transition-all duration-300">
              <Shield className="h-5 w-5 text-primary-foreground group-hover:animate-float" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent group-hover:animate-pulse">
              OSINT Platform
            </h1>
          </div>
          
          <nav className="ml-auto flex items-center space-x-1">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                    isActive
                      ? "bg-gradient-primary/20 text-primary shadow-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-metallic hover:shadow-floating hover:scale-105"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <item.icon className={cn(
                    "h-4 w-4 relative z-10 transition-all duration-300",
                    isActive ? "animate-pulse-glow" : "group-hover:animate-float"
                  )} />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 relative z-10">
        {children}
      </main>
    </div>
  );
}