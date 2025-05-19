"use client";
import { useEffect, useState } from "react";
import {
    PlusCircle,
    Trash2,
    KeyRound,
    Users,
    ShieldCheck,
    ShieldOff,
    Search,
    ChevronDown,
    ChevronUp,
    Edit3,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface ApiKey {
    id: string;
    key: string;
    discordid: string | null;
    username: string | null;
    isused: boolean;
    created_at: string;
}

const fetchKeysAPI = async (): Promise<ApiKey[]> => {
    const res = await fetch("/api/v1/admin/getKey");
    if (!res.ok) {
        throw new Error("Failed to fetch keys");
    }
    const data = await res.json();
    return data as ApiKey[];
};

const deleteKeyAPI = async (keyId: string): Promise<{ success: boolean }> => {
    const res = await fetch("/api/v1/admin/deleteKey", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete key");
    }
    return { success: true };
};

const KEYS_PER_PAGE = 5;

export default function AdminDashboard() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{
        key: keyof ApiKey | "actions";
        direction: "ascending" | "descending";
    }>({ key: "created_at", direction: "descending" });
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const loadKeys = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchKeysAPI();
                setKeys(data.map((k) => ({ ...k, id: k.id || k.key })));
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred");
                }
                console.error("Error fetching keys:", err);
            } finally {
                setLoading(false);
            }
        };
        loadKeys();
    }, []);

    const handleDeleteKey = async (keyId: string) => {
        try {
            setKeys((prevKeys) => prevKeys.filter((k) => k.id !== keyId));
            await deleteKeyAPI(keyId);
        } catch (err) {
            let errorMessage = "Failed to delete key.";
            if (err instanceof Error) {
                errorMessage = `Failed to delete key: ${err.message}`;
            }
            setError(errorMessage);
            console.error("Error deleting key:", err);
        }
    };

    const handleSort = (columnKey: keyof ApiKey | "actions") => {
        if (columnKey === "actions") return;
        let direction: "ascending" | "descending" = "ascending";
        if (
            sortConfig.key === columnKey &&
            sortConfig.direction === "ascending"
        ) {
            direction = "descending";
        }
        setSortConfig({ key: columnKey, direction });
    };

    const sortedKeys = [...keys].sort((a, b) => {
        const keyA = a[sortConfig.key as keyof ApiKey];
        const keyB = b[sortConfig.key as keyof ApiKey];
        if (keyA === null || keyA === undefined) return 1;
        if (keyB === null || keyB === undefined) return -1;
        if (keyA < keyB) {
            return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (keyA > keyB) {
            return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
    });

    const filteredKeys = sortedKeys.filter(
        (k) =>
            k.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (k.discordid &&
                k.discordid.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (k.username &&
                k.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // PAGINATION LOGIC
    const totalPages = Math.max(1, Math.ceil(filteredKeys.length / KEYS_PER_PAGE));
    const paginatedKeys = filteredKeys.slice(
        (currentPage - 1) * KEYS_PER_PAGE,
        currentPage * KEYS_PER_PAGE
    );

    // Reset to page 1 if filter/search changes and currentPage is out of range
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(1);
    }, [searchTerm, filteredKeys.length, totalPages, currentPage]);

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "Invalid Date";
        }
    };

    const getSortIcon = (columnKey: keyof ApiKey | "actions") => {
        if (sortConfig.key !== columnKey || columnKey === "actions") {
            return (
                <ChevronDown
                    size={16}
                    className="ml-1 opacity-30 group-hover:opacity-100"
                />
            );
        }
        return sortConfig.direction === "ascending" ? (
            <ChevronUp size={16} className="ml-1" />
        ) : (
            <ChevronDown size={16} className="ml-1" />
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4 text-slate-300">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500 mb-4"></div>
                <p className="text-xl">Loading Dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-6 text-red-400">
                <ShieldOff size={64} className="mb-4 text-red-500" />
                <h2 className="text-2xl font-semibold mb-2">
                    Oops! Something went wrong.
                </h2>
                <p className="text-lg mb-4">{error}</p>
                <button
                    onClick={() => {
                        setError(null);
                        const loadKeys = async () => {
                            try {
                                setLoading(true);
                                const data = await fetchKeysAPI();
                                setKeys(
                                    data.map((k) => ({
                                        ...k,
                                        id: k.id || k.key,
                                    }))
                                );
                            } catch (err) {
                                if (err instanceof Error) {
                                    setError(err.message);
                                } else {
                                    setError(
                                        "An unknown error occurred during retry"
                                    );
                                }
                            } finally {
                                setLoading(false);
                            }
                        };
                        loadKeys();
                    }}
                    className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-150"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8 text-slate-100 font-sans">
            <header className="mb-8">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center py-4">
                    <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                        <KeyRound size={40} className="text-sky-400" />
                        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">
                            Admin Key Management
                        </h1>
                    </div>
                    <Link
                        href={"/admin/generate-key"}
                        className="flex items-center space-x-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-sky-500/50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
                    >
                        <PlusCircle size={20} />
                        <span>Generate New Key</span>
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto">
                <div className="mb-6 p-4 bg-slate-800 rounded-xl shadow-2xl">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search keys, Discord ID, or Username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors placeholder-slate-400"
                        />
                        <Search
                            size={20}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                        />
                    </div>
                </div>

                <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
                    <div className="p-6 border-b border-slate-700">
                        <h3 className="text-2xl font-semibold text-slate-100 flex items-center">
                            <Users size={28} className="mr-3 text-sky-400" />
                            Manage Access Keys
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                            Total Keys: {keys.length} | Filtered:{" "}
                            {filteredKeys.length}
                        </p>
                    </div>

                    {filteredKeys.length === 0 && !loading ? (
                        <div className="p-10 text-center text-slate-400">
                            <Search
                                size={48}
                                className="mx-auto mb-4 opacity-50"
                            />
                            <p className="text-xl">
                                No keys found matching your criteria.
                            </p>
                            {searchTerm && (
                                <p className="text-sm mt-1">
                                    Try adjusting your search term.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto text-sm">
                                <thead className="bg-slate-700/50">
                                    <tr>
                                        {[
                                            {
                                                label: "Key",
                                                key: "key" as keyof ApiKey,
                                                icon: (
                                                    <KeyRound
                                                        size={16}
                                                        className="mr-1.5"
                                                    />
                                                ),
                                            },
                                            {
                                                label: "Discord ID",
                                                key: "discordid" as keyof ApiKey,
                                                icon: (
                                                    <Users
                                                        size={16}
                                                        className="mr-1.5"
                                                    />
                                                ),
                                            },
                                            {
                                                label: "Username",
                                                key: "username" as keyof ApiKey,
                                                icon: (
                                                    <Users
                                                        size={16}
                                                        className="mr-1.5"
                                                    />
                                                ),
                                            },
                                            {
                                                label: "Status",
                                                key: "isused" as keyof ApiKey,
                                                icon: (
                                                    <ShieldCheck
                                                        size={16}
                                                        className="mr-1.5"
                                                    />
                                                ),
                                            },
                                            {
                                                label: "Created At",
                                                key: "created_at" as keyof ApiKey,
                                                icon: (
                                                    <PlusCircle
                                                        size={16}
                                                        className="mr-1.5"
                                                    />
                                                ),
                                            },
                                            {
                                                label: "Actions",
                                                key: "actions" as const,
                                                icon: (
                                                    <Edit3
                                                        size={16}
                                                        className="mr-1.5"
                                                    />
                                                ),
                                            },
                                        ].map((col) => (
                                            <th
                                                key={col.key}
                                                scope="col"
                                                className={`px-5 py-4 text-left font-medium text-slate-300 tracking-wider group ${
                                                    col.key !== "actions"
                                                        ? "cursor-pointer hover:bg-slate-600/50 transition-colors"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    handleSort(col.key)
                                                }
                                            >
                                                <div className="flex items-center">
                                                    {col.icon} {col.label}
                                                    {col.key !== "actions" &&
                                                        getSortIcon(col.key)}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {paginatedKeys.map((k: ApiKey) => (
                                        <tr
                                            key={k.id}
                                            className="hover:bg-slate-700/30 transition-colors duration-150 ease-in-out"
                                        >
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <KeyRound
                                                        size={18}
                                                        className={`mr-2 ${
                                                            k.isused
                                                                ? "text-slate-500"
                                                                : "text-sky-400"
                                                        }`}
                                                    />
                                                    <span className="font-mono text-xs text-slate-300">
                                                        {k.key}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap text-slate-300">
                                                {k.discordid || "N/A"}
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap text-slate-300">
                                                {k.username || "N/A"}
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold leading-5 ${
                                                        k.isused
                                                            ? "bg-red-500/20 text-red-400"
                                                            : "bg-green-500/20 text-green-400"
                                                    }`}
                                                >
                                                    {k.isused ? (
                                                        <ShieldOff
                                                            size={14}
                                                            className="mr-1.5"
                                                        />
                                                    ) : (
                                                        <ShieldCheck
                                                            size={14}
                                                            className="mr-1.5"
                                                        />
                                                    )}
                                                    {k.isused
                                                        ? "Used"
                                                        : "Active"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap text-slate-400">
                                                {formatDate(k.created_at)}
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() =>
                                                        handleDeleteKey(k.id)
                                                    }
                                                    title="Delete Key"
                                                    className="p-2 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-500/10 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {/* PAGINATION CONTROLS */}
                    {filteredKeys.length > KEYS_PER_PAGE && (
                        <div className="flex justify-center items-center gap-4 py-6 bg-slate-900 border-t border-slate-700">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded bg-slate-700 text-slate-100 disabled:opacity-50 flex items-center"
                            >
                                <ChevronLeft size={18} className="mr-1" />
                                Previous
                            </button>
                            <span className="text-slate-300">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded bg-slate-700 text-slate-100 disabled:opacity-50 flex items-center"
                            >
                                Next
                                <ChevronRight size={18} className="ml-1" />
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
