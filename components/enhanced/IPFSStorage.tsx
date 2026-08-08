'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Database, Upload, Download, FileText, Image, Video, Shield, Globe } from 'lucide-react';

interface IPFSFile {
  hash: string;
  name: string;
  size: number;
  type: 'document' | 'image' | 'video' | 'data';
  timestamp: string;
  pinned: boolean;
  replicas: number;
}

export default function IPFSStorage() {
  const [files, setFiles] = useState<IPFSFile[]>([]);
  const [storageStats, setStorageStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    pinnedFiles: 0,
    networkPeers: 0
  });

  useEffect(() => {
    // Simulate IPFS files
    const mockFiles: IPFSFile[] = [
      {
        hash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        name: 'quality-report-2024.pdf',
        size: 2048576,
        type: 'document',
        timestamp: new Date().toISOString(),
        pinned: true,
        replicas: 8
      },
      {
        hash: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB',
        name: 'warehouse-layout.jpg',
        size: 1024000,
        type: 'image',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        pinned: true,
        replicas: 12
      },
      {
        hash: 'QmYA2fn8cMbVWo4v95RwcwJVyQsNtnEwHerfWR8UNtEwoE',
        name: 'inventory-data.json',
        size: 512000,
        type: 'data',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        pinned: false,
        replicas: 5
      }
    ];
    
    setFiles(mockFiles);
    
    setStorageStats({
      totalFiles: mockFiles.length,
      totalSize: mockFiles.reduce((sum, file) => sum + file.size, 0),
      pinnedFiles: mockFiles.filter(f => f.pinned).length,
      networkPeers: 47
    });
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4 text-blue-400" />;
      case 'image': return <Image className="h-4 w-4 text-green-400" />;
      case 'video': return <Video className="h-4 w-4 text-purple-400" />;
      case 'data': return <Database className="h-4 w-4 text-yellow-400" />;
      default: return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card className="glass-effect hover-glow transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-glow flex items-center gap-2">
          <Globe className="h-5 w-5 text-purple-400" />
          IPFS Distributed Storage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Storage Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-effect p-3 rounded-lg border border-electricBlue/20">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-muted-foreground">Total Files</span>
            </div>
            <div className="text-lg font-bold text-foreground">{storageStats.totalFiles}</div>
          </div>
          
          <div className="glass-effect p-3 rounded-lg border border-electricBlue/20">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-sm text-muted-foreground">Pinned</span>
            </div>
            <div className="text-lg font-bold text-foreground">{storageStats.pinnedFiles}</div>
          </div>
          
          <div className="glass-effect p-3 rounded-lg border border-electricBlue/20">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-muted-foreground">Network Peers</span>
            </div>
            <div className="text-lg font-bold text-foreground">{storageStats.networkPeers}</div>
          </div>
          
          <div className="glass-effect p-3 rounded-lg border border-electricBlue/20">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-muted-foreground">Total Size</span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {formatFileSize(storageStats.totalSize)}
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Recent Files</h4>
            <Button variant="outline" size="sm" className="glass-effect hover-glow">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
          
          {files.map((file) => (
            <div key={file.hash} className="glass-effect p-3 rounded-lg border border-electricBlue/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getFileIcon(file.type)}
                  <span className="text-sm font-medium text-foreground">{file.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {file.pinned && (
                    <Badge variant="outline" className="text-xs text-green-400 border-green-500/30">
                      Pinned
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Hash:</span>
                  <span className="font-mono text-muted-foreground">{file.hash.slice(0, 20)}...</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="text-foreground">{formatFileSize(file.size)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Replicas:</span>
                  <span className="text-green-400">{file.replicas} nodes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Added:</span>
                  <span className="text-muted-foreground">
                    {new Date(file.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Network Distribution</span>
                  <span className="text-green-400">{Math.min(100, (file.replicas / 10) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(100, (file.replicas / 10) * 100)} className="h-1" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="glass-effect hover-glow">
            <Globe className="h-4 w-4 mr-2" />
            Gateway
          </Button>
          <Button variant="outline" size="sm" className="glass-effect hover-glow">
            <Shield className="h-4 w-4 mr-2" />
            Pin Files
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}