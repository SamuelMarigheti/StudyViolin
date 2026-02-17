import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import SessionTimer from './SessionTimer';

interface Session {
  id: string;
  name: string;
  icon: string;
  time: string;
  duration: number;
  lessons: number;
  type: string;
}

interface SessionCardProps {
  session: Session;
  progress: any;
  expanded: boolean;
  onToggle: () => void;
  onRefresh: () => void;
}

export default function SessionCard({
  session,
  progress,
  expanded,
  onToggle,
  onRefresh,
}: SessionCardProps) {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [warmupChecklist, setWarmupChecklist] = useState<any[]>([]);
  const [sessionTip, setSessionTip] = useState('');

  const sessionProgress = progress?.[session.id] || {
    current_lesson: 1,
    completed_lessons: [],
    practice_counts: {},
    last_practiced: {},
    notes: {},
  };

  const currentLesson = sessionProgress.current_lesson || 1;
  const practiceCount = sessionProgress.practice_counts?.[String(currentLesson)] || 0;
  const lastPracticed = sessionProgress.last_practiced?.[String(currentLesson)];
  const todayStr = new Date().toISOString().split('T')[0];
  const practicedToday = lastPracticed === todayStr;

  useEffect(() => {
    if (expanded && session.type === 'progressive') {
      loadLessons();
    } else if (expanded && session.type === 'checklist') {
      loadWarmup();
    }
  }, [expanded]);

  useEffect(() => {
    if (lessons.length > 0) {
      const lessonNotes = sessionProgress.notes?.[String(currentLesson)] || '';
      setNotes(lessonNotes);
    }
  }, [currentLesson, lessons]);

  const loadLessons = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/lessons/${session.id}`);
      setLessons(res.data.lessons);
      setSessionTip(res.data.tip);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWarmup = async () => {
    setLoading(true);
    try {
      const [checklistRes, progressRes] = await Promise.all([
        api.get('/api/warmup-checklist'),
        api.get('/api/progress'),
      ]);
      
      const todayWarmup = progressRes.data.warmup_today;
      if (todayWarmup?.checklist) {
        setWarmupChecklist(todayWarmup.checklist);
      } else {
        setWarmupChecklist(checklistRes.data.checklist);
      }
      setSessionTip(checklistRes.data.tip);
    } catch (error) {
      console.error('Error loading warmup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWarmupCheck = async (itemId: number, completed: boolean) => {
    try {
      const res = await api.post('/api/warmup/check', { item_id: itemId, completed });
      setWarmupChecklist(res.data.checklist);
    } catch (error) {
      console.error('Error updating warmup:', error);
    }
  };

  const handlePractice = async () => {
    try {
      await api.post('/api/progress/practice', {
        session_type: session.id,
        lesson_id: currentLesson,
      });
      onRefresh();
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Não foi possível registrar a prática');
      } else {
        Alert.alert('Erro', 'Não foi possível registrar a prática');
      }
    }
  };

  const handleAdvance = (direction: 'next' | 'previous') => {
    const message = direction === 'next'
      ? 'Tem certeza que deseja avançar para a próxima lição?'
      : 'Deseja voltar para a lição anterior?';

    const doAdvance = async () => {
      try {
        await api.post('/api/progress/advance', {
          session_type: session.id,
          direction,
        });
        onRefresh();
        loadLessons();
      } catch (error) {
        if (Platform.OS === 'web') {
          window.alert('Não foi possível mudar de lição');
        } else {
          Alert.alert('Erro', 'Não foi possível mudar de lição');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        doAdvance();
      }
    } else {
      Alert.alert(
        direction === 'next' ? 'Avançar Lição' : 'Voltar Lição',
        message,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: doAdvance },
        ]
      );
    }
  };

  const handleSaveNotes = async () => {
    try {
      await api.post('/api/progress/notes', {
        session_type: session.id,
        lesson_id: currentLesson,
        notes,
      });
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const currentLessonData = lessons.find((l) => l.id === currentLesson);

  return (
    <View style={[styles.container, practicedToday && styles.containerDone]}>
      <TouchableOpacity style={styles.header} onPress={onToggle}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>{session.icon}</Text>
          <View style={styles.headerText}>
            <Text style={styles.name}>{session.name}</Text>
            <Text style={styles.time}>{session.time} • {session.duration} min</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {practicedToday && (
            <View style={styles.doneBadge}>
              <Text style={styles.doneBadgeText}>Feito</Text>
            </View>
          )}
          {session.type === 'progressive' && (
            <Text style={styles.lessonCount}>
              {currentLesson}/{session.lessons}
            </Text>
          )}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#8b949e"
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator color="#d4a843" style={{ padding: 20 }} />
          ) : session.type === 'checklist' ? (
            // Warmup Checklist
            <View>
              <Text style={styles.sectionLabel}>Checklist Diário</Text>
              {warmupChecklist.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.checklistItem}
                  onPress={() => handleWarmupCheck(item.id, !item.completed)}
                >
                  <Ionicons
                    name={item.completed ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={item.completed ? '#3fb950' : '#484f58'}
                  />
                  <Text style={[
                    styles.checklistText,
                    item.completed && styles.checklistTextDone
                  ]}>
                    {item.text}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {sessionTip && (
                <View style={styles.tipBox}>
                  <Ionicons name="bulb" size={18} color="#d4a843" />
                  <Text style={styles.tipText}>{sessionTip}</Text>
                </View>
              )}
            </View>
          ) : (
            // Progressive Lesson
            <View>
              <View style={styles.lessonHeader}>
                <Text style={styles.lessonNumber}>
                  Lição {currentLesson} de {session.lessons}
                </Text>
                {currentLessonData && (
                  <>
                    <Text style={styles.lessonTitle}>{currentLessonData.title}</Text>
                    <Text style={styles.lessonMethod}>{currentLessonData.method}</Text>
                    {currentLessonData.level && (
                      <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>{currentLessonData.level}</Text>
                      </View>
                    )}
                  </>
                )}
              </View>

              {currentLessonData?.instruction && (
                <View style={styles.instructionBox}>
                  <Text style={styles.instructionText}>{currentLessonData.instruction}</Text>
                </View>
              )}

              <SessionTimer duration={session.duration} />

              {sessionTip && (
                <View style={styles.tipBox}>
                  <Ionicons name="bulb" size={18} color="#d4a843" />
                  <Text style={styles.tipText}>{sessionTip}</Text>
                </View>
              )}

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{practiceCount}</Text>
                  <Text style={styles.statText}>vezes praticada</Text>
                </View>
                {lastPracticed && (
                  <View style={styles.statBox}>
                    <Ionicons name="calendar-outline" size={16} color="#8b949e" />
                    <Text style={styles.statText}>
                      Última: {lastPracticed}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Anotações</Text>
                <TextInput
                  style={styles.notesInput}
                  multiline
                  numberOfLines={3}
                  placeholder="Adicione suas anotações sobre esta lição..."
                  placeholderTextColor="#484f58"
                  value={notes}
                  onChangeText={setNotes}
                  onBlur={handleSaveNotes}
                />
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.practiceButton]}
                  onPress={handlePractice}
                >
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Pratiquei</Text>
                </TouchableOpacity>

                <View style={styles.navButtons}>
                  <TouchableOpacity
                    style={[styles.navButton, currentLesson <= 1 && styles.navButtonDisabled]}
                    onPress={() => handleAdvance('previous')}
                    disabled={currentLesson <= 1}
                  >
                    <Ionicons name="arrow-back" size={18} color={currentLesson > 1 ? '#8b949e' : '#30363d'} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.navButton, styles.advanceButton, currentLesson >= session.lessons && styles.navButtonDisabled]}
                    onPress={() => handleAdvance('next')}
                    disabled={currentLesson >= session.lessons}
                  >
                    <Text style={[styles.advanceText, currentLesson >= session.lessons && { color: '#30363d' }]}>
                      Avançar
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color={currentLesson < session.lessons ? '#d4a843' : '#30363d'} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#30363d',
    overflow: 'hidden',
  },
  containerDone: {
    borderColor: '#3fb950',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  time: {
    fontSize: 13,
    color: '#8b949e',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doneBadge: {
    backgroundColor: 'rgba(63, 185, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  doneBadgeText: {
    color: '#3fb950',
    fontSize: 12,
    fontWeight: '600',
  },
  lessonCount: {
    fontSize: 14,
    color: '#d4a843',
    fontWeight: '600',
  },
  content: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#21262d',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b949e',
    marginTop: 16,
    marginBottom: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  checklistText: {
    flex: 1,
    fontSize: 14,
    color: '#c9d1d9',
  },
  checklistTextDone: {
    color: '#8b949e',
    textDecorationLine: 'line-through',
  },
  lessonHeader: {
    marginTop: 16,
    marginBottom: 16,
  },
  lessonNumber: {
    fontSize: 13,
    color: '#8b949e',
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  lessonMethod: {
    fontSize: 14,
    color: '#d4a843',
    marginTop: 4,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 168, 67, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  levelText: {
    color: '#d4a843',
    fontSize: 12,
    fontWeight: '600',
  },
  instructionBox: {
    backgroundColor: '#0d1117',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#58a6ff',
  },
  instructionText: {
    fontSize: 14,
    color: '#c9d1d9',
    lineHeight: 20,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 168, 67, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#d4a843',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statText: {
    fontSize: 13,
    color: '#8b949e',
  },
  notesSection: {
    marginTop: 16,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b949e',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: '#0d1117',
    borderRadius: 8,
    padding: 12,
    color: '#c9d1d9',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  actions: {
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  practiceButton: {
    backgroundColor: '#238636',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30363d',
    gap: 6,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  advanceButton: {
    flex: 1,
    justifyContent: 'center',
    borderColor: '#d4a843',
  },
  advanceText: {
    color: '#d4a843',
    fontSize: 14,
    fontWeight: '600',
  },
});
