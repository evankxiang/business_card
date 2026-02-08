import { NextRequest, NextResponse } from "next/server";
import { extractBusinessCardData } from "@/app/lib/daedalus";
import { normalizeEmail, normalizePhone } from "@/app/lib/utils";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
        if (!validTypes.includes(file.type)) {
            console.warn(`Invalid file type uploaded: ${file.type}`);
        }

        // Extract data - now returns an array of contacts
        const dataArray = await extractBusinessCardData(file);

        // Normalize each contact
        const normalizedArray = dataArray.map(data => {
            if (data.phone) {
                data.phone = normalizePhone(data.phone);
            }
            if (data.email) {
                data.email = normalizeEmail(data.email);
            }
            return data;
        });

        return NextResponse.json(normalizedArray);
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process image" },
            { status: 500 }
        );
    }
}
