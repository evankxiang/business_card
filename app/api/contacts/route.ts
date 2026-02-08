import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

// GET all contacts
export async function GET() {
    try {
        const { data, error } = await supabase
            .from("contacts")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error fetching contacts:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch contacts" },
            { status: 500 }
        );
    }
}

// POST new contact(s)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Support both single contact and array of contacts
        const contacts = Array.isArray(body) ? body : [body];

        const { data, error } = await supabase
            .from("contacts")
            .insert(contacts)
            .select();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error saving contact:", error);
        return NextResponse.json(
            { error: error.message || "Failed to save contact" },
            { status: 500 }
        );
    }
}
