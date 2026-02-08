"use client";

import React, { useCallback, useState } from "react";
import { UploadCloud, Image as ImageIcon, X, Play, Loader2 } from "lucide-react";
import { GlassPanel } from "./GlassPanel";
import { cn } from "@/app/lib/utils";

interface UploadZoneProps {
    onFilesSelected: (files: File[]) => void;
    disabled?: boolean;
}

export function UploadZone({ onFilesSelected, disabled }: UploadZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [stagedFiles, setStagedFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled && !isProcessing) setIsDragOver(true);
    }, [disabled, isProcessing]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            if (disabled || isProcessing) return;

            const files = Array.from(e.dataTransfer.files).filter((file) =>
                file.type.startsWith("image/")
            );
            if (files.length > 0) {
                setStagedFiles((prev) => [...prev, ...files]);
            }
        },
        [disabled, isProcessing]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (disabled || isProcessing || !e.target.files) return;
            const files = Array.from(e.target.files).filter((file) =>
                file.type.startsWith("image/")
            );
            if (files.length > 0) {
                setStagedFiles((prev) => [...prev, ...files]);
            }
            e.target.value = "";
        },
        [disabled, isProcessing]
    );

    const removeFile = (index: number) => {
        setStagedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const clearAll = () => {
        setStagedFiles([]);
    };

    const processAll = async () => {
        if (stagedFiles.length === 0) return;
        setIsProcessing(true);
        onFilesSelected(stagedFiles);
        setStagedFiles([]);
        setIsProcessing(false);
    };

    return (
        <div className="space-y-4">
            <GlassPanel
                active={isDragOver}
                className={cn(
                    "cursor-pointer p-10 text-center transition-all hover:bg-[rgba(255,255,255,0.5)] dark:hover:bg-[rgba(255,255,255,0.05)]",
                    (disabled || isProcessing) && "opacity-50 cursor-not-allowed"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && !isProcessing && document.getElementById("file-upload")?.click()}
            >
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInput}
                    disabled={disabled || isProcessing}
                />
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className={cn(
                        "rounded-full p-4 transition-colors",
                        isDragOver ? "bg-blue-500/20 text-blue-500" : "bg-white/20 dark:bg-white/5 text-gray-500"
                    )}>
                        {isDragOver ? <UploadCloud size={48} /> : <ImageIcon size={48} />}
                    </div>
                    <div className="space-y-1">
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {isDragOver ? "Drop cards here" : "Click or drag business cards"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Supports JPG, PNG, HEIC
                        </p>
                    </div>
                </div>
            </GlassPanel>

            {/* Staged Files List */}
            {stagedFiles.length > 0 && (
                <GlassPanel className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-sm">
                            {stagedFiles.length} file{stagedFiles.length !== 1 ? "s" : ""} ready to process
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={clearAll}
                                className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                onClick={processAll}
                                disabled={isProcessing}
                                className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Play className="w-4 h-4" />
                                )}
                                Process All
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {stagedFiles.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full text-sm"
                            >
                                <span className="max-w-[150px] truncate">{file.name}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                    }}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </GlassPanel>
            )}
        </div>
    );
}
