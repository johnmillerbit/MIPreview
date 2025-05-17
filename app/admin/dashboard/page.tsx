"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/getKey")
      .then(res => res.json())
      .then(data => setKeys(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800">Admin Dashboard</h2>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-500">
          Loading...
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">All Keys</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600">
                  <th className="px-4 py-2 text-left">Key</th>
                  <th className="px-4 py-2 text-left">Discord ID</th>
                  <th className="px-4 py-2 text-left">Username</th>
                  <th className="px-4 py-2 text-left">Used?</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k, i) => (
                  <tr key={i} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 text-gray-800">{k.key}</td>
                    <td className="px-4 py-2 text-gray-800">{k.discordid}</td>
                    <td className="px-4 py-2 text-gray-800">{k.username}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          k.isused
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {k.isused ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
