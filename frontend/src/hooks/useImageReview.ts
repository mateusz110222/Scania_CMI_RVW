import { useCallback, useState } from 'react';
import { unitService } from '../services/unitService';
import { extractError } from '../utils/errorUtils';

interface UseImageReviewReturn {
  handleImageDecision: (
    decision: 'OK' | 'NOK',
    currentIndex: number,
    faultsLength: number,
    unit: string,
  ) => Promise<{
    isComplete: boolean;
    updatedResults: Array<'OK' | 'NOK'>;
    error?: { title: string; text: string };
  }>;
  isLoading: boolean;
}

export const useImageReview = (
  results: Array<'OK' | 'NOK'> = [],
): UseImageReviewReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const handleImageDecision = useCallback(
    async (
      decision: 'OK' | 'NOK',
      currentIndex: number,
      faultsLength: number,
      unit: string,
    ) => {
      const updatedResults = [...results, decision];

      if (currentIndex < faultsLength - 1) {
        return {
          isComplete: false,
          updatedResults,
        };
      }

      setIsLoading(true);
      try {
        let dcstring = 'GOOD';

        if (updatedResults.includes('NOK')) {
          dcstring = 'BAD';
        }

        await unitService.dataEntry(unit, 'CMI_RVW', 'WEB', dcstring);
        return {
          isComplete: true,
          updatedResults,
        };
      } catch (err: unknown) {
        console.error(err);
        const { message, details } = extractError(err);
        return {
          isComplete: false,
          updatedResults,
          error: {
            title: 'Błąd DataEntry',
            text: details ? `${message}: ${details}` : message,
          },
        };
      } finally {
        setIsLoading(false);
      }
    },
    [results],
  );

  return {
    handleImageDecision,
    isLoading,
  };
};
