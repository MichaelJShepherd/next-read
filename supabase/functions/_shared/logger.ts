type Level = 'info' | 'warn' | 'error';

export function log(
  level: Level,
  fn: string,
  event: string,
  data?: Record<string, unknown>,
): void {
  const entry = JSON.stringify({ level, fn, event, ts: new Date().toISOString(), ...data });
  if (level === 'error') console.error(entry);
  else if (level === 'warn') console.warn(entry);
  else console.log(entry);
}
