export function isTimeOverlapping(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function htmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

export function linkify(text: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    // Only allow http and https protocols
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return htmlEscape(url);
    }
    const escapedUrl = htmlEscape(url);
    return `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer" class="text-teal-600 hover:text-teal-800 underline transition-colors cursor-pointer">${escapedUrl}</a>`;
  });
}
