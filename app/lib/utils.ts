import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function normalizePhone(phone: string): string {
    // Basic E.164 normalization attempt
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");

    // If it starts with 1 and looks like US (11 digits), format it
    if (digits.length === 11 && digits.startsWith("1")) {
        return `+${digits}`;
    }

    // If 10 digits, assume US and prepend +1
    if (digits.length === 10) {
        return `+1${digits}`;
    }

    // If it starts with +, keep it as is (removing spaces/dashes)
    if (phone.trim().startsWith("+")) {
        return `+${digits}`;
    }

    // Fallback: return original if unsure, or just digits
    return phone.trim();
}

export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}
