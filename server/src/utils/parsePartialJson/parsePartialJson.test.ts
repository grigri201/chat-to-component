import { expect, test, describe } from "bun:test";
import { parsePartialJson } from "./parsePartialJson";

describe("parsePartialJson", () => {
    test("should parse valid JSON correctly", () => {
        const validJson = '{"name": "test", "value": 123}';
        expect(parsePartialJson(validJson)).toEqual({ name: "test", value: 123 });
    });

    test("should handle incomplete objects", () => {
        const incompleteJson = '{"name": "test", "value": 123';
        expect(parsePartialJson(incompleteJson)).toEqual({ name: "test", value: 123 });
    });

    test("should handle incomplete arrays", () => {
        const incompleteArray = '[1, 2, 3';
        expect(parsePartialJson(incompleteArray)).toEqual([1, 2, 3]);
    });

    test("should handle nested incomplete structures", () => {
        const nestedIncomplete = '{"items": [1, 2, {"name": "test"';
        expect(parsePartialJson(nestedIncomplete)).toEqual({
            items: [1, 2, { name: "test" }]
        });
    });

    test("should handle unclosed strings", () => {
        const unclosedString = '{"name": "test';
        expect(parsePartialJson(unclosedString)).toEqual({ name: "test" });
    });

    test("should handle escaped characters in strings", () => {
        const escapedChars = '{"text": "line1\\nline2"}';
        expect(parsePartialJson(escapedChars)).toEqual({ text: "line1\nline2" });
    });

    test("should handle newlines in incomplete strings", () => {
        const multilineString = '{"text": "line1\nline2';
        expect(parsePartialJson(multilineString)).toEqual({ text: "line1\nline2" });
    });

    test("should return null for severely malformed JSON", () => {
        const malformedJson = '{"name": test" value: }';
        expect(parsePartialJson(malformedJson)).toBeNull();
    });

    test("should handle empty input", () => {
        expect(parsePartialJson("")).toBeNull();
    });

    test("should handle mismatched brackets", () => {
        const mismatchedBrackets = '{"name": "test"}]';
        expect(parsePartialJson(mismatchedBrackets)).toBeNull();
    });
});
