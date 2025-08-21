import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  FileText,
  Users,
  Database,
  Eye,
  Clock
} from "lucide-react";

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  status: 'compliant' | 'in-progress' | 'non-compliant';
  progress: number;
  requirements: number;
  completed: number;
  lastAudit: string;
  nextAudit: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface SecurityControl {
  id: string;
  category: string;
  control: string;
  description: string;
  status: 'implemented' | 'partial' | 'missing';
  priority: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  lastReview: string;
  evidence: string[];
}

const complianceFrameworks: ComplianceFramework[] = [
  {
    id: "1",
    name: "GDPR",
    description: "General Data Protection Regulation compliance for EU users",
    status: "in-progress",
    progress: 85,
    requirements: 42,
    completed: 36,
    lastAudit: "2024-01-15",
    nextAudit: "2024-07-15",
    priority: "critical"
  },
  {
    id: "2", 
    name: "SOC 2 Type II",
    description: "Security, availability, and confidentiality controls",
    status: "in-progress",
    progress: 70,
    requirements: 64,
    completed: 45,
    lastAudit: "2023-12-01",
    nextAudit: "2024-06-01",
    priority: "high"
  },
  {
    id: "3",
    name: "ISO 27001",
    description: "Information security management system standard",
    status: "non-compliant", 
    progress: 25,
    requirements: 114,
    completed: 28,
    lastAudit: "2023-10-15",
    nextAudit: "2024-04-15",
    priority: "high"
  },
  {
    id: "4",
    name: "NIST Cybersecurity Framework",
    description: "Risk-based approach to cybersecurity",
    status: "compliant",
    progress: 95,
    requirements: 23,
    completed: 22,
    lastAudit: "2024-02-01",
    nextAudit: "2024-08-01", 
    priority: "medium"
  }
];

const securityControls: SecurityControl[] = [
  {
    id: "1",
    category: "Access Control",
    control: "Multi-Factor Authentication",
    description: "Require MFA for all user accounts and administrative access",
    status: "implemented",
    priority: "critical",
    owner: "Security Team",
    lastReview: "2024-01-15",
    evidence: ["MFA policy document", "Audit logs", "User enrollment stats"]
  },
  {
    id: "2",
    category: "Data Protection", 
    control: "Encryption at Rest",
    description: "All sensitive data encrypted using AES-256 encryption",
    status: "implemented",
    priority: "critical",
    owner: "DevOps Team",
    lastReview: "2024-01-10",
    evidence: ["Encryption configuration", "Key management procedures"]
  },
  {
    id: "3",
    category: "Data Protection",
    control: "Encryption in Transit", 
    description: "TLS 1.3 for all data transmission",
    status: "implemented",
    priority: "critical",
    owner: "DevOps Team",
    lastReview: "2024-01-10",
    evidence: ["SSL certificate", "TLS configuration"]
  },
  {
    id: "4",
    category: "Audit & Logging",
    control: "Comprehensive Audit Logging",
    description: "Log all security-relevant events with tamper protection",
    status: "partial",
    priority: "high",
    owner: "Security Team", 
    lastReview: "2024-01-08",
    evidence: ["Log retention policy", "SIEM configuration"]
  },
  {
    id: "5",
    category: "Incident Response",
    control: "Incident Response Plan",
    description: "Documented procedures for security incident handling",
    status: "missing",
    priority: "high",
    owner: "Security Team",
    lastReview: "2023-12-15",
    evidence: []
  },
  {
    id: "6",
    category: "Backup & Recovery",
    control: "Data Backup Procedures",
    description: "Regular automated backups with recovery testing",
    status: "partial",
    priority: "medium",
    owner: "DevOps Team",
    lastReview: "2024-01-05",
    evidence: ["Backup schedule", "Recovery test results"]
  }
];

const getComplianceStatusColor = (status: string) => {
  switch (status) {
    case 'compliant':
      return 'text-terminal-green bg-terminal-green/10 border-terminal-green/20';
    case 'in-progress':
      return 'text-terminal-blue bg-terminal-blue/10 border-terminal-blue/20';
    case 'non-compliant':
      return 'text-terminal-red bg-terminal-red/10 border-terminal-red/20';
    default:
      return 'text-muted-foreground bg-muted/10 border-muted/20';
  }
};

const getControlStatusColor = (status: string) => {
  switch (status) {
    case 'implemented':
      return 'text-terminal-green bg-terminal-green/10 border-terminal-green/20';
    case 'partial':
      return 'text-terminal-amber bg-terminal-amber/10 border-terminal-amber/20';
    case 'missing':
      return 'text-terminal-red bg-terminal-red/10 border-terminal-red/20';
    default:
      return 'text-muted-foreground bg-muted/10 border-muted/20';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'text-terminal-red bg-terminal-red/10 border-terminal-red/20';
    case 'high':
      return 'text-terminal-amber bg-terminal-amber/10 border-terminal-amber/20';
    case 'medium':
      return 'text-terminal-blue bg-terminal-blue/10 border-terminal-blue/20';
    case 'low':
      return 'text-terminal-green bg-terminal-green/10 border-terminal-green/20';
    default:
      return 'text-muted-foreground bg-muted/10 border-muted/20';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'compliant':
    case 'implemented':
      return <CheckCircle className="h-4 w-4" />;
    case 'in-progress':
    case 'partial':
      return <Clock className="h-4 w-4" />;
    case 'non-compliant':
    case 'missing':
      return <XCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

export default function Security() {
  const implementedControls = securityControls.filter(c => c.status === 'implemented').length;
  const totalControls = securityControls.length;
  const criticalIssues = securityControls.filter(c => c.priority === 'critical' && c.status !== 'implemented').length;
  const avgCompliance = complianceFrameworks.reduce((sum, f) => sum + f.progress, 0) / complianceFrameworks.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Security & Compliance</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive security monitoring and compliance management dashboard
        </p>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Security Controls</p>
                <p className="text-2xl font-bold text-foreground">
                  {implementedControls}/{totalControls}
                </p>
              </div>
              <Shield className="h-8 w-8 text-terminal-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold text-terminal-red">{criticalIssues}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-terminal-red" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Compliance</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(avgCompliance)}%
                </p>
              </div>
              <FileText className="h-8 w-8 text-terminal-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Frameworks</p>
                <p className="text-2xl font-bold text-foreground">{complianceFrameworks.length}</p>
              </div>
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compliance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compliance">Compliance Frameworks</TabsTrigger>
          <TabsTrigger value="controls">Security Controls</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid gap-4">
            {complianceFrameworks.map((framework) => (
              <Card key={framework.id} className="bg-gradient-card shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{framework.name}</CardTitle>
                        <CardDescription>{framework.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getPriorityColor(framework.priority)}>
                        {framework.priority}
                      </Badge>
                      <Badge variant="outline" className={getComplianceStatusColor(framework.status)}>
                        {getStatusIcon(framework.status)}
                        <span className="ml-1 capitalize">{framework.status.replace('-', ' ')}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">{framework.progress}%</span>
                    </div>
                    <Progress value={framework.progress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Requirements</p>
                      <p className="font-semibold">{framework.completed}/{framework.requirements}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Audit</p>
                      <p className="font-semibold">{new Date(framework.lastAudit).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Next Audit</p>
                      <p className="font-semibold">{new Date(framework.nextAudit).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-semibold capitalize">{framework.status.replace('-', ' ')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="controls" className="space-y-6">
          <div className="grid gap-4">
            {securityControls.map((control) => (
              <Card key={control.id} className="bg-gradient-card shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{control.control}</CardTitle>
                        <CardDescription>{control.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getPriorityColor(control.priority)}>
                        {control.priority}
                      </Badge>
                      <Badge variant="outline" className={getControlStatusColor(control.status)}>
                        {getStatusIcon(control.status)}
                        <span className="ml-1 capitalize">{control.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-semibold">{control.category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Owner</p>
                      <p className="font-semibold flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {control.owner}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Review</p>
                      <p className="font-semibold">{new Date(control.lastReview).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Evidence</p>
                      <p className="font-semibold">{control.evidence.length} items</p>
                    </div>
                  </div>

                  {control.evidence.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Evidence & Documentation</p>
                      <div className="flex flex-wrap gap-1">
                        {control.evidence.map((evidence, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            {evidence}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle>Risk Assessment Matrix</CardTitle>
                <CardDescription>Current security risks by severity and likelihood</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { risk: "API Key Exposure", severity: "critical", likelihood: "low", status: "mitigated" },
                    { risk: "Data Breach", severity: "high", likelihood: "medium", status: "monitoring" },
                    { risk: "Service Downtime", severity: "medium", likelihood: "low", status: "accepted" },
                    { risk: "Compliance Violation", severity: "high", likelihood: "low", status: "mitigated" }
                  ].map((risk, index) => (
                    <div key={index} className="p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{risk.risk}</span>
                        <div className="flex space-x-1">
                          <Badge variant="outline" className={getPriorityColor(risk.severity)}>
                            {risk.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {risk.likelihood}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">Status:</span>
                        <Badge variant="secondary" className="text-xs">
                          {risk.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle>Threat Intelligence</CardTitle>
                <CardDescription>Latest security threats and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-terminal-red/10 border border-terminal-red/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-terminal-red" />
                      <span className="font-medium text-sm">Critical Alert</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      New vulnerability detected in third-party API providers. 
                      Update API tokens immediately.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-terminal-amber/10 border border-terminal-amber/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-terminal-amber" />
                      <span className="font-medium text-sm">Advisory</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Scheduled security audit for SOC 2 compliance next week.
                      Prepare documentation.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-terminal-green/10 border border-terminal-green/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-terminal-green" />
                      <span className="font-medium text-sm">All Clear</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      All security controls are functioning properly.
                      No immediate action required.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}