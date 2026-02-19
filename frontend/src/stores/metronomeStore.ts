import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8';

interface MetronomeStore {
  bpm: number;
  timeSignature: TimeSignature;
  setBpm: (bpm: number) => void;
  setTimeSignature: (ts: TimeSignature) => void;
}

export const useMetronomeStore = create<MetronomeStore>()(
  persist(
    (set) => ({
      bpm: 80,
      timeSignature: '4/4',
      setBpm: (bpm) =>
        set({ bpm: Math.min(240, Math.max(30, Math.round(bpm))) }),
      setTimeSignature: (timeSignature) => set({ timeSignature }),
    }),
    {
      name: 'metronome-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
