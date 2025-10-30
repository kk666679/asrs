'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  FileText,
  BarChart3,
  TrendingUp,
  Download,
  Calendar as CalendarIcon,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'performance' | 'equipment' | 'efficiency' | 'maintenance' | 'sensor' | 'inventory';
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
  generatedAt?: string;
  fileSize?: string;
  downloadUrl?: string;
  parameters?: {
    dateRange: { start: string; end: string };
    equipment?: string[];
    zones?: string[];
  };
}

const reportTypes = {
  performance: 'Performance Report',
  equipment: 'Equipment Report',
  efficiency: 'Efficiency Report',
  maintenance: 'Maintenance Report',
  sensor: 'Sensor Report',
  inventory: 'Inventory Report',
};

const statusColors = {
  generating: 'bg-yellow-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filterType, filterStatus]);

  const fetchReports = async () => {
    try {
      // Mock API call - in real implementation, this would fetch from /api/reports
      const mockReports: Report[] = [
        {
          id: '1',
          title: 'Weekly Performance Report',
          description: 'Throughput and efficiency metrics for the past week',
          type: 'performance',
          status: 'completed',
          createdAt: '2024-02-10T08:00:00Z',
          generatedAt: '2024-02-10T08:15:00Z',
          fileSize: '2.3 MB',
          downloadUrl: '#',
          parameters: {
            dateRange: { start: '2024-02-03', end: '2024-02-10' }
          }
        },
        {
          id: '2',
          title: 'Equipment Utilization Report',
          description: 'Equipment status and utilization across all zones',
          type: 'equipment',
          status: 'completed',
          createdAt: '2024-02-09T14:00:00Z',
          generatedAt: '2024-02-09T14:30:00Z',
          fileSize: '1.8 MB',
          downloadUrl: '#',
          parameters: {
            dateRange: { start: '2024-02-01', end: '2024-02-09' }
          }
        },
        {
          id: '3',
          title: 'Monthly Efficiency Analysis',
          description: 'System efficiency and optimization opportunities',
          type: 'efficiency',
          status: 'generating',
          createdAt: '2024-02-10T10:00:00Z',
          parameters: {
            dateRange: { start: '2024-01-01', end: '2024-01-31' }
          }
        },
        {
          id: '4',
          title: 'Maintenance History Report',
          description: 'Maintenance tasks and costs for Q1 2024',
          type: 'maintenance',
          status: 'failed',
          createdAt: '2024-02-08T16:00:00Z',
          parameters: {
            dateRange: { start: '2024-01-01', end: '2024-02-08' }
          }
        }
      ];

      setReports(mockReports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      if (!selectedReportType || !dateRange.start || !dateRange.end) {
        setError('Please select report type and date range');
        return;
      }

      const newReport: Report = {
        id: Date.now().toString(),
        title: `${reportTypes[selectedReportType as keyof typeof reportTypes]} - ${format(dateRange.start, 'MMM dd')} to ${format(dateRange.end, 'MMM dd')}`,
        description: `Generated ${reportTypes[selectedReportType as keyof typeof reportTypes].toLowerCase()}`,
        type: selectedReportType as Report['type'],
        status: 'generating',
        createdAt: new Date().toISOString(),
        parameters: {
          dateRange: {
            start: dateRange.start.toISOString().split('T')[0],
            end: dateRange.end.toISOString().split('T')[0]
          }
        }
      };

      // Mock API call
      console.log('Generating report:', newReport);

      // Update local state
      setReports(prev => [newReport, ...prev]);
      setIsGenerateDialogOpen(false);
      setSelectedReportType('');
      setDateRange({});

      // Simulate report generation completion
      setTimeout(() => {
        setReports(prev => prev.map(report =>
          report.id === newReport.id ? {
            ...report,
            status: 'completed',
            generatedAt: new Date().toISOString(),
            fileSize: '1.5 MB',
            downloadUrl: '#'
          } : report
        ));
      }, 10000); // Complete after 10 seconds
    } catch (err) {
      setError('Failed to generate report');
    }
  };

  const downloadReport = (report: Report) => {
    // Mock download
    console.log('Downloading report:', report.title);
    // In real implementation, this would trigger file download
  };

  const filteredReports = reports.filter(report => {
    if (filterType !== 'all' && report.type !== filterType) return false;
    if (filterStatus !== 'all' && report.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white text-xs`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const reportStats = {
    total: reports.length,
    completed: reports.filter(r => r.status === 'completed').length,
    generating: reports.filter(r => r.status === 'generating').length,
    failed: reports.filter(r => r.status === 'failed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and download system performance reports</p>
        </div>
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
              <DialogDescription>
                Create a new report with custom parameters and date range
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reportType">Report Type *</Label>
                <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="efficiency">Efficiency</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="sensor">Sensor</SelectItem>
                    <SelectItem value="inventory">Inventory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.start ? format(dateRange.start, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.start}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.end ? format(dateRange.end, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.end}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={generateReport}>
                Generate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{reportStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{reportStats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{reportStats.generating}</p>
                <p className="text-sm text-muted-foreground">Generating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{reportStats.failed}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="type">Report Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="efficiency">Efficiency</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="sensor">Sensor</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="generating">Generating</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchReports} className="w-full">
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports ({filteredReports.length})</CardTitle>
          <CardDescription>View and download generated system reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium">{report.title}</h3>
                  {getStatusBadge(report.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Created: {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                  {report.generatedAt && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Generated: {new Date(report.generatedAt).toLocaleDateString()}
                    </div>
                  )}
                  {report.fileSize && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {report.fileSize}
                    </div>
                  )}
                  {report.parameters?.dateRange && (
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      {report.parameters.dateRange.start} - {report.parameters.dateRange.end}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {report.status === 'completed' && report.downloadUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadReport(report)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
                {report.status === 'generating' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Generating
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredReports.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">No reports available</p>
              <p className="text-sm">Generate your first report to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
