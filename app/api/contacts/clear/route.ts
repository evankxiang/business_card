import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

// DELETE all contacts
export async function DELETE() {
    try {
        // Delete all rows from contacts table
        const { error } = await supabase
            .from("contacts")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000"); // This matches all rows

        if (error) throw error;

        return NextResponse.json({ success: true, message: "All contacts deleted" });
    } catch (error: any) {
        console.error("Error clearing contacts:", error);
        return NextResponse.json(
            { error: error.message || "Failed to clear contacts" },
            { status: 500 }
        );
    }
}
