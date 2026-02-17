import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../src/services/api';

const SESSION_NAMES: Record<string, string> = {
  scales: 'Escalas e Arpejos',
  bow: 'Técnica de Arco',
  speed: 'Velocidade e Dedilhado',
  positions: 'Posições e Trinados',
  studies: 'Estudos e Caprichos',
  repertoire: 'Repertório',
};

const SESSION_ICONS: Record<string, string> = {
  scales: 'musical-notes',
  bow: 'arrow-forward',
  speed: 'flash',
  positions: 'swap-horizontal',
  studies: 'book',
  repertoire: 'musical-note',
};

export default function ProgressScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statsRes, progressRes] = await Promise.all([
        api.get('/api/stats'),
        api.get('/api/progress'),
      ]);
      setStats(statsRes.data);
      setProgress(progressRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLessons = async (sessionType: string) => {
    if (lessons[sessionType]) return;
    try {
      const res = await api.get(`/api/lessons/${sessionType}`);
      setLessons(prev => ({ ...prev, [sessionType]: res.data.lessons }));
    } catch (error) {
      console.error('Error loading lessons:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleJumpToLesson = async (sessionType: string, lessonId: number) => {
    Alert.alert(
      'Pular para Lição',
      `Deseja ir para a lição ${lessonId}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await api.post(`/api/progress/jump?session_type=${sessionType}&lesson_id=${lessonId}`);
              loadData();
              Alert.alert('Sucesso', `Agora você está na lição ${lessonId}`);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível pular para a lição');
            }
          },
        },
      ]
    );
  };

  const toggleSession = (sessionType: string) => {
    if (expandedSession === sessionType) {
      setExpandedSession(null);
    } else {
      setExpandedSession(sessionType);
      loadLessons(sessionType);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d4a843" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progresso</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Overall Stats */}
        <View style={styles.overallCard}>
          <Text style={styles.levelLabel}>Nível Atual</Text>
          <Text style={styles.levelValue}>{stats?.level || 'Iniciante'}</Text>
          
          <View style={styles.overallStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.completed_lessons || 0}</Text>
              <Text style={styles.statLabel}>Lições Concluídas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.total_lessons || 489}</Text>
              <Text style={styles.statLabel}>Total de Lições</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.completion_percentage || 0}%</Text>
              <Text style={styles.statLabel}>Progresso</Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${stats?.completion_percentage || 0}%` }]} />
          </View>
        </View>

        {/* Session Progress */}
        <Text style={styles.sectionTitle}>Progresso por Sessão</Text>

        {Object.entries(SESSION_NAMES).map(([key, name]) => {
          const sessionProgress = stats?.session_progress?.[key] || { total: 0, completed: 0, current: 1 };
          const percentage = sessionProgress.total > 0 
            ? Math.round((sessionProgress.completed / sessionProgress.total) * 100) 
            : 0;
          const isExpanded = expandedSession === key;

          return (
            <View key={key} style={styles.sessionCard}>
              <TouchableOpacity
                style={styles.sessionHeader}
                onPress={() => toggleSession(key)}
              >
                <View style={styles.sessionInfo}>
                  <Ionicons
                    name={SESSION_ICONS[key] as any}
                    size={24}
                    color="#d4a843"
                  />
                  <View style={styles.sessionText}>
                    <Text style={styles.sessionName}>{name}</Text>
                    <Text style={styles.sessionStats}>
                      Lição {sessionProgress.current} de {sessionProgress.total} • {sessionProgress.completed} concluídas
                    </Text>
                  </View>
                </View>
                <View style={styles.sessionRight}>
                  <Text style={styles.percentageText}>{percentage}%</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#8b949e"
                  />
                </View>
              </TouchableOpacity>

              <View style={styles.sessionProgressBar}>
                <View style={[styles.sessionProgress, { width: `${percentage}%` }]} />
              </View>

              {isExpanded && (
                <View style={styles.lessonsList}>
                  {lessons[key]?.map((lesson: any) => {
                    const sessionData = progress?.[key] || {};
                    const isCompleted = sessionData.completed_lessons?.includes(lesson.id);
                    const isCurrent = sessionData.current_lesson === lesson.id;
                    const practiceCount = sessionData.practice_counts?.[String(lesson.id)] || 0;

                    return (
                      <TouchableOpacity
                        key={lesson.id}
                        style={[
                          styles.lessonItem,
                          isCurrent && styles.lessonItemCurrent,
                        ]}
                        onPress={() => handleJumpToLesson(key, lesson.id)}
                      >
                        <View style={styles.lessonStatus}>
                          {isCompleted ? (
                            <Ionicons name="checkmark-circle" size={20} color="#3fb950" />
                          ) : isCurrent ? (
                            <Ionicons name="play-circle" size={20} color="#d4a843" />
                          ) : (
                            <Ionicons name="ellipse-outline" size={20} color="#484f58" />
                          )}
                        </View>
                        <View style={styles.lessonInfo}>
                          <Text style={[
                            styles.lessonTitle,
                            isCompleted && styles.lessonTitleCompleted,
                            isCurrent && styles.lessonTitleCurrent,
                          ]}>
                            {lesson.id}. {lesson.title}
                          </Text>
                          {practiceCount > 0 && (
                            <Text style={styles.practiceCount}>
                              Praticado {practiceCount}x
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  overallCard: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  levelLabel: {
    fontSize: 14,
    color: '#8b949e',
    textAlign: 'center',
  },
  levelValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d4a843',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#8b949e',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#30363d',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#21262d',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#d4a843',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  sessionCard: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#30363d',
    overflow: 'hidden',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionText: {
    marginLeft: 12,
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  sessionStats: {
    fontSize: 12,
    color: '#8b949e',
    marginTop: 2,
  },
  sessionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4a843',
  },
  sessionProgressBar: {
    height: 4,
    backgroundColor: '#21262d',
  },
  sessionProgress: {
    height: '100%',
    backgroundColor: '#3fb950',
  },
  lessonsList: {
    maxHeight: 300,
    borderTopWidth: 1,
    borderTopColor: '#21262d',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  lessonItemCurrent: {
    backgroundColor: 'rgba(212, 168, 67, 0.1)',
  },
  lessonStatus: {
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    color: '#c9d1d9',
  },
  lessonTitleCompleted: {
    color: '#8b949e',
  },
  lessonTitleCurrent: {
    color: '#d4a843',
    fontWeight: '600',
  },
  practiceCount: {
    fontSize: 12,
    color: '#8b949e',
    marginTop: 2,
  },
});
