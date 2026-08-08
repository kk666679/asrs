'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Eye,
  FileText,
  Calendar,
  User,
  Package,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface QualityInspection {
  id: string;
  itemId: string;
  itemName: string;
  batchNumber: string;
  inspectionType: 'incoming' | 'outgoing' | 'random' | 'complaint';
  status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'quarantined';
  inspector: string;
  scheduledDate: string;
  completedDate?: string;
  criteria: {
    visual: 'pass' | 'fail' | 'n/a';
    weight: 'pass' | 'fail' | 'n/a';
    packaging: 'pass' | 'fail' | 'n/a';
    labeling: 'pass' | 'fail' | 'n/a';
    temperature?: 'pass' | 'fail' | 'n/a';
  };
  notes?: string;
  defects?: string[];
  correctiveActions?: string[];
}

const statusColors = {
  pending: 'bg-yellow-500',
  in_progress: 'bg-blue-500',
  passed: 'bg-green-500',
  failed: 'bg-red-500',
  quarantined: 'bg-orange-500',
};

const inspectionTypeColors = {
  incoming: 'bg-blue-500',
  outgoing: 'bg-purple-500',
  random: 'bg-gray-500',
  complaint: 'bg-red-500',
};

export default function QualityInspectionPage() {
  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedInspection, setSelectedInspection] = useState<QualityInspection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchQualityInspections();
    const interval = setInterval(fetchQualityInspections, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQualityInspections = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      const mockInspections: QualityInspection[] = [
        {
          id: 'QI001',
          itemId: 'ITM001',
          itemName: 'Halal Chicken Breast',
          batchNumber: 'BCH20240101',
          inspectionType: 'incoming',
          status: 'passed',
          inspector: 'Dr. Sarah Johnson',
          scheduledDate: '2024-01-15T09:00:00Z',
          completedDate: '2024-01-15T09:30:00Z',
          criteria: {
            visual: 'pass',
            weight: 'pass',
            packaging: 'pass',
            labeling: 'pass',
            temperature: 'pass'
          },
          notes: 'All criteria met. Product meets halal certification standards.'
        },
        {
          id: 'QI002',
          itemId: 'ITM002',
          itemName: 'Organic Rice',
          batchNumber: 'BOR20240101',
          inspectionType: 'random',
          status: 'in_progress',
          inspector: 'Ahmad Rahman',
          scheduledDate: '2024-01-15T11:00:00Z',
          criteria: {
            visual: 'pass',
            weight: 'pass',
            packaging: 'pass',
            labeling: 'pass'
          }
        },
        {
          id: 'QI003',
          itemId: 'ITM003',
          itemName: 'Fresh Milk',
          batchNumber: 'BFM20240102',
          inspectionType: 'complaint',
          status: 'failed',
          inspector: 'Dr. Maria Santos',
          scheduledDate: '2024-01-14T14:00:00Z',
          completedDate: '2024-01-14T15:00:00Z',
          criteria: {
            visual: 'fail',
            weight: 'pass',
            packaging: 'pass',
            labeling: 'pass',
            temperature: 'fail'
          },
          defects: ['Visible contamination', 'Temperature above safe limit'],
          correctiveActions: ['Quarantine batch', 'Contact supplier', 'Temperature monitoring review'],
          notes: 'Batch quarantined due to contamination and temperature issues.'
        },
        {
          id: 'QI004',
          itemId: 'ITM004',
          itemName: 'Halal Beef',
          batchNumber: 'BBF20240102',
          inspectionType: 'outgoing',
          status: 'quarantined',
          inspector: 'Mohd Hassan',
          scheduledDate: '2024-01-15T13:00:00Z',
          completedDate: '2024-01-15T13:45:00Z',
          criteria: {
            visual: 'pass',
            weight: 'fail',
            packaging: 'pass',
            labeling: 'fail'
          },
          defects: ['Incorrect weight', 'Missing halal certification label'],
          correctiveActions: ['Re-weigh products', 'Apply correct labeling', 'Additional training for labeling team'],
          notes: 'Quarantined for re-processing. Weight discrepancy and labeling errors found.'
        }
      ];

      setInspections(mockInspections);
    } catch (error) {
      console.error('Failed to fetch quality inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
    const matchesType = typeFilter === 'all' || inspection.inspectionType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white text-xs`}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge className={`${inspectionTypeColors[type as keyof typeof inspectionTypeColors]} text-white text-xs`}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  const getCriteriaStatus = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <span className="text-gray-400">N/A</span>;
    }
  };

  const updateInspectionStatus = (inspectionId: string, newStatus: QualityInspection['status']) => {
    setInspections(prev => prev.map(inspection =>
      inspection.id === inspectionId ? { ...inspection, status: newStatus } : inspection
    ));
  };

  const inspectionStats = {
    total: inspections.length,
    pending: inspections.filter(i => i.status === 'pending').length,
    inProgress: inspections.filter(i => i.status === 'in_progress').length,
    passed: inspections.filter(i => i.status === 'passed').length,
    failed: inspections.filter(i => i.status === 'failed').length,
    quarantined: inspections.filter(i => i.status === 'quarantined').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading quality inspections...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quality Inspection</h1>
          <p className="text-muted-foreground">Monitor and manage product quality control processes</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Inspection
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{inspectionStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Inspections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{inspectionStats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{inspectionStats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{inspectionStats.passed}</p>
                <p className="text-sm text-muted-foreground">Passed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{inspectionStats.failed}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{inspectionStats.quarantined}</p>
                <p className="text-sm text-muted-foreground">Quarantined</p>
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
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search inspections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="quarantined">Quarantined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Inspection Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="incoming">Incoming</SelectItem>
                  <SelectItem value="outgoing">Outgoing</SelectItem>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchQualityInspections} className="w-full">
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Inspections ({filteredInspections.length})</CardTitle>
          <CardDescription>Current quality control inspections and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInspections.map((inspection) => (
                <TableRow key={inspection.id}>
                  <TableCell className="font-medium">{inspection.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{inspection.itemName}</p>
                      <p className="text-sm text-muted-foreground">Batch: {inspection.batchNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(inspection.inspectionType)}</TableCell>
                  <TableCell>{getStatusBadge(inspection.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="text-sm">{inspection.inspector}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(inspection.scheduledDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog open={isDialogOpen && selectedInspection?.id === inspection.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInspection(inspection)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Inspection Details - {inspection.id}</DialogTitle>
                            <DialogDescription>
                              Detailed quality inspection results
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Item</Label>
                                <p className="text-sm font-medium">{inspection.itemName}</p>
                                <p className="text-xs text-muted-foreground">ID: {inspection.itemId}</p>
                              </div>
                              <div>
                                <Label>Batch Number</Label>
                                <p className="text-sm font-medium">{inspection.batchNumber}</p>
                              </div>
                              <div>
                                <Label>Inspection Type</Label>
                                <div>{getTypeBadge(inspection.inspectionType)}</div>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <div>{getStatusBadge(inspection.status)}</div>
                              </div>
                              <div>
                                <Label>Inspector</Label>
                                <p className="text-sm">{inspection.inspector}</p>
                              </div>
                              <div>
                                <Label>Scheduled Date</Label>
                                <p className="text-sm">{new Date(inspection.scheduledDate).toLocaleString()}</p>
                              </div>
                            </div>

                            {inspection.completedDate && (
                              <div>
                                <Label>Completed Date</Label>
                                <p className="text-sm">{new Date(inspection.completedDate).toLocaleString()}</p>
                              </div>
                            )}

                            <div>
                              <Label>Inspection Criteria</Label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                {Object.entries(inspection.criteria).map(([criterion, status]) => (
                                  <div key={criterion} className="flex items-center justify-between p-2 border rounded">
                                    <span className="text-sm capitalize">{criterion.replace('_', ' ')}</span>
                                    {getCriteriaStatus(status)}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {inspection.defects && inspection.defects.length > 0 && (
                              <div>
                                <Label>Defects Found</Label>
                                <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                                  {inspection.defects.map((defect, index) => (
                                    <li key={index} className="text-red-600">{defect}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {inspection.correctiveActions && inspection.correctiveActions.length > 0 && (
                              <div>
                                <Label>Corrective Actions</Label>
                                <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                                  {inspection.correctiveActions.map((action, index) => (
                                    <li key={index} className="text-blue-600">{action}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {inspection.notes && (
                              <div>
                                <Label>Notes</Label>
                                <p className="text-sm">{inspection.notes}</p>
                              </div>
                            )}

                            <div className="flex justify-end gap-2">
                              {inspection.status === 'pending' && (
                                <Button onClick={() => updateInspectionStatus(inspection.id, 'in_progress')}>
                                  Start Inspection
                                </Button>
                              )}
                              {inspection.status === 'in_progress' && (
                                <>
                                  <Button onClick={() => updateInspectionStatus(inspection.id, 'passed')}>
                                    Mark as Passed
                                  </Button>
                                  <Button variant="destructive" onClick={() => updateInspectionStatus(inspection.id, 'failed')}>
                                    Mark as Failed
                                  </Button>
                                </>
                              )}
                              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Close
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredInspections.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">No quality inspections found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
