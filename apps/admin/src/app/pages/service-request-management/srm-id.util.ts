/**
 * Encodes a flowInstanceId to a URL-safe Base64 string for use in route params.
 * Use decodeFlowInstanceId() on the detail page to recover the original value.
 */
export function encodeFlowInstanceId(id: string): string {
  return btoa(encodeURIComponent(id))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decodes a URL-safe Base64 string back to the original flowInstanceId.
 */
export function decodeFlowInstanceId(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return decodeURIComponent(atob(padded));
}

/**
 * Encodes taskId to URL-safe Base64 for query param usage.
 */
export function encodeTaskIdToken(taskId: string): string {
  const normalized = taskId.trim();
  if (!normalized) {
    return '';
  }

  return encodeFlowInstanceId(normalized);
}

/**
 * Decodes taskId from URL-safe Base64 token.
 */
export function decodeTaskIdToken(token: string): string {
  const value = token.trim();
  if (!value) {
    throw new Error('Empty task token');
  }

  return decodeFlowInstanceId(value);
}
