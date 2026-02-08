import { ExtractedData } from "./types";

const SYSTEM_PROMPT = `
You are an expert business card data extractor.
The image may contain ONE or MULTIPLE business cards.
Output ONLY valid JSON - an ARRAY of contacts, even if there's just one card.

Schema for each contact in the array:
{
  "full_name": string|null,
  "first_name": string|null,
  "last_name": string|null,
  "email": string|null,
  "phone": string|null,
  "company": string|null,
  "title": string|null,
  "website": string|null,
  "address": string|null,
  "notes": string|null,
  "confidence_score": number
}

Rules:
- ALWAYS return a JSON array, e.g. [{...}] or [{...}, {...}]
- Use null when unknown.
- confidence_score between 0 and 1.
- If multiple phones/emails on ONE card, choose primary and put others in notes.
- If the image has multiple cards, return one object per card.
- Do NOT output markdown code blocks (like \`\`\`json), just the raw JSON array.
`;

const DAEDALUS_API_URL = "https://api.dedaluslabs.ai/v1/chat/completions";

export async function extractBusinessCardData(file: File): Promise<ExtractedData[]> {
    const apiKey = process.env.DAEDALUS_API_KEY;

    if (!apiKey) {
        throw new Error("DAEDALUS_API_KEY is not configured in .env.local");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64Image}`;

    try {
        const response = await fetch(DAEDALUS_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "anthropic/claude-opus-4-5",
                messages: [
                    {
                        role: "system",
                        content: SYSTEM_PROMPT,
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Extract ALL contact information from the business card(s) in this image. Return a JSON array.",
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: dataUrl,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 2000,
                temperature: 0,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Daedalus API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error("No content received from Daedalus");
        }

        return parseExtractedJSON(content);
    } catch (error) {
        console.error("Extraction failed:", error);
        throw error;
    }
}

function parseExtractedJSON(content: string): ExtractedData[] {
    const defaultEmpty: ExtractedData = {
        full_name: null,
        first_name: null,
        last_name: null,
        email: null,
        phone: null,
        company: null,
        title: null,
        website: null,
        address: null,
        notes: null,
        confidence_score: 0,
    };

    try {
        const parsed = JSON.parse(content);
        // If it's an array, return it. If it's a single object, wrap it.
        if (Array.isArray(parsed)) {
            return parsed;
        } else {
            return [parsed];
        }
    } catch (e) {
        // Try to extract JSON array or object from text
        const arrayMatch = content.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            try {
                return JSON.parse(arrayMatch[0]);
            } catch (innerE) {
                console.warn("Failed to parse array:", innerE);
            }
        }

        const objectMatch = content.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            try {
                return [JSON.parse(objectMatch[0])];
            } catch (innerE) {
                console.warn("Failed to parse object:", innerE);
            }
        }

        console.warn("JSON parsing failed, returning raw content in notes.");
        return [{
            ...defaultEmpty,
            notes: `FAILED TO PARSE JSON. RAW OUTPUT: ${content}`,
        }];
    }
}
