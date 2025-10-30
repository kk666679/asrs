"use client";

import { useState, useEffect } from "react";

interface Bin {
  id: string;
  code: string;
  capacity: number;
  currentLoad: number;
  weightLimit: number;
  status: string;
  barcode?: string;
  rack: {
    code: string;
    aisle: {
      code: string;
      zone: {
        code: string;
        temperature: string;
      };
    };
  };
}

interface Rack {
  id: string;
  code: string;
  aisle: {
    code: string;
    zone: {
      code: string;
    };
  };
}

export default function LocationsPage() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    capacity: '',
    weightLimit: '',
    rackId: '',
    barcode: '',
  });
  const [generatingBarcode, setGeneratingBarcode] = useState(false);

  useEffect(() => {
    fetchBins();
    fetchRacks();
  }, []);

  const fetchBins = async () => {
    try {
      const response = await fetch("/api/locations");
      if (response.ok) {
        const data = await response.json();
        setBins(data);
      }
    } catch (error) {
      console.error("Failed to fetch bins:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRacks = async () => {
    try {
      // For now, we'll need to create a racks API or fetch from existing data
      // This is a placeholder - we'll need to implement racks fetching
      setRacks([]);
    } catch (error) {
      console.error("Failed to fetch racks:", error);
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
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const newBin = await response.json();
        setBins(prev => [...prev, newBin]);
        setShowForm(false);
        setFormData({
          code: '',
          capacity: '',
          weightLimit: '',
          rackId: '',
          barcode: '',
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create bin");
      }
    } catch (error) {
      console.error("Failed to create bin:", error);
      alert("Failed to create bin");
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading storage locations...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Storage Locations</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Add New Bin
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {bins.length === 0 ? (
                <li className="px-6 py-8 text-center text-gray-500">
                  No storage bins found. Set up your warehouse structure to get started.
                </li>
              ) : (
                bins.map((bin) => (
                  <li key={bin.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">Bin {bin.code}</h3>
                            <p className="text-sm text-gray-500">
                              Location: {bin.rack.aisle.zone.code} → {bin.rack.aisle.code} → {bin.rack.code}
                            </p>
                            <p className="text-sm text-gray-500">Temperature Zone: {bin.rack.aisle.zone.temperature}</p>
                          </div>
                          <div className="ml-4 flex flex-col items-end">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              bin.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              bin.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                              bin.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {bin.status}
                            </span>
                            <span className="text-sm text-gray-500 mt-1">
                              {bin.currentLoad}/{bin.capacity} units
                            </span>
                            <span className="text-sm text-gray-500">
                              Weight: {bin.weightLimit}kg limit
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <button className="text-green-600 hover:text-green-900 text-sm font-medium">
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Bin</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bin Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight Limit (kg) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="weightLimit"
                    value={formData.weightLimit}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rack *</label>
                  <select
                    name="rackId"
                    value={formData.rackId}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="">Select a rack</option>
                    {racks.map(rack => (
                      <option key={rack.id} value={rack.id}>
                        {rack.aisle.zone.code} → {rack.aisle.code} → {rack.code}
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
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    Save Bin
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
