import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Layers,
  DollarSign,
  Calendar,
  Users,
  Target
} from "lucide-react";

interface ImplementationPhase {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned' | 'on-hold';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  team: string[];
  deliverables: string[];
  risks: Array<{
    risk: string;
    severity: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;
}

const implementationPhases: ImplementationPhase[] = [
  {
    id: "1",
    name: "Phase 1: Foundation",
    description: "Core infrastructure, authentication, and basic OSINT integrations",
    status: "completed",
    progress: 100,
    startDate: "2024-01-15",
    endDate: "2024-03-15",
    budget: 25000,
    spent: 24500,
    team: ["Backend Dev", "Frontend Dev", "DevOps"],
    deliverables: [
      "User authentication system",
      "API key management",
      "Basic provider integrations",
      "Security framework"
    ],
    risks: [
      {
        risk: "API rate limiting issues",
        severity: "medium",
        mitigation: "Implement intelligent caching and request queuing"
      }
    ]
  },
  {
    id: "2", 
    name: "Phase 2: Core Features",
    description: "Advanced OSINT capabilities, premium services, and analytics",
    status: "in-progress",
    progress: 75,
    startDate: "2024-03-16",
    endDate: "2024-05-30",
    budget: 35000,
    spent: 26250,
    team: ["Backend Dev", "Frontend Dev", "Security Engineer", "Data Analyst"],
    deliverables: [
      "Premium service integrations",
      "Advanced search capabilities",
      "Real-time monitoring dashboard",
      "Usage analytics system"
    ],
    risks: [
      {
        risk: "Third-party API instability",
        severity: "high",
        mitigation: "Implement failover mechanisms and backup providers"
      },
      {
        risk: "Performance bottlenecks",
        severity: "medium",
        mitigation: "Optimize database queries and implement caching"
      }
    ]
  },
  {
    id: "3",
    name: "Phase 3: Enterprise Features",
    description: "Multi-tenant architecture, compliance, and enterprise integrations",
    status: "planned",
    progress: 0,
    startDate: "2024-06-01",
    endDate: "2024-08-15",
    budget: 40000,
    spent: 0,
    team: ["Backend Dev", "Frontend Dev", "Security Engineer", "Compliance Officer"],
    deliverables: [
      "Multi-tenant infrastructure",
      "GDPR compliance framework",
      "Enterprise SSO integration",
      "Advanced role management"
    ],
    risks: [
      {
        risk: "Compliance certification delays",
        severity: "high",
        mitigation: "Early engagement with certification bodies"
      },
      {
        risk: "Multi-tenancy complexity",
        severity: "medium",
        mitigation: "Phased rollout with thorough testing"
      }
    ]
  },
  {
    id: "4",
    name: "Phase 4: Scale & Optimization",
    description: "Performance optimization, auto-scaling, and global deployment",
    status: "planned",
    progress: 0,
    startDate: "2024-08-16",
    endDate: "2024-10-31",
    budget: 30000,
    spent: 0,
    team: ["DevOps", "Backend Dev", "Performance Engineer"],
    deliverables: [
      "Auto-scaling infrastructure",
      "Global CDN deployment",
      "Performance monitoring",
      "Load testing framework"
    ],
    risks: [
      {
        risk: "Scaling cost overruns",
        severity: "medium",
        mitigation: "Implement cost monitoring and automated scaling policies"
      }
    ]
  },
  {
    id: "5",
    name: "Phase 5: Production Launch",
    description: "Final testing, documentation, and production deployment",
    status: "planned",
    progress: 0,
    startDate: "2024-11-01",
    endDate: "2024-12-15",
    budget: 10000,
    spent: 0,
    team: ["All Teams", "QA Engineer", "Technical Writer"],
    deliverables: [
      "Production deployment",
      "User documentation",
      "Training materials",
      "Support framework"
    ],
    risks: [
      {
        risk: "Production deployment issues",
        severity: "high",
        mitigation: "Comprehensive testing and staged rollout"
      }
    ]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-terminal-green bg-terminal-green/10 border-terminal-green/20';
    case 'in-progress':
      return 'text-terminal-blue bg-terminal-blue/10 border-terminal-blue/20';
    case 'planned':
      return 'text-muted-foreground bg-muted/10 border-muted/20';
    case 'on-hold':
      return 'text-terminal-amber bg-terminal-amber/10 border-terminal-amber/20';
    default:
      return 'text-muted-foreground bg-muted/10 border-muted/20';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'in-progress':
      return <Clock className="h-4 w-4" />;
    case 'planned':
      return <Layers className="h-4 w-4" />;
    case 'on-hold':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return null;
  }
};

const getRiskColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'text-terminal-red bg-terminal-red/10 border-terminal-red/20';
    case 'medium':
      return 'text-terminal-amber bg-terminal-amber/10 border-terminal-amber/20';
    case 'low':
      return 'text-terminal-green bg-terminal-green/10 border-terminal-green/20';
    default:
      return 'text-muted-foreground bg-muted/10 border-muted/20';
  }
};

export default function Implementation() {
  const totalBudget = implementationPhases.reduce((sum, phase) => sum + phase.budget, 0);
  const totalSpent = implementationPhases.reduce((sum, phase) => sum + phase.spent, 0);
  const completedPhases = implementationPhases.filter(phase => phase.status === 'completed').length;
  const totalPhases = implementationPhases.length;
  const overallProgress = (implementationPhases.reduce((sum, phase) => sum + phase.progress, 0) / implementationPhases.length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Implementation Roadmap</h1>
        <p className="text-muted-foreground mt-2">
          Complete 5-phase development timeline with progress tracking and risk management
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(overallProgress)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Phases Complete</p>
                <p className="text-2xl font-bold text-terminal-green">
                  {completedPhases}/{totalPhases}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-terminal-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget Used</p>
                <p className="text-2xl font-bold text-foreground">
                  ${totalSpent.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  of ${totalBudget.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-terminal-amber" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Timeline</p>
                <p className="text-2xl font-bold text-foreground">11</p>
                <p className="text-xs text-muted-foreground">months total</p>
              </div>
              <Calendar className="h-8 w-8 text-terminal-blue" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phase Cards */}
      <div className="space-y-6">
        {implementationPhases.map((phase, index) => (
          <Card key={phase.id} className="bg-gradient-card shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{phase.name}</CardTitle>
                    <CardDescription>{phase.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className={getStatusColor(phase.status)}>
                  {getStatusIcon(phase.status)}
                  <span className="ml-1 capitalize">{phase.status.replace('-', ' ')}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium">{phase.progress}%</span>
                </div>
                <Progress value={phase.progress} className="h-2" />
              </div>

              {/* Timeline & Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{new Date(phase.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">{new Date(phase.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium">${phase.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Spent</p>
                  <p className="font-medium">${phase.spent.toLocaleString()}</p>
                </div>
              </div>

              {/* Team */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Team</p>
                <div className="flex flex-wrap gap-1">
                  {phase.team.map((member, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {member}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Deliverables */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Key Deliverables</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {phase.deliverables.map((deliverable, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-terminal-green flex-shrink-0" />
                      <span className="text-sm">{deliverable}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Risk Assessment</p>
                <div className="space-y-3">
                  {phase.risks.map((risk, index) => (
                    <div key={index} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{risk.risk}</span>
                        <Badge variant="outline" className={getRiskColor(risk.severity)}>
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}