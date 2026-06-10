import { fetchJSON } from '../utils/api';

export interface UnitStatus {
  uk3?: string;
}

export const unitService = {
  async find(unit: string) {
    return fetchJSON<string>(`/units/${unit}/find`, {}, { method: 'GET' });
  },

  async getStatus(unit: string) {
    return fetchJSON<UnitStatus>(
      `/units/${unit}/status`,
      {},
      { method: 'GET' },
    );
  },

  async getParent(unit: string) {
    return fetchJSON<string>(`/units/${unit}/Parent`, {}, { method: 'GET' });
  },

  async getEvents(unit: string) {
    return fetchJSON<string[]>(`/units/${unit}/events`, {}, { method: 'GET' });
  },

  async getChildren(unit: string) {
    return fetchJSON<string[]>(
      `/units/${unit}/children`,
      {},
      { method: 'GET' },
    );
  },

  async PerformHoldRouteCheck(unit: string, process: string) {
    return fetchJSON<string>(
      `/units/${unit}/PerformHoldRouteCheck/${process}`,
      {},
      { method: 'GET' },
    );
  },

  async findParentTopcover(unit: string): Promise<string> {
    let currentUnit = unit;
    const maxhoops = 5;
    let count = 0;

    while (count < maxhoops) {
      const statusResponse = await this.getStatus(currentUnit);
      const currentStatus = statusResponse.data;

      console.log(`Status jednostki ${currentUnit}:`, currentStatus);
      if (currentStatus?.uk3 === 'TOPCOVER') {
        return currentUnit;
      }

      count++;
      if (count === maxhoops) {
        throw new Error(
          'Osiągnięto maksymalną liczbę kroków podczas szukania rodzica (TOPCOVER).',
        );
      }

      const parentResponse = await this.getParent(currentUnit);
      const parent = parentResponse.data;
      console.log('Znaleziony rodzic:', parent);

      if (parent && parent !== '') {
        currentUnit = parent;
      } else {
        throw new Error('Brak rodzica, a jednostka nie jest TOPCOVER');
      }
    }
    return currentUnit;
  },

  async dataEntry(
    serialNumber: string,
    process: string,
    station: string,
    dcstring: string,
  ) {
    return fetchJSON<string[]>(
      `/units/${serialNumber}/dataEntry`,
      { process, station, dcstring },
      { method: 'POST' },
    );
  },
};
