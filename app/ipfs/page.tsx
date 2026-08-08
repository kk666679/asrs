'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload, Download, FileText, Image, Video, Archive,
  CheckCircle, XCircle, Clock, Database, Shield, Lock
} from 'lucide-react';

interface IPFSFile {
  id: string;
  name: string;
  hash: string;
  size: number;
  type: string;
  uploadedAt: string;
  status: 'pinned' | 'unpinned' | 'pending';
  halalCertified: boolean;
  blockchainTx?: string;
}

export default function IPFSPage() {
  const [files, setFiles] = useState<IPFSFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    halalCertified: false,
    certifyingBody: ''
  });
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  useEffect(() => {
    fetchIPFSFiles();
  }, []);

  const fetchIPFSFiles = async () => {
    try {
      const response = await fetch('/api/ipfs/files');
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Failed to fetch IPFS files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadForm(prev => ({ ...prev, name: file.name }));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('metadata', JSON.stringify(uploadForm));

      const response = await fetch('/api/ipfs/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await fetchIPFSFiles();
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        setUploadForm({ name: '', description: '', halalCertified: false, certifyingBody: '' });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (hash: string, filename: string) => {
    try {
      const response = await fetch(`/api/ipfs/download/${hash}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="h-4 w-4" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Database className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading IPFS Storage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IPFS Storage</h1>
          <p className="text-gray-600 mt-1">Decentralized file storage for HalalChain documents and certificates</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload to IPFS</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">File Name</Label>
                <Input
                  id="name"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({...uploadForm, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={uploadForm.halalCertified}
                    onChange={(e) => setUploadForm({...uploadForm, halalCertified: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="ml-2 text-sm">Halal Certified Document</span>
                </label>
              </div>
              {uploadForm.halalCertified && (
                <div>
                  <Label htmlFor="certifyingBody">Certifying Body</Label>
                  <Input
                    id="certifyingBody"
                    value={uploadForm.certifyingBody}
                    onChange={(e) => setUploadForm({...uploadForm, certifyingBody: e.target.value})}
                    placeholder="e.g., JAKIM, MUI, etc."
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{files.length}</p>
                <p className="text-sm text-muted-foreground">Total Files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {files.filter(f => f.halalCertified).length}
                </p>
                <p className="text-sm text-muted-foreground">Halal Certified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {files.filter(f => f.status === 'pinned').length}
                </p>
                <p className="text-sm text-muted-foreground">Pinned Files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Lock className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024 * 1024)}
                </p>
                <p className="text-sm text-muted-foreground">GB Stored</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>IPFS Files</CardTitle>
          <CardDescription>Manage your decentralized file storage</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>IPFS Hash</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Halal Certified</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.type)}
                      <span className="font-medium">{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {file.hash.substring(0, 12)}...
                    </code>
                  </TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        file.status === 'pinned' ? 'bg-green-100 text-green-800' :
                        file.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }
                    >
                      {file.status === 'pinned' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {file.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {file.status === 'unpinned' && <XCircle className="h-3 w-3 mr-1" />}
                      {file.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {file.halalCertified ? (
                      <Badge className="bg-green-100 text-green-800">✓ Certified</Badge>
                    ) : (
                      <Badge variant="secondary">Not Certified</Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(file.uploadedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file.hash, file.name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {file.blockchainTx && (
                        <Button variant="ghost" size="sm">
                          <Shield className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>HalalChain IPFS Storage:</strong> All files are stored on the InterPlanetary File System (IPFS)
          and can be accessed via their content-addressed hashes. Halal certified documents are automatically
          linked to blockchain transactions for immutable audit trails.
        </AlertDescription>
      </Alert>
    </div>
  );
}
