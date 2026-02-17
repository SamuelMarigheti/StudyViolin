import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatsBarProps {
  stats: {
    practice_days: number;
    completed_lessons: number;
    total_lessons: number;
    level: string;
  };
}

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="calendar" size={20} color="#3fb950" />
        </View>
        <Text style={styles.statValue}>{stats.practice_days}</Text>
        <Text style={styles.statLabel}>Dias</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={20} color="#58a6ff" />
        </View>
        <Text style={styles.statValue}>{stats.completed_lessons}</Text>
        <Text style={styles.statLabel}>Lições</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="trophy" size={20} color="#d4a843" />
        </View>
        <Text style={styles.statValue} numberOfLines={1}>{stats.level}</Text>
        <Text style={styles.statLabel}>Nível</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#8b949e',
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: '#30363d',
    marginHorizontal: 8,
  },
});
