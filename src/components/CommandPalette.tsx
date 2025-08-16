import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  Globe,
  Shield,
  Database,
  Mail,
  Phone,
  MapPin,
  User,
  Lock,
  Eye,
  Wifi,
  Hash,
  Building,
  Camera,
  Key,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Terminal,
  BarChart3,
  Calculator,
  Activity,
  Layers
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  action: () => void;
  premium?: boolean;
  cost?: string;
  shortcut?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState("");

  const executeOSINTCommand = (commandName: string, cost?: string) => {
    if (!user) {
      toast.error("Please sign in to execute OSINT commands");
      return;
    }
    
    navigate("/commands");
    onOpenChange(false);
    
    setTimeout(() => {
      toast.success(`${commandName} command ready for execution${cost ? ` (${cost})` : ""}`);
    }, 500);
  };

  const commands: CommandItem[] = useMemo(() => [
    // Navigation Commands
    {
      id: "nav-dashboard",
      title: "/dashboard",
      description: "Go to main dashboard",
      category: "Navigation",
      icon: Activity,
      action: () => {
        navigate("/");
        onOpenChange(false);
      },
      shortcut: "⌘D"
    },
    {
      id: "nav-commands",
      title: "/commands",
      description: "Access OSINT command center",
      category: "Navigation",
      icon: Terminal,
      action: () => {
        navigate("/commands");
        onOpenChange(false);
      },
      shortcut: "⌘T"
    },
    {
      id: "nav-analytics",
      title: "/analytics",
      description: "View usage analytics",
      category: "Navigation",
      icon: BarChart3,
      action: () => {
        navigate("/analytics");
        onOpenChange(false);
      },
      shortcut: "⌘A"
    },
    {
      id: "nav-api-keys",
      title: "/api-keys",
      description: "Manage API keys",
      category: "Navigation",
      icon: Key,
      action: () => {
        navigate("/api-keys");
        onOpenChange(false);
      },
      shortcut: "⌘K"
    },
    {
      id: "nav-security",
      title: "/security",
      description: "Security dashboard",
      category: "Navigation",
      icon: Lock,
      action: () => {
        navigate("/security");
        onOpenChange(false);
      },
      shortcut: "⌘S"
    },
    {
      id: "nav-premium",
      title: "/premium",
      description: "Upgrade to premium",
      category: "Navigation",
      icon: Calculator,
      action: () => {
        navigate("/premium");
        onOpenChange(false);
      },
      shortcut: "⌘P"
    },

    // Primary OSINT Commands
    {
      id: "discord-intel",
      title: "/discord",
      description: "Search Discord user intelligence and IP addresses",
      category: "Social Intelligence",
      icon: User,
      premium: true,
      cost: "$0.25/query",
      action: () => executeOSINTCommand("Discord Intelligence", "$0.25/query")
    },
    {
      id: "breach-search",
      title: "/breach",
      description: "Search through compromised data from breaches",
      category: "Breach Intelligence",
      icon: Shield,
      premium: true,
      cost: "$0.50/query",
      action: () => executeOSINTCommand("Data Breach Search", "$0.50/query")
    },
    {
      id: "email-intel",
      title: "/email",
      description: "Discover email registrations and intelligence",
      category: "Email Intelligence",
      icon: Mail,
      premium: true,
      cost: "$0.15/query",
      action: () => executeOSINTCommand("Email Intelligence", "$0.15/query")
    },
    {
      id: "phone-lookup",
      title: "/phone",
      description: "Lookup and analyze phone numbers",
      category: "Phone Intelligence",
      icon: Phone,
      premium: true,
      cost: "$0.05/query",
      action: () => executeOSINTCommand("Phone Lookup", "$0.05/query")
    },
    {
      id: "ip-geo",
      title: "/ip",
      description: "Get IP geolocation and intelligence",
      category: "Network Intelligence",
      icon: Globe,
      action: () => executeOSINTCommand("IP Geolocation", "Free")
    },
    {
      id: "npd-search",
      title: "/npd",
      description: "Search National Public Data records",
      category: "Public Records",
      icon: Database,
      premium: true,
      cost: "$1.00/query",
      action: () => executeOSINTCommand("National Public Data", "$1.00/query")
    },
    {
      id: "github-finder",
      title: "/github",
      description: "Find emails from GitHub usernames",
      category: "Developer Intelligence",
      icon: User,
      action: () => executeOSINTCommand("GitHub Email Finder", "Free")
    },

    // Advanced OSINT Tools
    {
      id: "shodan-search",
      title: "/shodan",
      description: "Internet device intelligence and vulnerability scanning",
      category: "Network Intelligence",
      icon: Wifi,
      premium: true,
      cost: "$0.25/query",
      action: () => executeOSINTCommand("Shodan Search", "$0.25/query")
    },
    {
      id: "maltego-transform",
      title: "/maltego",
      description: "Advanced link analysis and data mining",
      category: "Link Analysis",
      icon: Globe,
      premium: true,
      cost: "$2.00/query",
      action: () => executeOSINTCommand("Maltego Transform", "$2.00/query")
    },
    {
      id: "harvester-scan",
      title: "/harvester",
      description: "Gather emails, subdomains, and hosts",
      category: "Domain Intelligence",
      icon: Database,
      action: () => executeOSINTCommand("theHarvester", "Free")
    },
    {
      id: "recon-ng",
      title: "/recon",
      description: "Full-featured reconnaissance framework",
      category: "Reconnaissance",
      icon: Search,
      premium: true,
      cost: "$0.30/query",
      action: () => executeOSINTCommand("Recon-NG", "$0.30/query")
    },
    {
      id: "tineye-reverse",
      title: "/tineye",
      description: "Reverse image search and tracking",
      category: "Image Intelligence",
      icon: Camera,
      action: () => executeOSINTCommand("TinEye Reverse Search", "Free")
    },
    {
      id: "phoneinfoga-scan",
      title: "/phoneinfo",
      description: "Advanced phone number reconnaissance",
      category: "Phone Intelligence",
      icon: Phone,
      premium: true,
      cost: "$0.10/query",
      action: () => executeOSINTCommand("PhoneInfoga", "$0.10/query")
    },
    {
      id: "blackbird-search",
      title: "/blackbird",
      description: "Search usernames across social networks",
      category: "Username Intelligence",
      icon: User,
      premium: true,
      cost: "$0.15/query",
      action: () => executeOSINTCommand("Blackbird OSINT", "$0.15/query")
    },
    {
      id: "criminalip-check",
      title: "/criminalip",
      description: "IP reputation and threat intelligence",
      category: "Threat Intelligence",
      icon: Shield,
      premium: true,
      cost: "$0.35/query",
      action: () => executeOSINTCommand("Criminal IP", "$0.35/query")
    },
    {
      id: "social-links",
      title: "/social",
      description: "Advanced social media investigation",
      category: "Social Intelligence",
      icon: User,
      premium: true,
      cost: "$0.75/query",
      action: () => executeOSINTCommand("Social Links", "$0.75/query")
    },

    // Discord Bot Commands
    {
      id: "discord-admin",
      title: "/discord-admin",
      description: "Discord server administration tools",
      category: "Discord Integration",
      icon: Lock,
      premium: true,
      action: () => executeOSINTCommand("Discord Admin Tools", "Included")
    },
    {
      id: "discord-lookup-tools",
      title: "/discord-lookup",
      description: "Discord user analysis and information gathering",
      category: "Discord Integration",
      icon: Eye,
      premium: true,
      action: () => executeOSINTCommand("Discord Lookup Tools", "Included")
    }
  ], [navigate, onOpenChange, user]);

  const filteredCommands = useMemo(() => {
    if (!searchValue) return commands;
    return commands.filter(command =>
      command.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      command.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      command.category.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [commands, searchValue]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach(command => {
      if (!groups[command.category]) {
        groups[command.category] = [];
      }
      groups[command.category].push(command);
    });
    return groups;
  }, [filteredCommands]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Type a command or search... (try /discord, /email, etc.)"
        value={searchValue}
        onValueChange={setSearchValue}
      />
      <CommandList>
        <CommandEmpty>
          <div className="text-center py-6">
            <Terminal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No commands found</h3>
            <p className="text-muted-foreground">Try searching for "/discord", "/email", or "/ip"</p>
          </div>
        </CommandEmpty>
        
        {Object.entries(groupedCommands).map(([category, categoryCommands], index) => (
          <div key={category}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={category}>
              {categoryCommands.map((command) => (
                <CommandItem
                  key={command.id}
                  value={command.title}
                  onSelect={() => command.action()}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <command.icon className="h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium">{command.title}</span>
                      <span className="text-xs text-muted-foreground">{command.description}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {command.premium && (
                      <Badge variant="secondary" className="text-xs">Premium</Badge>
                    )}
                    {command.cost && (
                      <Badge variant="outline" className="text-xs text-primary">{command.cost}</Badge>
                    )}
                    {command.shortcut && (
                      <Badge variant="outline" className="text-xs font-mono">{command.shortcut}</Badge>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}