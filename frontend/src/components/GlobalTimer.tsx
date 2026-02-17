import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GlobalTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    // 60 minutes = 3600 seconds
    return Math.min((seconds / 3600) * 100, 100);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Sessão de Estudo</Text>
        <Text style={styles.target}>Meta: 1 hora</Text>
      </View>
      
      <Text style={styles.time}>{formatTime(seconds)}</Text>
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${getProgress()}%` }]} />
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isRunning && styles.buttonActive]}
          onPress={() => setIsRunning(!isRunning)}
        >
          <Ionicons
            name={isRunning ? 'pause' : 'play'}
            size={24}
            color={isRunning ? '#0d1117' : '#ffffff'}
          />
          <Text style={[styles.buttonText, isRunning && styles.buttonTextActive]}>
            {isRunning ? 'Pausar' : 'Iniciar'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh" size={20} color="#8b949e" />
          <Text style={styles.resetText}>Resetar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  target: {
    fontSize: 14,
    color: '#8b949e',
  },
  time: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#d4a843',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#21262d',
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3fb950',
    borderRadius: 3,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d4a843',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 8,
  },
  buttonActive: {
    backgroundColor: '#d4a843',
  },
  buttonText: {
    color: '#d4a843',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextActive: {
    color: '#0d1117',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resetText: {
    color: '#8b949e',
    fontSize: 14,
  },
});
