'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Network,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw
} from 'lucide-react';

interface SystemSettings {
  general: {
    systemName: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
  };
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    criticalAlertsOnly: boolean;
    alertThresholds: {
      temperature: number;
      vibration: number;
      powerUsage: number;
    };
  };
  security: {
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
    };
    twoFactorAuth: boolean;
  };
  system: {
    autoBackup: boolean;
    backupFrequency: string;
    logRetention: number;
    performanceMonitoring: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Mock API call - in real implementation, this would fetch from /api/settings
      const mockSettings: SystemSettings = {
        general: {
          systemName: 'ASRS IoT Control Center',
          timezone: 'UTC-5',
          language: 'en',
          maintenanceMode: false
        },
        notifications: {
          emailAlerts: true,
          smsAlerts: false,
          criticalAlertsOnly: false,
          alertThresholds: {
            temperature: 30,
            vibration: 3.0,
            powerUsage: 80
          }
        },
        security: {
          sessionTimeout: 30,
          passwordPolicy: {
            minLength: 8,
            requireSpecialChars: true,
            requireNumbers: true
          },
          twoFactorAuth: false
        },
        system: {
          autoBackup: true,
          backupFrequency: 'daily',
          logRetention: 90,
          performanceMonitoring: true
        }
      };

      setSettings(mockSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      // Mock API call
      console.log('Saving settings:', settings);

      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category: keyof SystemSettings, field: string, value: string | number | boolean) => {
    if (!settings) return;

    setSettings(prev => {
      if (!prev) return prev;

      const updated = { ...prev };
      if (category === 'general') {
        (updated.general as any)[field] = value;
      } else if (category === 'notifications') {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          (updated.notifications as any)[parent][child] = value;
        } else {
          (updated.notifications as any)[field] = value;
        }
      } else if (category === 'security') {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          (updated.security as any)[parent][child] = value;
        } else {
          (updated.security as any)[field] = value;
        }
      } else if (category === 'system') {
        (updated.system as any)[field] = value;
      }

      return updated;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure system preferences and operational parameters</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic system configuration and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="systemName">System Name</Label>
                  <Input
                    id="systemName"
                    value={settings.general.systemName}
                    onChange={(e) => updateSetting('general', 'systemName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) => updateSetting('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-8">UTC-8 (PST)</SelectItem>
                      <SelectItem value="UTC-5">UTC-5 (EST)</SelectItem>
                      <SelectItem value="UTC+0">UTC+0 (GMT)</SelectItem>
                      <SelectItem value="UTC+1">UTC+1 (CET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.general.language}
                    onValueChange={(value) => updateSetting('general', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={settings.general.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting('general', 'maintenanceMode', checked)}
                />
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure alerts and notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailAlerts"
                    checked={settings.notifications.emailAlerts}
                    onCheckedChange={(checked) => updateSetting('notifications', 'emailAlerts', checked)}
                  />
                  <Label htmlFor="emailAlerts">Email Alerts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="smsAlerts"
                    checked={settings.notifications.smsAlerts}
                    onCheckedChange={(checked) => updateSetting('notifications', 'smsAlerts', checked)}
                  />
                  <Label htmlFor="smsAlerts">SMS Alerts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="criticalAlertsOnly"
                    checked={settings.notifications.criticalAlertsOnly}
                    onCheckedChange={(checked) => updateSetting('notifications', 'criticalAlertsOnly', checked)}
                  />
                  <Label htmlFor="criticalAlertsOnly">Critical Alerts Only</Label>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Alert Thresholds</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label htmlFor="tempThreshold">Temperature Threshold (°C)</Label>
                    <Input
                      id="tempThreshold"
                      type="number"
                      value={settings.notifications.alertThresholds.temperature}
                      onChange={(e) => updateSetting('notifications', 'alertThresholds.temperature', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vibrationThreshold">Vibration Threshold (m/s²)</Label>
                    <Input
                      id="vibrationThreshold"
                      type="number"
                      step="0.1"
                      value={settings.notifications.alertThresholds.vibration}
                      onChange={(e) => updateSetting('notifications', 'alertThresholds.vibration', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="powerThreshold">Power Threshold (kW)</Label>
                    <Input
                      id="powerThreshold"
                      type="number"
                      value={settings.notifications.alertThresholds.powerUsage}
                      onChange={(e) => updateSetting('notifications', 'alertThresholds.powerUsage', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure authentication and security policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Password Policy</Label>
                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minLength">Minimum Length</Label>
                      <Input
                        id="minLength"
                        type="number"
                        value={settings.security.passwordPolicy.minLength}
                        onChange={(e) => updateSetting('security', 'passwordPolicy.minLength', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireSpecialChars"
                      checked={settings.security.passwordPolicy.requireSpecialChars}
                      onCheckedChange={(checked) => updateSetting('security', 'passwordPolicy.requireSpecialChars', checked)}
                    />
                    <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireNumbers"
                      checked={settings.security.passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) => updateSetting('security', 'passwordPolicy.requireNumbers', checked)}
                    />
                    <Label htmlFor="requireNumbers">Require Numbers</Label>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="twoFactorAuth"
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                />
                <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system maintenance and monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoBackup"
                  checked={settings.system.autoBackup}
                  onCheckedChange={(checked) => updateSetting('system', 'autoBackup', checked)}
                />
                <Label htmlFor="autoBackup">Auto Backup</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select
                    value={settings.system.backupFrequency}
                    onValueChange={(value) => updateSetting('system', 'backupFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="logRetention">Log Retention (days)</Label>
                  <Input
                    id="logRetention"
                    type="number"
                    value={settings.system.logRetention}
                    onChange={(e) => updateSetting('system', 'logRetention', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="performanceMonitoring"
                  checked={settings.system.performanceMonitoring}
                  onCheckedChange={(checked) => updateSetting('system', 'performanceMonitoring', checked)}
                />
                <Label htmlFor="performanceMonitoring">Performance Monitoring</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
