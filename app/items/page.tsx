"use client";

import { useState, useEffect } from "react";

interface Item {
  id: string;
  sku: string;
  name: string;
  category: string;
  weight: number;
  hazardLevel: string;
  temperature: string;
  minStock: number;
  maxStock: number | null;
  barcode?: string;
  supplier: {
    name: string;
  };
}

interface Supplier {
  id: string;
  code: string;
  name: string;
  status: string;
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchBarcode, setSearchBarcode] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    weight: '',
    hazardLevel: 'NONE',
    temperature: 'AMBIENT',
    minStock: '',
    maxStock: '',
    supplierId: '',
    barcode: '',
  });
  const [generatingBarcode, setGeneratingBarcode] = useState(false);
  const [barcodeValidation, setBarcodeValidation] = useState<{valid: boolean, errors: string[]} | null>(null);

  useEffect(() => {
    fetchItems();
    fetchSuppliers();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items");
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
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
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const newItem = await response.json();
        setItems(prev => [...prev, newItem]);
        setShowForm(false);
        setFormData({
          sku: '',
          name: '',
          category: '',
          weight: '',
          hazardLevel: 'NONE',
          temperature: 'AMBIENT',
          minStock: '',
          maxStock: '',
          supplierId: '',
          barcode: '',
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create item");
      }
    } catch (error) {
      console.error("Failed to create item:", error);
      alert("Failed to create item");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validate barcode when it changes
    if (name === 'barcode' && value) {
      validateBarcode(value);
    } else if (name === 'barcode' && !value) {
      setBarcodeValidation(null);
    }
  };

  const validateBarcode = async (barcode: string) => {
    try {
      const response = await fetch('/api/barcodes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barcode }),
      });

      if (response.ok) {
        const result = await response.json();
        setBarcodeValidation({ valid: result.valid, errors: result.errors });
      }
    } catch (error) {
      console.error('Failed to validate barcode:', error);
    }
  };

  const handleBarcodeSearch = async () => {
    if (!searchBarcode.trim()) return;

    setSearching(true);
    setSearchResult(null);
    try {
      const response = await fetch(`/api/barcodes/lookup?barcode=${encodeURIComponent(searchBarcode)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResult(data);
      } else {
        setSearchResult({ error: 'Barcode not found' });
      }
    } catch (error) {
      console.error('Failed to search barcode:', error);
      setSearchResult({ error: 'Search failed' });
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchBarcode('');
    setSearchResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading items...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={searchBarcode}
                  onChange={(e) => setSearchBarcode(e.target.value)}
                  placeholder="Search by barcode..."
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                />
                <button
                  onClick={handleBarcodeSearch}
                  disabled={searching}
                  className="px-3 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 disabled:opacity-50"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
                {searchResult && (
                  <button
                    onClick={clearSearch}
                    className="px-3 py-2 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
                  >
                    Clear
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add New Item
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {searchResult && (
          <div className="px-4 py-4 sm:px-0">
            <div className="bg-white shadow rounded-lg p-4 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Search Result</h2>
              {searchResult.error ? (
                <p className="text-red-600">{searchResult.error}</p>
              ) : searchResult.type === 'item' ? (
                <div className="space-y-1">
                  <p><strong>Item Found:</strong> {searchResult.data.name}</p>
                  <p><strong>SKU:</strong> {searchResult.data.sku}</p>
                  <p><strong>Barcode:</strong> {searchResult.data.barcode}</p>
                  <p><strong>Category:</strong> {searchResult.data.category}</p>
                  <p><strong>Supplier:</strong> {searchResult.data.supplier.name}</p>
                </div>
              ) : (
                <p className="text-blue-600">Found {searchResult.type} with barcode {searchBarcode}</p>
              )}
            </div>
          </div>
        )}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {items.length === 0 ? (
                <li className="px-6 py-8 text-center text-gray-500">
                  No items found. Add your first item to get started.
                </li>
              ) : (
                items.map((item) => (
                  <li key={item.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                            <p className="text-sm text-gray-500">Category: {item.category}</p>
                            <p className="text-sm text-gray-500">Supplier: {item.supplier.name}</p>
                          </div>
                          <div className="ml-4 flex flex-col items-end">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.hazardLevel === 'NONE' ? 'bg-green-100 text-green-800' :
                              item.hazardLevel === 'LOW' ? 'bg-yellow-100 text-yellow-800' :
                              item.hazardLevel === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.hazardLevel}
                            </span>
                            <span className="text-sm text-gray-500 mt-1">{item.temperature}</span>
                            <span className="text-sm text-gray-500">{item.weight}kg</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                          Delete
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Item</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category *</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hazard Level</label>
                  <select
                    name="hazardLevel"
                    value={formData.hazardLevel}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="NONE">None</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Temperature</label>
                  <select
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="AMBIENT">Ambient</option>
                    <option value="REFRIGERATED">Refrigerated</option>
                    <option value="FROZEN">Frozen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Min Stock</label>
                  <input
                    type="number"
                    name="minStock"
                    value={formData.minStock}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Stock</label>
                  <input
                    type="number"
                    name="maxStock"
                    value={formData.maxStock}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
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
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        name="barcode"
                        value={formData.barcode}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md shadow-sm ${
                          barcodeValidation
                            ? barcodeValidation.valid
                              ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                              : 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300'
                        }`}
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
                    {barcodeValidation && (
                      <div className={`text-sm ${barcodeValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
                        {barcodeValidation.valid ? (
                          <span>✓ Valid barcode format</span>
                        ) : (
                          <ul className="list-disc list-inside">
                            {barcodeValidation.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Save Item
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
