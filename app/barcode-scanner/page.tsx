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
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-green-800 mb-2">Item Found</h3>
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
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Bin Found</h3>
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
          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-purple-800 mb-2">Shipment Found</h3>
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
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <p className="text-gray-800">Unknown data type</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Barcode Scanner</h1>
            <p className="mt-2 text-gray-600">Scan barcodes to lookup items, bins, or shipments</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scanner Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Scan Barcode</h2>
              <BarcodeScanner onScan={handleScan} onError={handleScanError} />
              {loading && (
                <div className="mt-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Scanning...</p>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Scan Results</h2>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
              {scannedData ? (
                renderScannedData()
              ) : (
                <div className="text-center text-gray-500 py-8">
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
