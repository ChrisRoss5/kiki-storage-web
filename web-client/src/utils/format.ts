export const units = ["B", "KB", "MB", "GB", "TB"] as const;

export function toBytes(size: number, suffix: (typeof units)[number]) {
  return size * 1024 ** units.indexOf(suffix);
}

export function formatSize(bytes: number) {
  if (bytes == 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  const decimals = i > 2 ? 2 : i > 1 ? 1 : 0;
  return `${+size.toFixed(decimals)} ${units[i]}`;
}

export function formatDate(date: Date, locales: string) {
  return date.toLocaleString(locales, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
