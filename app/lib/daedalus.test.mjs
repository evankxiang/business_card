import assert from "node:assert";
import test from "node:test";

// Mocking the parseExtractedJSON function logic since it's not exported directly or we copy it for testing
function parseExtractedJSON(content) {
    try {
        return JSON.parse(content);
    } catch (e) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (innerE) {
                return null;
            }
        }
        return null;
    }
}

test("JSON Parsing - valid JSON", () => {
    const input = '{"name": "John"}';
    const result = parseExtractedJSON(input);
    assert.deepStrictEqual(result, { name: "John" });
});

test("JSON Parsing - markdown wrapped", () => {
    const input = '```json\n{"name": "John"}\n```';
    const result = parseExtractedJSON(input);
    assert.deepStrictEqual(result, { name: "John" });
});

test("JSON Parsing - surrounded by text", () => {
    const input = 'Here is the JSON: {"name": "John"} hope it helps.';
    const result = parseExtractedJSON(input);
    assert.deepStrictEqual(result, { name: "John" });
});

test("JSON Parsing - invalid JSON", () => {
    const input = 'This is not JSON';
    const result = parseExtractedJSON(input);
    assert.strictEqual(result, null);
});
