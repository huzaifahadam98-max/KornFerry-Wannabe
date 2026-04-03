import { AnalysisResult } from '../types';

const CACHE_PREFIX = 'les360_report_';

export const getAnalysisFromCache = (employeeId: string): AnalysisResult | null => {
  try {
    const item = localStorage.getItem(`${CACHE_PREFIX}${employeeId}`);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error("Failed to retrieve from cache", error);
    return null;
  }
};

export const saveAnalysisToCache = (employeeId: string, data: AnalysisResult): void => {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${employeeId}`, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to cache (storage might be full)", error);
  }
};

export const clearAllAnalysisCache = (): void => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};

export const getCacheSize = (): number => {
  let count = 0;
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      count++;
    }
  });
  return count;
};
