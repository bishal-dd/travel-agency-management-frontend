const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

export function formatDate(value: Date | string) {
  return dateFormatter.format(new Date(value));
}

export function initialsOf(nameOrEmail: string) {
  const parts = nameOrEmail.split("@")[0].split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

export function firstNameOf(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
