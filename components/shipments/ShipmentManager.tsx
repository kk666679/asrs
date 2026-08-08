'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ShipmentManager() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/shipments')
      .then(res => res.json())
      .then(data => {
        setShipments(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Shipments</h2>
        <Button>Create Shipment</Button>
      </div>

      <div className="grid gap-4">
        {shipments.map((shipment: any) => (
          <Card key={shipment.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{shipment.shipmentNumber}</span>
                    <Badge>{shipment.type}</Badge>
                    <Badge variant="outline">{shipment.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Warehouse: {shipment.warehouse?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supplier: {shipment.supplier?.name}
                  </p>
                  {shipment.expectedArrival && (
                    <p className="text-xs">
                      Expected: {new Date(shipment.expectedArrival).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {shipment.shipmentItems?.length || 0} items
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
