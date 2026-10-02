export function isScannedOrUnreadable(text: string): boolean {
  if (!text || typeof text !== 'string') return true;
  const trimmed = text.trim();
  if (trimmed.length < 50) return true;

  // Count alphanumeric characters vs garbage
  const alphaNumericMatches = trimmed.match(/[a-zA-Z0-9]/g);
  if (!alphaNumericMatches || alphaNumericMatches.length < 30) {
    return true;
  }

  return false;
}
