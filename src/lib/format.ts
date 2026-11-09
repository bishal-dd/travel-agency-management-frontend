const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

export function formatDate(value: Date | string) {
  return dateFormatter.format(new Date(value));
}

export function initialsOf(nameOrEmail: string) {
  const parts = nameOrEmail
    .split("@")[0]
    .split(/[\s._-]+/)
    .filter(Boolean);
  const letters =
    parts.length > 1
      ? parts[0][0] + parts[1][0]
      : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

export function firstNameOf(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** "BTN 1,500" / "$45.50" / "₹2,500" — falls back to "1500 XYZ" for codes the browser doesn't know. */
export function formatPrice(price: string, currency: string) {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return `${price} ${currency}`;
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("en")} ${currency}`;
  }
}

/** 90 → "1 h 30 min", 480 → "8 h", 45 → "45 min". */
export function formatDuration(minutes: number | null) {
  if (minutes == null) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}
