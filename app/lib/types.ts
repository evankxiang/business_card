export type ProcessingStatus = 'pending' | 'processing' | 'done' | 'failed';

export interface BusinessCardData {
    id: string;
    source_filename: string;
    status: ProcessingStatus;
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    title: string | null;
    website: string | null;
    address: string | null;
    notes: string | null;
    user_notes: string | null;
    confidence_score: number;
    original_image_url?: string;
    poc_name?: string | null; // Who collected this contact
}

export interface ExtractedData {
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    title: string | null;
    website: string | null;
    address: string | null;
    notes: string | null;
    confidence_score: number;
}
