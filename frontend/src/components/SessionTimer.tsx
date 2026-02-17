import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SessionTimerProps {
  duration: number; // in minutes
}

export default function SessionTimer({ duration }: SessionTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetSeconds = duration * 60;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return Math.min((seconds / targetSeconds) * 100, 100);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const isComplete = seconds >= targetSeconds;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Timer da Sessão</Text>
        <Text style={styles.target}>Meta: {duration} min</Text>
      </View>
      
      <View style={styles.timerRow}>
        <Text style={[styles.time, isComplete && styles.timeComplete]}>
          {formatTime(seconds)}
        </Text>
        <Text style={styles.separator}>/</Text>
        <Text style={styles.targetTime}>{formatTime(targetSeconds)}</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={[
          styles.progressBar, 
          { width: `${getProgress()}%` },
          isComplete && styles.progressComplete
        ]} />
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isRunning && styles.buttonPause]}
          onPress={() => setIsRunning(!isRunning)}
        >
          <Ionicons
            name={isRunning ? 'pause' : 'play'}
            size={18}
            color="#ffffff"
          />
          <Text style={styles.buttonText}>
            {isRunning ? 'Pausar' : 'Iniciar'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh" size={16} color="#8b949e" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0d1117',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b949e',
  },
  target: {
    fontSize: 12,
    color: '#6e7681',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 8,
  },
  time: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
  },
  timeComplete: {
    color: '#3fb950',
  },
  separator: {
    fontSize: 20,
    color: '#484f58',
    marginHorizontal: 8,
  },
  targetTime: {
    fontSize: 20,
    color: '#484f58',
    fontVariant: ['tabular-nums'],
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#21262d',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#58a6ff',
    borderRadius: 2,
  },
  progressComplete: {
    backgroundColor: '#3fb950',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#238636',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  buttonPause: {
    backgroundColor: '#da3633',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    padding: 8,
  },
});
