// Id corto estable (sin dependencia externa)
export function rid(prefix = ""): string {
  const s = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  return (prefix ? prefix + "_" : "") + s;
}
