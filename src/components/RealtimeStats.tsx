import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { Activity, Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export function RealtimeStats() {
  const { connected, liveStats, recentUpdates, refreshStats } = useRealtimeUpdates();

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Real-time Connection</CardTitle>
          <div className="flex items-center gap-2">
            {connected ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Wifi className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-600">
                <WifiOff className="w-3 h-3 mr-1" />
                Disconnected
              </Badge>
            )}
            <Button size="sm" variant="outline" onClick={refreshStats}>
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Live Statistics */}
      {liveStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commands</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveStats.total_commands}</div>
              <p className="text-xs text-muted-foreground">
                {liveStats.successful_commands} successful, {liveStats.failed_commands} failed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Cost</CardTitle>
              <div className="text-xs">$</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${liveStats.total_cost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
              <div className="text-xs">📄</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveStats.total_reports}</div>
              <p className="text-xs text-muted-foreground">
                Avg risk: {liveStats.avg_risk_score.toFixed(0)}/100
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveStats.high_risk_reports}</div>
              <p className="text-xs text-muted-foreground">Risk score ≥ 70</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentUpdates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              recentUpdates.slice(0, 10).map((update, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    {update.type === 'command_update' && (
                      update.data.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : update.data.status === 'error' ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Activity className="w-4 h-4 text-blue-500" />
                      )
                    )}
                    {update.type === 'report_update' && (
                      <div className="w-4 h-4 text-purple-500">📄</div>
                    )}
                    {update.type === 'notification' && (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium capitalize">
                        {update.type.replace('_', ' ')}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {update.data.status || update.data.type || 'update'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {update.data.command_name || update.data.target || update.data.title || 'Activity'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(update.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}