import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMetronome } from '../hooks/useMetronome';
import { type TimeSignature } from '../stores/metronomeStore';

const TIME_SIGNATURES: TimeSignature[] = ['2/4', '3/4', '4/4', '6/8'];
const BPM_DELTAS = [-10, -1, 1, 10] as const;

export default function Metronome() {
  const {
    isPlaying,
    bpm,
    setBpm,
    timeSignature,
    setTimeSignature,
    currentBeat,
    toggle,
    tapTempo,
  } = useMetronome();

  const beats = parseInt(timeSignature.split('/')[0], 10);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>METRÔNOMO</Text>

      {/* Beat indicator dots */}
      <View style={styles.beatsRow}>
        {Array.from({ length: beats }, (_, i) => {
          const isAccentBeat = i === 0;
          const isActive = isPlaying && currentBeat === i;
          return (
            <View
              key={i}
              style={[
                styles.beat,
                isAccentBeat && styles.beatAccent,
                isActive && (isAccentBeat ? styles.beatActiveAccent : styles.beatActive),
              ]}
            />
          );
        })}
      </View>

      {/* BPM display */}
      <Text style={styles.bpmText}>{bpm}</Text>
      <Text style={styles.bpmLabel}>BPM</Text>

      {/* BPM adjustment */}
      <View style={styles.bpmControls}>
        {BPM_DELTAS.map((delta) => (
          <TouchableOpacity
            key={delta}
            style={styles.bpmBtn}
            onPress={() => setBpm(bpm + delta)}
            activeOpacity={0.7}
          >
            <Text style={styles.bpmBtnText}>
              {delta > 0 ? `+${delta}` : `${delta}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Time signature */}
      <View style={styles.timeSigRow}>
        {TIME_SIGNATURES.map((ts) => (
          <TouchableOpacity
            key={ts}
            style={[styles.tsBtn, timeSignature === ts && styles.tsBtnActive]}
            onPress={() => setTimeSignature(ts)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.tsBtnText, timeSignature === ts && styles.tsBtnTextActive]}
            >
              {ts}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tap + Play/Stop */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.tapBtn} onPress={tapTempo} activeOpacity={0.7}>
          <Text style={styles.tapBtnText}>TAP</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.playBtn, isPlaying && styles.stopBtn]}
          onPress={toggle}
          activeOpacity={0.8}
        >
          <Text style={styles.playBtnText}>{isPlaying ? '⏹  STOP' : '▶  PLAY'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363d',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8b949e',
    letterSpacing: 2,
    marginBottom: 14,
  },
  beatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    alignItems: 'center',
  },
  beat: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#21262d',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  beatAccent: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderColor: '#d4a843',
    borderWidth: 2,
  },
  beatActive: {
    backgroundColor: '#3fb950',
    borderColor: '#3fb950',
  },
  beatActiveAccent: {
    backgroundColor: '#d4a843',
    borderColor: '#d4a843',
  },
  bpmText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 64,
  },
  bpmLabel: {
    fontSize: 12,
    color: '#8b949e',
    marginBottom: 12,
  },
  bpmControls: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  bpmBtn: {
    backgroundColor: '#21262d',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 48,
    alignItems: 'center',
  },
  bpmBtnText: {
    color: '#c9d1d9',
    fontSize: 14,
    fontWeight: '600',
  },
  timeSigRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tsBtn: {
    backgroundColor: '#21262d',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tsBtnActive: {
    backgroundColor: '#1a2f4a',
    borderColor: '#388bfd',
  },
  tsBtnText: {
    color: '#8b949e',
    fontSize: 13,
    fontWeight: '500',
  },
  tsBtnTextActive: {
    color: '#388bfd',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  tapBtn: {
    backgroundColor: '#21262d',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 72,
    alignItems: 'center',
  },
  tapBtnText: {
    color: '#c9d1d9',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  playBtn: {
    backgroundColor: '#238636',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  stopBtn: {
    backgroundColor: '#b91c1c',
  },
  playBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
