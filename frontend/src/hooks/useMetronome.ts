import { useEffect, useRef, useState, useCallback } from 'react';
import { Audio } from 'expo-av';
import { useMetronomeStore, type TimeSignature } from '../stores/metronomeStore';

function beatsFromSignature(ts: TimeSignature): number {
  return parseInt(ts.split('/')[0], 10);
}

export interface MetronomeControls {
  isPlaying: boolean;
  bpm: number;
  setBpm: (bpm: number) => void;
  timeSignature: TimeSignature;
  setTimeSignature: (ts: TimeSignature) => void;
  currentBeat: number; // -1 = stopped, 0..beats-1 = active beat
  toggle: () => void;
  start: () => void;
  stop: () => void;
  tapTempo: () => void;
}

export function useMetronome(): MetronomeControls {
  const { bpm, timeSignature, setBpm, setTimeSignature } = useMetronomeStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);

  // Audio refs
  const tickRef = useRef<Audio.Sound | null>(null);
  const tockRef = useRef<Audio.Sound | null>(null);

  // Scheduler state refs (avoid stale closures in setTimeout)
  const isPlayingRef = useRef(false);
  const schedulerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beatIdxRef = useRef(0);
  const nextBeatAtRef = useRef(0);
  const bpmRef = useRef(bpm);
  const beatsRef = useRef(beatsFromSignature(timeSignature));

  // Tap tempo
  const tapTimestamps = useRef<number[]>([]);

  // Keep refs in sync with store values
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    beatsRef.current = beatsFromSignature(timeSignature);
  }, [timeSignature]);

  // Load sounds on mount
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
        });

        const { sound: tick } = await Audio.Sound.createAsync(
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          require('../../assets/sounds/tick.wav'),
        );
        const { sound: tock } = await Audio.Sound.createAsync(
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          require('../../assets/sounds/tock.wav'),
        );

        if (mounted) {
          tickRef.current = tick;
          tockRef.current = tock;
        } else {
          await tick.unloadAsync();
          await tock.unloadAsync();
        }
      } catch (e) {
        console.warn('[Metronome] Could not load sounds:', e);
      }
    };

    load();

    return () => {
      mounted = false;
      tickRef.current?.unloadAsync().catch(() => {});
      tockRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  // The beat scheduler — stored in a ref so setTimeout always gets the latest version
  const scheduleNextBeat = useRef<() => void>(() => {});

  scheduleNextBeat.current = () => {
    if (!isPlayingRef.current) return;

    const beatInterval = 60000 / bpmRef.current;
    const beatIdx = beatIdxRef.current;
    const isAccent = beatIdx === 0;

    const sound = isAccent ? tickRef.current : tockRef.current;
    if (sound) {
      sound
        .setPositionAsync(0)
        .then(() => sound.playAsync())
        .catch(() => {});
    }

    setCurrentBeat(beatIdx);
    beatIdxRef.current = (beatIdx + 1) % beatsRef.current;
    nextBeatAtRef.current += beatInterval;

    const delay = Math.max(0, nextBeatAtRef.current - Date.now());
    schedulerRef.current = setTimeout(() => scheduleNextBeat.current(), delay);
  };

  const start = useCallback(() => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    beatIdxRef.current = 0;
    nextBeatAtRef.current = Date.now();
    setIsPlaying(true);
    scheduleNextBeat.current();
  }, []);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (schedulerRef.current) {
      clearTimeout(schedulerRef.current);
      schedulerRef.current = null;
    }
    setCurrentBeat(-1);
  }, []);

  const toggle = useCallback(() => {
    if (isPlayingRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  const tapTempo = useCallback(() => {
    const now = Date.now();
    const taps = tapTimestamps.current;

    // Reset if gap exceeds 2.5 s
    if (taps.length > 0 && now - taps[taps.length - 1] > 2500) {
      tapTimestamps.current = [now];
      return;
    }

    taps.push(now);
    if (taps.length > 8) {
      tapTimestamps.current = taps.slice(-8);
    }

    if (tapTimestamps.current.length >= 2) {
      const intervals: number[] = [];
      const t = tapTimestamps.current;
      for (let i = 1; i < t.length; i++) {
        intervals.push(t[i] - t[i - 1]);
      }
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      setBpm(Math.round(60000 / avg));
    }
  }, [setBpm]);

  // Stop on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isPlaying,
    bpm,
    setBpm,
    timeSignature,
    setTimeSignature,
    currentBeat,
    toggle,
    start,
    stop,
    tapTempo,
  };
}
