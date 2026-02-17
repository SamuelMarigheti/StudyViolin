import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../src/services/api';
import MethodForm from '../src/components/MethodForm';
import LessonForm from '../src/components/LessonForm';
import BatchLessonForm from '../src/components/BatchLessonForm';

const SESSION_LABELS: Record<string, string> = {
  scales: 'Escalas e Arpejos',
  bow: 'Técnica de Arco',
  speed: 'Velocidade e Dedilhado',
  positions: 'Posições e Trinados',
  studies: 'Estudos e Caprichos',
  repertoire: 'Repertório',
};

interface Method {
  id: string;
  name: string;
  author: string;
  category: string;
  session_type?: string;
  is_seed: boolean;
  is_custom?: boolean;
}

interface Lesson {
  id: string;
  title: string;
  subtitle?: string;
  instruction?: string;
  level?: string;
  tags?: string[];
  order?: number;
  is_seed?: boolean;
  is_custom?: boolean;
  session_type?: string;
}

export default function MethodsScreen() {
  const router = useRouter();
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);
  const [methodLessons, setMethodLessons] = useState<Record<string, Lesson[]>>({});
  const [loadingLessons, setLoadingLessons] = useState<string | null>(null);

  // Form state
  const [showMethodForm, setShowMethodForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<Method | null>(null);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonMethodId, setLessonMethodId] = useState<string | null>(null);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchMethodId, setBatchMethodId] = useState<string | null>(null);
  const [batchMethodName, setBatchMethodName] = useState<string>('');

  const loadMethods = async () => {
    try {
      const res = await api.get('/api/methods');
      setMethods(res.data.methods || []);
    } catch (error) {
      console.error('Error loading methods:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setMethodLessons({});
    setExpandedMethod(null);
    loadMethods();
  }, []);

  const loadMethodLessons = async (methodId: string) => {
    if (methodLessons[methodId]) return;
    setLoadingLessons(methodId);
    try {
      const res = await api.get(`/api/methods/${methodId}/lessons`);
      setMethodLessons(prev => ({ ...prev, [methodId]: res.data.lessons || [] }));
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoadingLessons(null);
    }
  };

  const toggleExpand = (methodId: string) => {
    if (expandedMethod === methodId) {
      setExpandedMethod(null);
    } else {
      setExpandedMethod(methodId);
      loadMethodLessons(methodId);
    }
  };

  // CRUD Handlers
  const handleCreateMethod = async (data: { name: string; author: string; category: string; session_type: string }) => {
    const res = await api.post('/api/methods', data);
    await loadMethods();
    Alert.alert('Sucesso', res.data.message);
  };

  const handleUpdateMethod = async (data: { name: string; author: string; category: string; session_type: string }) => {
    if (!editingMethod) return;
    await api.put(`/api/methods/${editingMethod.id}`, {
      name: data.name,
      author: data.author,
      category: data.category,
    });
    await loadMethods();
    setMethodLessons(prev => {
      const copy = { ...prev };
      delete copy[editingMethod.id];
      return copy;
    });
    setEditingMethod(null);
    Alert.alert('Sucesso', 'Método atualizado');
  };

  const handleDeleteMethod = (method: Method) => {
    Alert.alert(
      'Deletar Método',
      `Deseja deletar "${method.name}" e todas as suas lições?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/methods/${method.id}`);
              setMethodLessons(prev => {
                const copy = { ...prev };
                delete copy[method.id];
                return copy;
              });
              if (expandedMethod === method.id) setExpandedMethod(null);
              await loadMethods();
              Alert.alert('Sucesso', 'Método deletado');
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.detail || 'Erro ao deletar');
            }
          },
        },
      ]
    );
  };

  const handleCreateLesson = async (data: { title: string; subtitle: string; instruction: string; level: string; tags: string[] }) => {
    if (!lessonMethodId) return;
    await api.post(`/api/methods/${lessonMethodId}/lessons`, data);
    // Reload lessons for this method
    setMethodLessons(prev => {
      const copy = { ...prev };
      delete copy[lessonMethodId];
      return copy;
    });
    loadMethodLessons(lessonMethodId);
    Alert.alert('Sucesso', 'Lição criada');
  };

  const handleUpdateLesson = async (data: { title: string; subtitle: string; instruction: string; level: string; tags: string[] }) => {
    if (!editingLesson) return;
    await api.put(`/api/lessons/${editingLesson.id}`, data);
    if (lessonMethodId) {
      setMethodLessons(prev => {
        const copy = { ...prev };
        delete copy[lessonMethodId];
        return copy;
      });
      loadMethodLessons(lessonMethodId);
    }
    setEditingLesson(null);
    Alert.alert('Sucesso', 'Lição atualizada');
  };

  const handleDeleteLesson = (lesson: Lesson, methodId: string) => {
    Alert.alert(
      'Deletar Lição',
      `Deseja deletar "${lesson.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/lessons/${lesson.id}`);
              setMethodLessons(prev => {
                const copy = { ...prev };
                delete copy[methodId];
                return copy;
              });
              loadMethodLessons(methodId);
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.detail || 'Erro ao deletar');
            }
          },
        },
      ]
    );
  };

  const handleBatchCreate = async (data: {
    title_prefix: string;
    count: number;
    subtitle: string;
    instruction: string;
    level: string;
    tags: string[];
  }) => {
    if (!batchMethodId) return;
    const res = await api.post(`/api/methods/${batchMethodId}/lessons/batch`, data);
    setMethodLessons(prev => {
      const copy = { ...prev };
      delete copy[batchMethodId];
      return copy;
    });
    loadMethodLessons(batchMethodId);
    Alert.alert('Sucesso', res.data.message);
  };

  // Group methods by seed/custom
  const seedMethods = methods.filter(m => m.is_seed);
  const customMethods = methods.filter(m => m.is_custom);

  const renderLesson = (lesson: Lesson, methodId: string, isCustomMethod: boolean) => (
    <View key={lesson.id || lesson.title} style={styles.lessonRow}>
      <View style={styles.lessonInfo}>
        <Text style={styles.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
        {lesson.subtitle ? (
          <Text style={styles.lessonSubtitle} numberOfLines={1}>{lesson.subtitle}</Text>
        ) : null}
        {lesson.level ? (
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{lesson.level}</Text>
          </View>
        ) : null}
      </View>
      {isCustomMethod && !lesson.is_seed && (
        <View style={styles.lessonActions}>
          <TouchableOpacity
            style={styles.lessonActionBtn}
            onPress={() => {
              setEditingLesson(lesson);
              setLessonMethodId(methodId);
              setShowLessonForm(true);
            }}
          >
            <Ionicons name="pencil-outline" size={16} color="#58a6ff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.lessonActionBtn}
            onPress={() => handleDeleteLesson(lesson, methodId)}
          >
            <Ionicons name="trash-outline" size={16} color="#f85149" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderMethodCard = (method: Method) => {
    const isExpanded = expandedMethod === method.id;
    const isCustom = method.is_custom;
    const lessons = methodLessons[method.id];

    return (
      <View key={method.id} style={styles.methodCard}>
        <TouchableOpacity style={styles.methodHeader} onPress={() => toggleExpand(method.id)}>
          <View style={styles.methodHeaderLeft}>
            <View style={[styles.methodIcon, isCustom && styles.methodIconCustom]}>
              <Ionicons
                name={isCustom ? 'create-outline' : 'book-outline'}
                size={20}
                color={isCustom ? '#d4a843' : '#58a6ff'}
              />
            </View>
            <View style={styles.methodMeta}>
              <Text style={styles.methodName}>{method.name}</Text>
              <Text style={styles.methodAuthor}>{method.author}</Text>
              {method.session_type && (
                <Text style={styles.methodSession}>
                  {SESSION_LABELS[method.session_type] || method.session_type}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.methodHeaderRight}>
            {isCustom && (
              <View style={styles.customBadge}>
                <Text style={styles.customBadgeText}>Custom</Text>
              </View>
            )}
            {method.is_seed && (
              <View style={styles.seedBadge}>
                <Text style={styles.seedBadgeText}>Padrão</Text>
              </View>
            )}
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#8b949e"
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.methodBody}>
            {/* Action buttons for custom methods */}
            {isCustom && (
              <View style={styles.methodActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    setEditingMethod(method);
                    setShowMethodForm(true);
                  }}
                >
                  <Ionicons name="pencil-outline" size={16} color="#58a6ff" />
                  <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    setLessonMethodId(method.id);
                    setEditingLesson(null);
                    setShowLessonForm(true);
                  }}
                >
                  <Ionicons name="add-outline" size={16} color="#3fb950" />
                  <Text style={[styles.actionText, { color: '#3fb950' }]}>Lição</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    setBatchMethodId(method.id);
                    setBatchMethodName(method.name);
                    setShowBatchForm(true);
                  }}
                >
                  <Ionicons name="layers-outline" size={16} color="#d4a843" />
                  <Text style={[styles.actionText, { color: '#d4a843' }]}>Lote</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDeleteMethod(method)}
                >
                  <Ionicons name="trash-outline" size={16} color="#f85149" />
                  <Text style={[styles.actionText, { color: '#f85149' }]}>Deletar</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Lessons list */}
            {loadingLessons === method.id ? (
              <ActivityIndicator color="#d4a843" style={{ padding: 16 }} />
            ) : lessons && lessons.length > 0 ? (
              <View style={styles.lessonsList}>
                <Text style={styles.lessonsCount}>{lessons.length} lições</Text>
                {lessons.map((l) => renderLesson(l, method.id, !!isCustom))}
              </View>
            ) : lessons && lessons.length === 0 ? (
              <View style={styles.emptyLessons}>
                <Ionicons name="document-outline" size={24} color="#484f58" />
                <Text style={styles.emptyText}>Nenhuma lição</Text>
                {isCustom && (
                  <TouchableOpacity
                    style={styles.addFirstBtn}
                    onPress={() => {
                      setLessonMethodId(method.id);
                      setEditingLesson(null);
                      setShowLessonForm(true);
                    }}
                  >
                    <Text style={styles.addFirstText}>Adicionar primeira lição</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
          </View>
        )}
      </View>
    );
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
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Métodos e Lições</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingMethod(null);
            setShowMethodForm(true);
          }}
        >
          <Ionicons name="add" size={24} color="#d4a843" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#d4a843" />
        }
      >
        {/* Custom Methods */}
        {customMethods.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seus Métodos</Text>
            {customMethods.map(renderMethodCard)}
          </View>
        )}

        {/* Empty state for custom */}
        {customMethods.length === 0 && (
          <View style={styles.emptyCustom}>
            <Ionicons name="add-circle-outline" size={48} color="#484f58" />
            <Text style={styles.emptyCustomTitle}>Nenhum método personalizado</Text>
            <Text style={styles.emptyCustomDesc}>
              Toque no + acima para criar seu primeiro método com suas próprias lições.
            </Text>
          </View>
        )}

        {/* Seed Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Métodos Padrão (somente leitura)</Text>
          {seedMethods.map(renderMethodCard)}
        </View>
      </ScrollView>

      {/* Forms */}
      <MethodForm
        visible={showMethodForm}
        onClose={() => {
          setShowMethodForm(false);
          setEditingMethod(null);
        }}
        onSave={editingMethod ? handleUpdateMethod : handleCreateMethod}
        initialData={editingMethod || undefined}
        isEditing={!!editingMethod}
      />

      <LessonForm
        visible={showLessonForm}
        onClose={() => {
          setShowLessonForm(false);
          setEditingLesson(null);
          setLessonMethodId(null);
        }}
        onSave={editingLesson ? handleUpdateLesson : handleCreateLesson}
        initialData={editingLesson || undefined}
        isEditing={!!editingLesson}
      />

      <BatchLessonForm
        visible={showBatchForm}
        onClose={() => {
          setShowBatchForm(false);
          setBatchMethodId(null);
          setBatchMethodName('');
        }}
        onSave={handleBatchCreate}
        methodName={batchMethodName}
      />
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
  headerBar: {
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
  addButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b949e',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  // Empty custom state
  emptyCustom: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 24,
    backgroundColor: '#161b22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363d',
    borderStyle: 'dashed',
  },
  emptyCustomTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#c9d1d9',
    marginTop: 12,
  },
  emptyCustomDesc: {
    fontSize: 14,
    color: '#8b949e',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  // Method Card
  methodCard: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363d',
    marginBottom: 10,
    overflow: 'hidden',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  methodHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(88,166,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodIconCustom: {
    backgroundColor: 'rgba(212,168,67,0.15)',
  },
  methodMeta: {
    flex: 1,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  methodAuthor: {
    fontSize: 13,
    color: '#8b949e',
    marginTop: 2,
  },
  methodSession: {
    fontSize: 11,
    color: '#58a6ff',
    marginTop: 2,
  },
  methodHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customBadge: {
    backgroundColor: 'rgba(212,168,67,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  customBadgeText: {
    fontSize: 11,
    color: '#d4a843',
    fontWeight: '600',
  },
  seedBadge: {
    backgroundColor: 'rgba(88,166,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  seedBadgeText: {
    fontSize: 11,
    color: '#58a6ff',
    fontWeight: '600',
  },
  // Method Body
  methodBody: {
    borderTopWidth: 1,
    borderTopColor: '#21262d',
  },
  methodActions: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  deleteBtn: {
    borderColor: 'rgba(248,81,73,0.3)',
  },
  actionText: {
    fontSize: 12,
    color: '#58a6ff',
    fontWeight: '600',
  },
  // Lessons List
  lessonsList: {
    padding: 12,
  },
  lessonsCount: {
    fontSize: 12,
    color: '#8b949e',
    marginBottom: 8,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    color: '#c9d1d9',
  },
  lessonSubtitle: {
    fontSize: 12,
    color: '#8b949e',
    marginTop: 2,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212,168,67,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  levelBadgeText: {
    fontSize: 10,
    color: '#d4a843',
    fontWeight: '600',
  },
  lessonActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  lessonActionBtn: {
    padding: 6,
  },
  emptyLessons: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#484f58',
    marginTop: 8,
  },
  addFirstBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(212,168,67,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.3)',
  },
  addFirstText: {
    fontSize: 13,
    color: '#d4a843',
    fontWeight: '600',
  },
});
