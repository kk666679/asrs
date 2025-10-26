"use client";

import { useState, useEffect } from "react";

interface Movement {
  id: string;
  type: string;
  quantity: number;
  status: string;
  priority: string;
  timestamp: string;
  binItem: {
    item: {
      name: string;
      sku: string;
    };
  };
  user: {
    name: string;
  };
  fromBin?: {
    code: string;
  };
  toBin?: {
    code: string;
  };
}

export default function TransactionsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    try {
      const response = await fetch("/api/transactions");
      if (response.ok) {
        const data = await response.json();
        setMovements(data);
      }
    } catch (error) {
      console.error("Failed to fetch movements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                New Movement
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {movements.length === 0 ? (
                <li className="px-6 py-8 text-center text-gray-500">
                  No transactions found. Movements will appear here once operations begin.
                </li>
              ) : (
                movements.map((movement) => (
                  <li key={movement.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {movement.binItem.item.name} ({movement.binItem.item.sku})
                            </h3>
                            <p className="text-sm text-gray-500">
                              Type: {movement.type} | Quantity: {movement.quantity}
                            </p>
                            <p className="text-sm text-gray-500">
                              User: {movement.user.name} | {new Date(movement.timestamp).toLocaleString()}
                            </p>
                            {(movement.fromBin || movement.toBin) && (
                              <p className="text-sm text-gray-500">
                                {movement.fromBin && `From: ${movement.fromBin.code}`}
                                {movement.fromBin && movement.toBin && ' → '}
                                {movement.toBin && `To: ${movement.toBin.code}`}
                              </p>
                            )}
                          </div>
                          <div className="ml-4 flex flex-col items-end">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              movement.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              movement.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                              movement.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              movement.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {movement.status}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                              movement.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                              movement.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                              movement.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {movement.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <button className="text-purple-600 hover:text-purple-900 text-sm font-medium">
                          View Details
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
    </div>
  );
}
