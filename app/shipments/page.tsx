"use client";

import { useState, useEffect } from "react";

interface Shipment {
  id: string;
  shipmentNumber: string;
  type: string;
  status: string;
  expectedArrival: string | null;
  actualArrival: string | null;
  barcode?: string;
  warehouse: {
    name: string;
  };
  supplier: {
    name: string;
  };
  shipmentItems: Array<{
    item: {
      name: string;
      sku: string;
    };
    quantity: number;
    received: number;
  }>;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

interface Supplier {
  id: string;
  name: string;
  code: string;
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    shipmentNumber: '',
    type: 'INBOUND',
    expectedArrival: '',
    warehouseId: '',
    supplierId: '',
    barcode: '',
  });
  const [generatingBarcode, setGeneratingBarcode] = useState(false);

  useEffect(() => {
    fetchShipments();
    fetchWarehouses();
    fetchSuppliers();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await fetch("/api/shipments");
      if (response.ok) {
        const data = await response.json();
        setShipments(data);
      }
    } catch (error) {
      console.error("Failed to fetch shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      // For now, we'll need to create a warehouses API or fetch from existing data
      // This is a placeholder - we'll need to implement warehouses fetching
      setWarehouses([]);
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers");
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    }
  };

  const generateBarcode = async () => {
    setGeneratingBarcode(true);
    try {
      const response = await fetch("/api/barcodes/generate", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, barcode: data.barcode }));
      } else {
        alert("Failed to generate barcode");
      }
    } catch (error) {
      console.error("Failed to generate barcode:", error);
      alert("Failed to generate barcode");
    } finally {
      setGeneratingBarcode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/shipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const newShipment = await response.json();
        setShipments(prev => [newShipment, ...prev]);
        setShowForm(false);
        setFormData({
          shipmentNumber: '',
          type: 'INBOUND',
          expectedArrival: '',
          warehouseId: '',
          supplierId: '',
          barcode: '',
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create shipment");
      }
    } catch (error) {
      console.error("Failed to create shipment:", error);
      alert("Failed to create shipment");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shipments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Shipments</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                Create Shipment
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {shipments.length === 0 ? (
                <li className="px-6 py-8 text-center text-gray-500">
                  No shipments found. Create your first shipment to get started.
                </li>
              ) : (
                shipments.map((shipment) => (
                  <li key={shipment.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{shipment.shipmentNumber}</h3>
                            <p className="text-sm text-gray-500">
                              {shipment.supplier.name} → {shipment.warehouse.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {shipment.shipmentItems.length} items • Expected: {shipment.expectedArrival ? new Date(shipment.expectedArrival).toLocaleDateString() : 'TBD'}
                            </p>
                          </div>
                          <div className="ml-4 flex flex-col items-end">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              shipment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              shipment.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
                              shipment.status === 'RECEIVED' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {shipment.status}
                            </span>
                            <span className="text-sm text-gray-500 mt-1">{shipment.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <button className="text-purple-600 hover:text-purple-900 text-sm font-medium">
                          View Details
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                          Edit
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" onClick={() => setShowForm(false)}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Shipment</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Shipment Number *</label>
                  <input
                    type="text"
                    name="shipmentNumber"
                    value={formData.shipmentNumber}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="INBOUND">Inbound</option>
                    <option value="OUTBOUND">Outbound</option>
                    <option value="TRANSFER">Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expected Arrival</label>
                  <input
                    type="datetime-local"
                    name="expectedArrival"
                    value={formData.expectedArrival}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Warehouse *</label>
                  <select
                    name="warehouseId"
                    value={formData.warehouseId}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="">Select a warehouse</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier *</label>
                  <select
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name} ({supplier.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Barcode</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      placeholder="Leave empty to generate automatically"
                    />
                    <button
                      type="button"
                      onClick={generateBarcode}
                      disabled={generatingBarcode}
                      className="mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      {generatingBarcode ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    Create Shipment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
