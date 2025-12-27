import { create } from 'zustand';

type AnalysisState = {
  age: number | null;
  gender: string | null;
  timestamp: string | null;
  isSenior: boolean;
  setAnalysis: (data: { age: number | string; gender: string; timestamp: string }) => void;
  clearAnalysis: () => void;
};

function parseAge(value: number | string): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const digitsOnly = value.replace(/[^0-9]/g, '');
  if (!digitsOnly) return null;

  const n = Number.parseInt(digitsOnly, 10);
  return Number.isFinite(n) ? n : null;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  age: null,
  gender: null,
  timestamp: null,
  isSenior: false,
  setAnalysis: (data) => {
    const age = parseAge(data.age);
    set(() => ({
      age,
      gender: data.gender ?? null,
      timestamp: data.timestamp ?? null,
      isSenior: age != null ? age >= 50 : false,
    }));
  },
  clearAnalysis: () =>
    set(() => ({
      age: null,
      gender: null,
      timestamp: null,
      isSenior: false,
    })),
}));
