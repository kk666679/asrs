'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ReportGenerator() {
  const [reportType, setReportType] = useState('summary');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    const res = await fetch(`/api/reports?type=${reportType}`);
    const data = await res.json();
    setReport(data);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="inventory">Inventory</SelectItem>
              <SelectItem value="movements">Movements</SelectItem>
              <SelectItem value="shipments">Shipments</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateReport} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader>
            <CardTitle>{report.type} Report</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm overflow-auto">{JSON.stringify(report.data, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
