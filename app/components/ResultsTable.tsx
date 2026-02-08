"use client";

import React, { useState } from "react";
import { Download, X, AlertCircle, Check, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { GlassPanel } from "./GlassPanel";
import { BusinessCardData, ExtractedData } from "@/app/lib/types";

interface ResultsTableProps {
    data: BusinessCardData[];
    pocName: string;
    onUpdate: (id: string, field: keyof BusinessCardData, value: string) => void;
    onRemove: (id: string) => void;
    onClearAll: () => void;
}

export function ResultsTable({ data, pocName, onUpdate, onRemove, onClearAll }: ResultsTableProps) {
    const [exporting, setExporting] = useState(false);

    const handleExport = (type: "csv" | "xlsx") => {
        setExporting(true);
        try {
            const exportData = data.map((item) => ({
                "POC": item.poc_name || pocName || "",
                "Full Name": item.full_name || "",
                "First Name": item.first_name || "",
                "Last Name": item.last_name || "",
                "Email": item.email || "",
                "Phone": item.phone || "",
                "Company": item.company || "",
                "Title": item.title || "",
                "Website": item.website || "",
                "Address": item.address || "",
                "User Notes": item.user_notes || "",
                "Source File": item.source_filename,
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");

            const colWidths = Object.keys(exportData[0] || {}).map(() => ({ wch: 20 }));
            worksheet["!cols"] = colWidths;

            const dateStr = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
            const filename = `business_cards_${dateStr}.${type}`;

            if (type === "csv") {
                const csvContent = XLSX.utils.sheet_to_csv(worksheet);
                const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename);
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                XLSX.writeFile(workbook, filename);
            }
        } catch (error) {
            console.error("Export failed", error);
            alert("Failed to export data");
        } finally {
            setExporting(false);
        }
    };

    if (data.length === 0) return null;

    return (
        <GlassPanel className="p-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Extracted Contacts ({data.length})</h2>
                <div className="flex gap-2">
                    <button
                        onClick={onClearAll}
                        className="px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={() => handleExport("csv")}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-1.5 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        CSV
                    </button>
                    <button
                        onClick={() => handleExport("xlsx")}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-1.5 bg-black/80 dark:bg-white/90 text-white dark:text-black rounded-md hover:bg-black/70 dark:hover:bg-white/80 transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Export XLSX
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-black/5 dark:bg-white/5">
                        <tr>
                            <th className="px-4 py-3 rounded-tl-lg">Status</th>
                            <th className="px-4 py-3">POC</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Company</th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">User Notes</th>
                            <th className="px-4 py-3 rounded-tr-lg w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr key={row.id} className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 w-32">
                                    <StatusBadge status={row.status} />
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">
                                    {row.poc_name || pocName || "-"}
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={row.full_name || ""}
                                        onChange={(e) => onUpdate(row.id, "full_name", e.target.value)}
                                        className="bg-transparent w-full focus:outline-none focus:border-b focus:border-blue-500 placeholder-gray-400"
                                        placeholder="Name"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={row.email || ""}
                                        onChange={(e) => onUpdate(row.id, "email", e.target.value)}
                                        className="bg-transparent w-full focus:outline-none focus:border-b focus:border-blue-500 placeholder-gray-400"
                                        placeholder="Email"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={row.phone || ""}
                                        onChange={(e) => onUpdate(row.id, "phone", e.target.value)}
                                        className="bg-transparent w-full focus:outline-none focus:border-b focus:border-blue-500 placeholder-gray-400"
                                        placeholder="Phone"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={row.company || ""}
                                        onChange={(e) => onUpdate(row.id, "company", e.target.value)}
                                        className="bg-transparent w-full focus:outline-none focus:border-b focus:border-blue-500 placeholder-gray-400"
                                        placeholder="Company"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={row.title || ""}
                                        onChange={(e) => onUpdate(row.id, "title", e.target.value)}
                                        className="bg-transparent w-full focus:outline-none focus:border-b focus:border-blue-500 placeholder-gray-400"
                                        placeholder="Title"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={row.user_notes || ""}
                                        onChange={(e) => onUpdate(row.id, "user_notes", e.target.value)}
                                        className="bg-transparent w-full focus:outline-none focus:border-b focus:border-blue-500 placeholder-gray-400"
                                        placeholder="Add notes..."
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => onRemove(row.id)}
                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </GlassPanel>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "pending":
            return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Pending</span>;
        case "processing":
            return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 animate-pulse"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing</span>;
        case "done":
            return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"><Check className="w-3 h-3 mr-1" /> Done</span>;
        case "failed":
            return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"><AlertCircle className="w-3 h-3 mr-1" /> Failed</span>;
        default:
            return null;
    }
}
