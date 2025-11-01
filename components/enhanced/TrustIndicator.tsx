'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, CheckCircle, Clock, Zap } from 'lucide-react';

interface TrustMetrics {
  systemReliability: number;
  dataAccuracy: number;
  securityScore: number;
  uptime: number;
  certifications: string[];
  lastAudit: string;
}

export default function TrustIndicator() {
  const [metrics] = useState<TrustMetrics>({
    systemReliability: 99.8,
    dataAccuracy: 99.95,
    securityScore: 98.5,
    uptime: 99.99,
    certifications: ['ISO 27001', 'SOC 2 Type II', 'GDPR Compliant'],
    lastAudit: '2024-10-15'
  });

  const getTrustScore = () => {
    return Math.round((metrics.systemReliability + metrics.dataAccuracy + metrics.securityScore + metrics.uptime) / 4);
  };

  const getStatusColor = (score: number) => {
    if (score >= 99) return 'text-green-400';
    if (score >= 95) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="glass-effect hover-glow transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-glow">
          <Shield className="h-5 w-5 text-blue-400" />
          System Trust Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold gradient-text mb-2">
            {getTrustScore()}%
          </div>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Highly Trusted
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">System Reliability</span>
            <span className={`text-sm font-medium ${getStatusColor(metrics.systemReliability)}`}>
              {metrics.systemReliability.toFixed(2)}%
            </span>
          </div>
          <Progress value={metrics.systemReliability} className="h-2" />

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Data Accuracy</span>
            <span className={`text-sm font-medium ${getStatusColor(metrics.dataAccuracy)}`}>
              {metrics.dataAccuracy.toFixed(2)}%
            </span>
          </div>
          <Progress value={metrics.dataAccuracy} className="h-2" />
        </div>

        <div className="pt-3 border-t border-electricBlue/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Live Status</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {metrics.certifications.map((cert, index) => (
              <Badge key={index} variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                {cert}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last audit: {metrics.lastAudit}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}