// Firebase Storage is disabled (requires Blaze plan).
// These are no-op stubs so hooks that reference storage don't break.

export async function uploadFile(path: string, file: File): Promise<string> {
  console.warn('Firebase Storage not enabled — using placeholder URL');
  return `https://placehold.co/800x400/FACC15/000000?text=${encodeURIComponent(file.name)}`;
}

export async function getFileURL(path: string): Promise<string> {
  return `https://placehold.co/800x400/2DD4BF/000000?text=Image`;
}

export async function deleteFile(path: string): Promise<void> {
  console.warn('Firebase Storage not enabled — delete skipped');
}
