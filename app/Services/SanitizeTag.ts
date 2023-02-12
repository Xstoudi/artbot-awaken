export default function sanitizeTag(tag: string) {
  return tag
    .toLowerCase()
    .trim()
    .replaceAll(' ', '_')
    .replaceAll('-', '_')
    .replaceAll('(', '')
    .replaceAll(')', '')
}
