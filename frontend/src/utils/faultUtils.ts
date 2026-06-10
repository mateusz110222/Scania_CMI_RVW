export interface FaultItem {
  date: string;
  fault_code: string;
  imageUrl: string;
}

export const check_CMICHECK_present = (events: Array<string>) =>
  events.some((event) => event.startsWith('CMICHECK|'));

export const extractFaultsFromEvents = (events: string[]) => {
  const uniqueFaultsMap = new Map<
    string,
    { date: string; fault_code: string }
  >();

  for (const event of events) {
    if (!event) continue;

    const parts = event.split('|');
    const status = Number(parts[5]);

    if (parts[0] === 'CMICHECK' && (status === 2 || status === 6)) {
      const date = parts[4].split('.')[0];

      parts.forEach((part) => {
        if (part.includes('_NOK')) {
          const fault_code = part.split('_').pop()!;

          const uniqueKey = `${date}-${fault_code}`;
          if (!uniqueFaultsMap.has(uniqueKey)) {
            uniqueFaultsMap.set(uniqueKey, { date, fault_code });
          }
        }
      });
      break;
    }
  }

  return Array.from(uniqueFaultsMap.values());
};
