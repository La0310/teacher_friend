/**
 * Simple text statistics helpers.
 */

export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function countParagraphs(text) {
  return text.trim().split(/\n\s*\n/).filter(Boolean).length || 1;
}
