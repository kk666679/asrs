"use client";

import { useState } from "react";
import BarcodeScanner from "@/components/BarcodeScanner";

interface ScannedData {
  type: 'item' | 'bin' | 'shipment';
  data: any;
}

export default function BarcodeScannerPage() {
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (barcode: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/barcodes/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ barcode }),
      });

      if (response.ok) {
        const data = await response.json();
        setScannedData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to scan barcode");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleScanError = (error: string) => {
    console.error("Scan error:", error);
  };

  const renderScannedData = () => {
    if (!scannedData) return null;

    const { type, data } = scannedData;

    switch (type) {
      case 'item':
        return (
          <div className="glass-effect border border-green-500/30 rounded-md p-4">
            <h3 className="text-lg font-medium text-green-400 mb-2">Item Found</h3>
            <div className="space-y-1">
              <p><strong>SKU:</strong> {data.sku}</p>
              <p><strong>Name:</strong> {data.name}</p>
              <p><strong>Category:</strong> {data.category}</p>
              <p><strong>Supplier:</strong> {data.supplier.name}</p>
              <p><strong>Barcode:</strong> {data.barcode}</p>
            </div>
          </div>
        );

      case 'bin':
        return (
          <div className="glass-effect border border-blue-500/30 rounded-md p-4">
            <h3 className="text-lg font-medium text-blue-400 mb-2">Bin Found</h3>
            <div className="space-y-1">
              <p><strong>Code:</strong> {data.code}</p>
              <p><strong>Location:</strong> {data.rack.aisle.zone.code} → {data.rack.aisle.code} → {data.rack.code}</p>
              <p><strong>Capacity:</strong> {data.capacity}</p>
              <p><strong>Current Load:</strong> {data.currentLoad}</p>
              <p><strong>Status:</strong> {data.status}</p>
              <p><strong>Barcode:</strong> {data.barcode}</p>
              {data.binItems.length > 0 && (
                <div className="mt-2">
                  <p><strong>Contents:</strong></p>
                  <ul className="list-disc list-inside ml-4">
                    {data.binItems.map((binItem: any, index: number) => (
                      <li key={index}>
                        {binItem.item.name} ({binItem.item.sku}) - Qty: {binItem.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      case 'shipment':
        return (
          <div className="glass-effect border border-purple-500/30 rounded-md p-4">
            <h3 className="text-lg font-medium text-purple-400 mb-2">Shipment Found</h3>
            <div className="space-y-1">
              <p><strong>Shipment Number:</strong> {data.shipmentNumber}</p>
              <p><strong>Type:</strong> {data.type}</p>
              <p><strong>Status:</strong> {data.status}</p>
              <p><strong>Warehouse:</strong> {data.warehouse.name}</p>
              <p><strong>Supplier:</strong> {data.supplier.name}</p>
              <p><strong>Barcode:</strong> {data.barcode}</p>
              {data.expectedArrival && (
                <p><strong>Expected Arrival:</strong> {new Date(data.expectedArrival).toLocaleString()}</p>
              )}
              {data.shipmentItems.length > 0 && (
                <div className="mt-2">
                  <p><strong>Items:</strong></p>
                  <ul className="list-disc list-inside ml-4">
                    {data.shipmentItems.map((item: any, index: number) => (
                      <li key={index}>
                        {item.item.name} ({item.item.sku}) - Ordered: {item.quantity}, Received: {item.received}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="glass-effect border border-muted rounded-md p-4">
            <p className="text-muted-foreground">Unknown data type</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <header className="glass-effect border-b border-electricBlue/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold gradient-text">Barcode Scanner</h1>
            <p className="mt-2 text-muted-foreground">Scan barcodes to lookup items, bins, or shipments</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scanner Section */}
            <div className="glass-effect hover-glow transition-all duration-300 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-glow mb-4">Scan Barcode</h2>
              <BarcodeScanner onScan={handleScan} onError={handleScanError} />
              {loading && (
                <div className="mt-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Scanning...</p>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="glass-effect hover-glow transition-all duration-300 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-glow mb-4">Scan Results</h2>
              {error && (
                <div className="glass-effect border border-red-500/30 rounded-md p-4 mb-4">
                  <p className="text-red-400">{error}</p>
                </div>
              )}
              {scannedData ? (
                renderScannedData()
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>Scan a barcode to see results here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
