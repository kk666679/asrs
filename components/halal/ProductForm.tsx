'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Shield, Package } from 'lucide-react';
import { HalalStatus, StorageZoneType } from '@/lib/types/halal';

interface ProductFormData {
  sku: string;
  name: string;
  description: string;
  halalStatus: HalalStatus;
  certificationId: string;
  supplierId: string;
  storageZone: StorageZoneType;
  initialQuantity: number;
  reorderPoint: number;
  expiryDate: string;
  batchNumber: string;
}

export default function ProductForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    sku: '',
    name: '',
    description: '',
    halalStatus: HalalStatus.PENDING,
    certificationId: '',
    supplierId: '',
    storageZone: StorageZoneType.QUARANTINE,
    initialQuantity: 0,
    reorderPoint: 100,
    expiryDate: '',
    batchNumber: ''
  });

  const [certificationFile, setCertificationFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCertificationFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/halal/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const product = await response.json();
        console.log('Product created:', product);
        // Reset form
        setFormData({
          sku: '',
          name: '',
          description: '',
          halalStatus: HalalStatus.PENDING,
          certificationId: '',
          supplierId: '',
          storageZone: StorageZoneType.QUARANTINE,
          initialQuantity: 0,
          reorderPoint: 100,
          expiryDate: '',
          batchNumber: ''
        });
        setCertificationFile(null);
      }
    } catch (error) {
      console.error('Failed to create product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-6 w-6 text-green-600" />
          Register Halal Product
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Product Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="HALAL-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Halal Chicken Breast"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="100% halal certified product description..."
              rows={3}
            />
          </div>

          {/* Halal Certification Section */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Halal Certification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="halalStatus">Halal Status</Label>
                  <Select
                    value={formData.halalStatus}
                    onValueChange={(value) => handleInputChange('halalStatus', value as HalalStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={HalalStatus.CERTIFIED}>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">Certified</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value={HalalStatus.PENDING}>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value={HalalStatus.QUARANTINE}>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-800">Quarantine</Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificationId">Certification ID</Label>
                  <Input
                    id="certificationId"
                    value={formData.certificationId}
                    onChange={(e) => handleInputChange('certificationId', e.target.value)}
                    placeholder="JAKIM-2024-001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certification-file">Upload Certification Document</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="certification-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {certificationFile && (
                  <p className="text-sm text-green-600">
                    File selected: {certificationFile.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Storage and Inventory */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storageZone">Storage Zone</Label>
              <Select
                value={formData.storageZone}
                onValueChange={(value) => handleInputChange('storageZone', value as StorageZoneType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={StorageZoneType.HALAL}>Halal Zone</SelectItem>
                  <SelectItem value={StorageZoneType.QUARANTINE}>Quarantine Zone</SelectItem>
                  <SelectItem value={StorageZoneType.NON_HALAL}>Non-Halal Zone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialQuantity">Initial Quantity</Label>
              <Input
                id="initialQuantity"
                type="number"
                value={formData.initialQuantity}
                onChange={(e) => handleInputChange('initialQuantity', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorderPoint">Reorder Point</Label>
              <Input
                id="reorderPoint"
                type="number"
                value={formData.reorderPoint}
                onChange={(e) => handleInputChange('reorderPoint', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input
                id="batchNumber"
                value={formData.batchNumber}
                onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                placeholder="BATCH-001"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Creating...' : 'Register Halal Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}