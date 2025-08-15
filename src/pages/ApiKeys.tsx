import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Key, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  service: string;
  name: string;
  keyPreview: string;
  status: 'active' | 'expired' | 'invalid';
  lastUsed: string;
  usage: number;
  limit: number;
}

const mockApiKeys: ApiKey[] = [
  {
    id: "1",
    service: "DeHashed",
    name: "Production Key",
    keyPreview: "dh_1234****",
    status: "active",
    lastUsed: "2 hours ago",
    usage: 145,
    limit: 1000
  },
  {
    id: "2",
    service: "Shodan",
    name: "Research Key",
    keyPreview: "SHO_5678****",
    status: "active",
    lastUsed: "1 day ago",
    usage: 23,
    limit: 100
  },
  {
    id: "3",
    service: "Hunter.io",
    name: "Email Verification",
    keyPreview: "ht_9012****",
    status: "expired",
    lastUsed: "5 days ago",
    usage: 500,
    limit: 500
  }
];

const supportedServices = [
  { name: "DeHashed", description: "Breach database lookups", cost: "$0.50/query" },
  { name: "Shodan", description: "Internet device scanning", cost: "$1.00/100 queries" },
  { name: "Hunter.io", description: "Email verification & finding", cost: "$0.10/query" },
  { name: "Twilio", description: "SMS/Voice communication", cost: "$0.0075/SMS" },
  { name: "VirusTotal", description: "Malware & URL analysis", cost: "Free tier available" },
  { name: "IPQualityScore", description: "IP & domain reputation", cost: "$0.004/query" }
];

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [showKey, setShowKey] = useState<string>("");
  const [newKey, setNewKey] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const { toast } = useToast();

  const handleAddKey = () => {
    if (!newKey || !selectedService) {
      toast({
        title: "Missing Information",
        description: "Please provide both service and API key",
        variant: "destructive"
      });
      return;
    }

    const newApiKey: ApiKey = {
      id: Date.now().toString(),
      service: selectedService,
      name: "New Key",
      keyPreview: newKey.substring(0, 8) + "****",
      status: "active",
      lastUsed: "Never",
      usage: 0,
      limit: 1000
    };

    setApiKeys([...apiKeys, newApiKey]);
    setNewKey("");
    setSelectedService("");
    
    toast({
      title: "API Key Added",
      description: `Successfully added ${selectedService} API key`,
    });
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    toast({
      title: "API Key Removed",
      description: "The API key has been securely deleted",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-security-green" />;
      case 'expired':
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-security-red" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-security-green/10 text-security-green border-security-green/20",
      expired: "bg-security-red/10 text-security-red border-security-red/20",
      invalid: "bg-security-red/10 text-security-red border-security-red/20"
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">API Key Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your premium OSINT service API keys securely
        </p>
      </div>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="keys">My API Keys</TabsTrigger>
          <TabsTrigger value="services">Supported Services</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-6">
          {/* Add New Key */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add New API Key</span>
              </CardTitle>
              <CardDescription>
                Add API keys for premium OSINT services to unlock advanced features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service">Service</Label>
                  <select
                    id="service"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select a service</option>
                    {supportedServices.map((service) => (
                      <option key={service.name} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apikey">API Key</Label>
                  <div className="relative">
                    <Input
                      id="apikey"
                      type={showKey === "new" ? "text" : "password"}
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="Enter your API key"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowKey(showKey === "new" ? "" : "new")}
                    >
                      {showKey === "new" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <Button onClick={handleAddKey} className="bg-gradient-primary shadow-primary">
                <Key className="h-4 w-4 mr-2" />
                Add API Key
              </Button>
            </CardContent>
          </Card>

          {/* Existing Keys */}
          <div className="grid gap-4">
            {apiKeys.map((key) => (
              <Card key={key.id} className="bg-gradient-card shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Key className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{key.service}</h3>
                        <p className="text-sm text-muted-foreground">{key.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(key.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKey(key.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Key Preview</p>
                      <p className="font-mono">{key.keyPreview}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Used</p>
                      <p>{key.lastUsed}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Usage</p>
                      <p>{key.usage}/{key.limit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Usage %</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-primary" 
                            style={{ width: `${(key.usage / key.limit) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs">{Math.round((key.usage / key.limit) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="grid gap-4">
            {supportedServices.map((service) => (
              <Card key={service.name} className="bg-gradient-card shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
                      <p className="text-muted-foreground">{service.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Pricing</p>
                      <p className="font-semibold text-primary">{service.cost}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
