import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

// UPDATE a contact
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        console.log("Updating contact:", id, body);

        const { data, error } = await supabase
            .from("contacts")
            .update(body)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error updating contact:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update contact" },
            { status: 500 }
        );
    }
}

// DELETE a contact
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        console.log("Deleting contact:", id);

        const { error } = await supabase
            .from("contacts")
            .delete()
            .eq("id", id);

        if (error) throw error;

        console.log("Contact deleted successfully:", id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting contact:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete contact" },
            { status: 500 }
        );
    }
}
