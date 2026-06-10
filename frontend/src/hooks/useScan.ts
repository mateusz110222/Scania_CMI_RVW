import { useCallback, useState } from 'react';
import { unitService } from '../services/unitService';
import {
  check_CMICHECK_present,
  extractFaultsFromEvents,
} from '../utils/faultUtils';
import type { FaultItem } from '../utils/faultUtils';
import { extractError } from '../utils/errorUtils';
import { fetchSVGText } from '../utils/api';

interface UseScanReturn {
  handleScanSubmit: (
    unit: string,
  ) => Promise<
    | { faults: FaultItem[]; unit: string; error?: never }
    | { error: { title: string; text: string } }
    | null
  >;
  isLoading: boolean;
  error: { title: string; text: string } | null;
  clearError: () => void;
}

export const useScan = (): UseScanReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ title: string; text: string } | null>(
    null,
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleScanSubmit = useCallback(async (unit: string) => {
    if (!unit.trim()) return null;

    setError(null);
    setIsLoading(true);

    try {
      let children = unit;

      await unitService.find(children);

      const parent = await unitService.findParentTopcover(children);

      const unitStatus = await unitService.getStatus(parent);
      console.table(unitStatus.data);

      if (unitStatus.data?.uk3 === 'TOPCOVER') {
        const response = await unitService.getChildren(parent);
        console.log('Dzieci:', response.data);

        if (response.data && response.data.length > 0) {
          children = response.data[0];
        }
      }

      const routecheckUnit = await Promise.any([
        unitService
          .PerformHoldRouteCheck(children, 'CMI_RVW')
          .then(() => children),
        unitService.PerformHoldRouteCheck(parent, 'CMI_RVW').then(() => parent),
      ]).catch((err: unknown) => {
        if (err instanceof AggregateError) {
          throw err.errors[1] ?? err;
        }

        throw err;
      });

      let eventsResponse = await unitService.getEvents(parent);

      if (!check_CMICHECK_present(eventsResponse.data || [])) {
        eventsResponse = await unitService.getEvents(children);
      }

      if (!check_CMICHECK_present(eventsResponse.data || [])) {
        throw new Error("Didn't find CMICHECK events");
      }

      const events = eventsResponse.data || [];
      console.log('Eventy:', events);

      const ExtractedFaults = extractFaultsFromEvents(events);

      if (ExtractedFaults.length === 0) {
        throw new Error('Nie znaleziono kodów błędu');
      }

      console.log('Wyciągnięte błędy:', ExtractedFaults);

      const loadedFaults: FaultItem[] = [];
      for (const item of ExtractedFaults) {
        const svgsrc = await fetchSVGText(
          `/file/${item.date}/overlay_${children}_${item.fault_code}_NOK.svg`,
          item.date,
        );
        loadedFaults.push({ ...item, imageUrl: svgsrc });
      }

      if (loadedFaults.length === 0) {
        throw new Error('Nie udało się pobrać żadnych zdjęć z serwera.');
      }

      return { faults: loadedFaults, unit: routecheckUnit };
    } catch (err: unknown) {
      console.error(err);
      const { message, details } = extractError(err);
      const errorObj = {
        title: 'Błąd weryfikacji',
        text: details ? `${message}: ${details}` : message,
      };
      setError(errorObj);
      return { error: errorObj };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    handleScanSubmit,
    isLoading,
    error,
    clearError,
  };
};
