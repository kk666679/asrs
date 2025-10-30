'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  XCircle,
  Settings,
  Filter,
  Clock,
  User,
  Activity
} from 'lucide-react';

interface AlertItem {
  id: string;
  type: 'warning' | 'critical' | 'info' | 'maintenance';
  title: string;
  description: string;
  time: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  equipment?: string;
  zone?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'equipment' | 'sensor' | 'system' | 'maintenance' | 'security';
}

const alertTypeIcons = {
  warning: AlertTriangle,
  critical: XCircle,
  info: Bell,
  maintenance: Settings,
};

const alertTypeColors = {
  warning: 'border-l-yellow-500',
  critical: 'border-l-red-500',
  info: 'border-l-blue-500',
  maintenance: 'border-l-orange-500',
};

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [acknowledgeNotes, setAcknowledgeNotes] = useState('');

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filterType, filterStatus, filterPriority]);

  const fetchAlerts = async () => {
    try {
      // Mock API call - in real implementation, this would fetch from /api/alerts
      const mockAlerts: AlertItem[] = [
        {
          id: '1',
          type: 'warning',
          title: 'Elevated Vibration - Shuttle #3',
          description: 'Vibration levels above threshold in motor assembly. Motor health at 75%.',
          time: '10 minutes ago',
          acknowledged: false,
          equipment: 'Shuttle #3',
          zone: 'Aisle 7',
          priority: 'medium',
          category: 'equipment'
        },
        {
          id: '2',
          type: 'info',
          title: 'Preventive Maintenance Due',
          description: 'Conveyor System A maintenance scheduled in 2 days. Last maintenance: 2024-01-15.',
          time: '1 hour ago',
          acknowledged: false,
          equipment: 'Conveyor A',
          zone: 'Loading Bay',
          priority: 'low',
          category: 'maintenance'
        },
        {
          id: '3',
          type: 'critical',
          title: 'Temperature Sensor Failure',
          description: 'Temperature sensor in Zone B has failed. Current reading unavailable.',
          time: '5 minutes ago',
          acknowledged: false,
          equipment: 'Temp Sensor B-12',
          zone: 'Zone B',
          priority: 'high',
          category: 'sensor'
        },
        {
          id: '4',
          type: 'maintenance',
          title: 'VLM #2 Calibration Required',
          description: 'VLM #2 position calibration is out of tolerance. Accuracy reduced by 2%.',
          time: '2 hours ago',
          acknowledged: true,
          acknowledgedBy: 'John Smith',
          acknowledgedAt: '1 hour ago',
          equipment: 'VLM #2',
          zone: 'Zone B',
          priority: 'medium',
          category: 'equipment'
        },
        {
          id: '5',
          type: 'info',
          title: 'System Backup Completed',
          description: 'Daily system backup completed successfully. 2.3GB backed up.',
          time: '6 hours ago',
          acknowledged: true,
          acknowledgedBy: 'System',
          acknowledgedAt: '6 hours ago',
          priority: 'low',
          category: 'system'
        }
      ];

      setAlerts(mockAlerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      // Mock API call
      console.log(`Acknowledging alert ${alertId} with notes: ${acknowledgeNotes}`);

      // Update local state
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? {
          ...alert,
          acknowledged: true,
          acknowledgedBy: 'Current User', // In real app, get from auth
          acknowledgedAt: new Date().toLocaleString()
        } : alert
      ));

      setIsDialogOpen(false);
      setAcknowledgeNotes('');
    } catch (err) {
      setError('Failed to acknowledge alert');
    }
  };

  const getAlertIcon = (type: string) => {
    const IconComponent = alertTypeIcons[type as keyof typeof alertTypeIcons] || Bell;
    return <IconComponent className="h-4 w-4" />;
  };

  const getPriorityBadge = (priority: string) => {
    return (
      <Badge className={`${priorityColors[priority as keyof typeof priorityColors]} text-white text-xs`}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterType !== 'all' && alert.type !== filterType) return false;
    if (filterStatus !== 'all') {
      if (filterStatus === 'acknowledged' && !alert.acknowledged) return false;
      if (filterStatus === 'unacknowledged' && alert.acknowledged) return false;
    }
    if (filterPriority !== 'all' && alert.priority !== filterPriority) return false;
    return true;
  });

  const alertStats = {
    total: alerts.length,
    unacknowledged: alerts.filter(a => !a.acknowledged).length,
    critical: alerts.filter(a => a.type === 'critical').length,
    warnings: alerts.filter(a => a.type === 'warning').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
          <p className="text-muted-foreground">Monitor and manage system alerts and notifications</p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Alert Settings
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{alertStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{alertStats.unacknowledged}</p>
                <p className="text-sm text-muted-foreground">Unacknowledged</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{alertStats.critical}</p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{alertStats.warnings}</p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="type">Alert Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="unacknowledged">Unacknowledged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchAlerts} className="w-full">
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Alerts ({filteredAlerts.length})</CardTitle>
          <CardDescription>System alerts and notifications requiring attention</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Alert key={alert.id} className={`border-l-4 ${
              alertTypeColors[alert.type as keyof typeof alertTypeColors]
            } ${alert.acknowledged ? 'opacity-75' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTitle className="flex items-center gap-2">
                        {alert.title}
                        {alert.acknowledged && <Badge variant="outline" className="text-xs">Acknowledged</Badge>}
                        {getPriorityBadge(alert.priority)}
                      </AlertTitle>
                    </div>
                    <AlertDescription className="mt-1">
                      {alert.description}
                    </AlertDescription>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {alert.time}
                      </div>
                      {alert.equipment && (
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {alert.equipment}
                        </div>
                      )}
                      {alert.zone && (
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {alert.zone}
                        </div>
                      )}
                      {alert.acknowledged && alert.acknowledgedBy && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {alert.acknowledgedBy}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {!alert.acknowledged && (
                  <Dialog open={isDialogOpen && selectedAlert?.id === alert.id} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Acknowledge Alert</DialogTitle>
                        <DialogDescription>
                          Mark this alert as acknowledged and add optional notes
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="notes">Acknowledgment Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Enter acknowledgment notes (optional)"
                            value={acknowledgeNotes}
                            onChange={(e) => setAcknowledgeNotes(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={() => acknowledgeAlert(alert.id)}>
                            Acknowledge
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </Alert>
          ))}
          {filteredAlerts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg">No alerts found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
