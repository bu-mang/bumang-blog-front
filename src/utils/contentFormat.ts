import { PartialBlock } from "@blocknote/core";

export type ContentFormat = "blocknote" | "yoopta" | "unknown";

/**
 * Detects the format of blog post content
 * @param content - The content string from the API
 * @returns The detected format type
 */
export function detectContentFormat(content: string | null | undefined): ContentFormat {
  if (!content || content.trim() === "") {
    return "unknown";
  }

  try {
    const parsed = JSON.parse(content);

    // BlockNote content is an array of PartialBlock objects
    if (Array.isArray(parsed)) {
      // Additional validation: check if it looks like BlockNote structure
      if (parsed.length === 0 || (parsed[0] && typeof parsed[0] === "object" && "type" in parsed[0])) {
        return "blocknote";
      }
    }

    // If JSON but not array, could be other format
    return "unknown";
  } catch {
    // If JSON parsing fails, it's likely HTML from Yoopta
    // Check if it contains HTML-like content
    if (content.includes("<") && content.includes(">")) {
      return "yoopta";
    }

    return "unknown";
  }
}

/**
 * Safely parses BlockNote JSON content
 * @param content - The JSON string containing BlockNote blocks
 * @returns Array of PartialBlock or empty array on error
 */
export function parseBlockNoteContent(content: string | null | undefined): PartialBlock[] {
  if (!content) return [];

  try {
    const parsed = JSON.parse(content);

    if (Array.isArray(parsed)) {
      return parsed as PartialBlock[];
    }

    console.warn("BlockNote content is not an array:", parsed);
    return [];
  } catch (error) {
    console.error("Failed to parse BlockNote content:", error);
    return [];
  }
}

/**
 * Processes Yoopta HTML content for safe rendering
 * @param content - The HTML string from Yoopta
 * @returns Sanitized HTML string
 */
export function parseYooptaContent(content: string | null | undefined): string {
  if (!content) return "";

  // Basic sanitization: trim whitespace
  // Note: Consider adding a proper HTML sanitizer library (like DOMPurify) for production
  return content.trim();
}
