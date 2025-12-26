import { PartialBlock } from "@blocknote/core";

/**
 * Safely parses BlockNote JSON content
 * @param content - The JSON string containing BlockNote blocks
 * @returns Array of PartialBlock or empty array on error
 */
export function parseBlockNoteContent(
  content: string | null | undefined,
): PartialBlock[] {
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
