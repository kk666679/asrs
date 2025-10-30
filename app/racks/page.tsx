'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Archive, Grid3X3, AlertTriangle, CheckCircle } from 'lucide-react';

interface Rack {
  id: string;
  code: string;
  name: string;
  zoneId: string;
  aisleId: string;
  levels: number;
  positionsPerLevel: number;
  maxWeight: number;
  currentWeight: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  createdAt: string;
}

export default function RacksPage() {
  const [racks, setRacks] = useState<Rack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRack, setEditingRack] = useState<Rack | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    zoneId: '',
    aisleId: '',
    levels: 5,
    positionsPerLevel: 10,
    maxWeight: 10000
  });

  useEffect(() => {
    fetchRacks();
  }, []);

  const fetchRacks = async () => {
    try {
      const response = await fetch('/api/racks');
      const data = await response.json();
      setRacks(data);
    } catch (error) {
      console.error('Failed to fetch racks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/racks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchRacks();
        setIsCreateDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create rack:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRack) return;

    try {
      const response = await fetch(`/api/racks/${editingRack.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchRacks();
        setEditingRack(null);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to update rack:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rack?')) return;

    try {
      const response = await fetch(`/api/racks/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchRacks();
      }
    } catch (error) {
      console.error('Failed to delete rack:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      zoneId: '',
      aisleId: '',
      levels: 5,
      positionsPerLevel: 10,
      maxWeight: 10000
    });
  };

  const startEdit = (rack: Rack) => {
    setEditingRack(rack);
    setFormData({
      code: rack.code,
      name: rack.name,
      zoneId: rack.zoneId,
      aisleId: rack.aisleId,
      levels: rack.levels,
      positionsPerLevel: rack.positionsPerLevel,
      maxWeight: rack.maxWeight
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'MAINTENANCE': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const filteredRacks = racks.filter(rack =>
    rack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rack.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading racks...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white neon-text">Rack Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage storage racks and their configurations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Rack
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Rack</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Rack Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Rack Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zoneId">Zone ID</Label>
                  <Input
                    id="zoneId"
                    value={formData.zoneId}
                    onChange={(e) => setFormData({...formData, zoneId: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="aisleId">Aisle ID</Label>
                  <Input
                    id="aisleId"
                    value={formData.aisleId}
                    onChange={(e) => setFormData({...formData, aisleId: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="levels">Levels</Label>
                  <Input
                    id="levels"
                    type="number"
                    value={formData.levels}
                    onChange={(e) => setFormData({...formData, levels: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="positionsPerLevel">Positions/Level</Label>
                  <Input
                    id="positionsPerLevel"
                    type="number"
                    value={formData.positionsPerLevel}
                    onChange={(e) => setFormData({...formData, positionsPerLevel: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxWeight">Max Weight (kg)</Label>
                  <Input
                    id="maxWeight"
                    type="number"
                    value={formData.maxWeight}
                    onChange={(e) => setFormData({...formData, maxWeight: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Rack</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search racks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="glass dark:glass-dark">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{racks.filter(r => r.status === 'ACTIVE').length}</p>
                <p className="text-sm text-muted-foreground">Active Racks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass dark:glass-dark">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Archive className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{racks.length}</p>
                <p className="text-sm text-muted-foreground">Total Racks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass dark:glass-dark">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Grid3X3 className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{racks.reduce((sum, r) => sum + (r.levels * r.positionsPerLevel), 0)}</p>
                <p className="text-sm text-muted-foreground">Total Positions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="glass dark:glass-dark">
          <CardHeader>
            <CardTitle>Racks ({filteredRacks.length})</CardTitle>
          </CardHeader>
          <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Configuration</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRacks.map((rack) => (
                <TableRow key={rack.id}>
                  <TableCell className="font-medium">{rack.code}</TableCell>
                  <TableCell>{rack.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{rack.levels} levels × {rack.positionsPerLevel} positions</div>
                      <div className="text-muted-foreground">
                        Total: {rack.levels * rack.positionsPerLevel} positions
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Max: {rack.maxWeight}kg</div>
                      <div className="text-muted-foreground">
                        Current: {rack.currentWeight}kg ({Math.round((rack.currentWeight / rack.maxWeight) * 100)}%)
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(rack.status)}
                      <span className="text-sm">{rack.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(rack)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(rack.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Dialog */}
      {editingRack && (
        <Dialog open={!!editingRack} onOpenChange={() => setEditingRack(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Rack</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-code">Rack Code</Label>
                  <Input
                    id="edit-code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-name">Rack Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-zoneId">Zone ID</Label>
                  <Input
                    id="edit-zoneId"
                    value={formData.zoneId}
                    onChange={(e) => setFormData({...formData, zoneId: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-aisleId">Aisle ID</Label>
                  <Input
                    id="edit-aisleId"
                    value={formData.aisleId}
                    onChange={(e) => setFormData({...formData, aisleId: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-levels">Levels</Label>
                  <Input
                    id="edit-levels"
                    type="number"
                    value={formData.levels}
                    onChange={(e) => setFormData({...formData, levels: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-positionsPerLevel">Positions/Level</Label>
                  <Input
                    id="edit-positionsPerLevel"
                    type="number"
                    value={formData.positionsPerLevel}
                    onChange={(e) => setFormData({...formData, positionsPerLevel: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-maxWeight">Max Weight (kg)</Label>
                  <Input
                    id="edit-maxWeight"
                    type="number"
                    value={formData.maxWeight}
                    onChange={(e) => setFormData({...formData, maxWeight: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingRack(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update Rack</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}
