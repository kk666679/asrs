'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlerts } from '@/lib/hooks/useAlerts';
import { Alert as AlertType } from '@/lib/types';
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
  info: 'bg-blue-500',
  warning: 'bg-yellow-500',
  critical: 'bg-red-500',
};

export default function AlertsPage() {
  const {
    alerts,
    filteredAlerts,
    alertStats,
    isLoading,
    error,
    filters,
    setFilters,
    clearFilters,
    acknowledgeAlert: acknowledgeAlertHook,
    refreshAlerts
  } = useAlerts();
  
  const [selectedAlert, setSelectedAlert] = React.useState<AlertType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [acknowledgeNotes, setAcknowledgeNotes] = React.useState('');



  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      acknowledgeAlertHook(alertId);
      setIsDialogOpen(false);
      setAcknowledgeNotes('');
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
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



  if (isLoading) {
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
                <p className="text-2xl font-bold">{alertStats.total - alertStats.acknowledged}</p>
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
                <p className="text-2xl font-bold">{alertStats.warning}</p>
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
              <Select value={filters.type || 'all'} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                  <SelectItem value="OVERSTOCK">Overstock</SelectItem>
                  <SelectItem value="EXPIRY_WARNING">Expiry Warning</SelectItem>
                  <SelectItem value="QUALITY_ISSUE">Quality Issue</SelectItem>
                  <SelectItem value="EQUIPMENT_FAILURE">Equipment Failure</SelectItem>
                  <SelectItem value="SENSOR_ALERT">Sensor Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.acknowledged === undefined ? 'all' : filters.acknowledged ? 'acknowledged' : 'unacknowledged'} onValueChange={(value) => setFilters({...filters, acknowledged: value === 'all' ? undefined : value === 'acknowledged'})}>
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
              <Label htmlFor="severity">Severity</Label>
              <Select value={filters.severity || 'all'} onValueChange={(value) => setFilters({...filters, severity: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={refreshAlerts} className="w-full">
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
                        {alert.type.replace('_', ' ')}
                        {alert.acknowledged && <Badge variant="outline" className="text-xs">Acknowledged</Badge>}
                        {getPriorityBadge(alert.severity.toLowerCase())}
                      </AlertTitle>
                    </div>
                    <AlertDescription className="mt-1">
                      {alert.message}
                    </AlertDescription>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.createdAt).toLocaleString()}
                      </div>
                      {alert.equipmentId && (
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          Equipment: {alert.equipmentId}
                        </div>
                      )}
                      {alert.sensorId && (
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          Sensor: {alert.sensorId}
                        </div>
                      )}
                      {alert.acknowledged && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Acknowledged
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
                          <Button onClick={() => handleAcknowledgeAlert(alert.id)}>
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
