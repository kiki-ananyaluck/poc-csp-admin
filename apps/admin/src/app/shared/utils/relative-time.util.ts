/** Thai month abbreviations (Buddhist calendar display) */
const TH_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

/**
 * Returns a human-readable relative time string in Thai.
 *
 * Logic:
 * < 1 min  → "เมื่อสักครู่"
 * < 1 hr   → "X นาทีที่แล้ว"
 * < 24 hrs → "X ชั่วโมงที่แล้ว"
 * < 7 days → "X วันที่แล้ว"
 * ≥ 7 days → "12 ม.ค. 2569, 14:32 น." (Thai Buddhist year = AD + 543)
 */
export function getRelativeTime(isoDate: string): string {
  const now = Date.now();
  const past = new Date(isoDate).getTime();
  const diffMs = now - past;

  if (diffMs < 0) return 'เมื่อสักครู่';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'เมื่อสักครู่';
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  if (diffHr < 24) return `${diffHr} ชั่วโมงที่แล้ว`;
  if (diffDay < 7) return `${diffDay} วันที่แล้ว`;

  const date = new Date(isoDate);
  const day = date.getDate();
  const month = TH_MONTHS[date.getMonth()];
  const buddhistYear = date.getFullYear() + 543;
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');

  return `${day} ${month} ${buddhistYear}, ${hh}:${mm} น.`;
}
