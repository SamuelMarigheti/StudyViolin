import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../src/services/api';
import ResponsiveContainer from '../src/components/ResponsiveContainer';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

interface DayData {
  date: string;
  studied: boolean;
  total_time_sec: number;
  sessions_count: number;
}

interface DailyLog {
  date: string;
  studied: boolean;
  total_time_sec: number;
  sessions_practiced: string[];
  session_times: Record<string, number>;
  notes?: string;
}

export default function CalendarScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [calendarData, setCalendarData] = useState<DayData[]>([]);
  const [practiceDates, setPracticeDates] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDetail, setDayDetail] = useState<DailyLog | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      const res = await api.get('/api/calendar');
      setCalendarData(res.data.calendar_data || []);
      setPracticeDates(res.data.practice_dates || []);
    } catch (error) {
      console.error('Error loading calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDayDetail = async (date: string) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/api/daily-logs/${date}`);
      setDayDetail(res.data.log);
    } catch (error) {
      console.error('Error loading day detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDayPress = (date: string) => {
    setSelectedDate(date);
    loadDayDetail(date);
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hours}h ${remainMins}min`;
  };

  const practiceSet = useMemo(() => new Set(practiceDates), [practiceDates]);

  const calendarMap = useMemo(() => {
    const map: Record<string, DayData> = {};
    calendarData.forEach(day => {
      map[day.date] = day;
    });
    return map;
  }, [calendarData]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const today = new Date().toISOString().split('T')[0];
    
    const days = [];
    
    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPracticed = practiceSet.has(dateStr);
      const isToday = dateStr === today;
      const dayData = calendarMap[dateStr];
      
      // Determine intensity based on time practiced
      let intensity = 0;
      if (dayData?.total_time_sec) {
        if (dayData.total_time_sec >= 3600) intensity = 4;
        else if (dayData.total_time_sec >= 2400) intensity = 3;
        else if (dayData.total_time_sec >= 1200) intensity = 2;
        else intensity = 1;
      }
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isPracticed && styles.dayCellPracticed,
            isPracticed && intensity === 1 && styles.intensity1,
            isPracticed && intensity === 2 && styles.intensity2,
            isPracticed && intensity === 3 && styles.intensity3,
            isPracticed && intensity === 4 && styles.intensity4,
            isToday && styles.dayCellToday,
          ]}
          onPress={() => handleDayPress(dateStr)}
        >
          <Text style={[
            styles.dayText,
            isPracticed && styles.dayTextPracticed,
            isToday && styles.dayTextToday,
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const navigateMonth = (direction: number) => {
    let newMonth = selectedMonth + direction;
    let newYear = selectedYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const totalDays = practiceDates.length;
  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i <= 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (practiceSet.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, [practiceSet]);

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
        <Text style={styles.headerTitle}>Histórico</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ResponsiveContainer>
        {/* Stats Summary */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalDays}</Text>
            <Text style={styles.statLabel}>Dias Totais</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Sequência</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarCard}>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
              <Ionicons name="chevron-back" size={24} color="#8b949e" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {MONTHS[selectedMonth]} {selectedYear}
            </Text>
            <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={24} color="#8b949e" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdaysRow}>
            {WEEKDAYS.map(day => (
              <Text key={day} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {renderCalendar()}
          </View>

          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Intensidade:</Text>
            <View style={styles.legendItems}>
              <View style={[styles.legendBox, styles.intensity1]} />
              <View style={[styles.legendBox, styles.intensity2]} />
              <View style={[styles.legendBox, styles.intensity3]} />
              <View style={[styles.legendBox, styles.intensity4]} />
            </View>
            <Text style={styles.legendLabel}>Menos → Mais</Text>
          </View>
        </View>
        </ResponsiveContainer>
      </ScrollView>

      {/* Day Detail Modal */}
      <Modal
        visible={selectedDate !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedDate(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </Text>
              <TouchableOpacity onPress={() => setSelectedDate(null)}>
                <Ionicons name="close" size={24} color="#8b949e" />
              </TouchableOpacity>
            </View>

            {loadingDetail ? (
              <ActivityIndicator color="#d4a843" style={{ padding: 40 }} />
            ) : dayDetail ? (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={20} color="#d4a843" />
                  <Text style={styles.detailText}>
                    Tempo total: {formatTime(dayDetail.total_time_sec || 0)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="list-outline" size={20} color="#58a6ff" />
                  <Text style={styles.detailText}>
                    Sessões: {dayDetail.sessions_practiced?.length || 0}
                  </Text>
                </View>

                {dayDetail.sessions_practiced && dayDetail.sessions_practiced.length > 0 && (
                  <View style={styles.sessionsBox}>
                    <Text style={styles.sessionsTitle}>Sessões praticadas:</Text>
                    {dayDetail.sessions_practiced.map(session => (
                      <View key={session} style={styles.sessionItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#3fb950" />
                        <Text style={styles.sessionName}>{session}</Text>
                        {dayDetail.session_times?.[session] && (
                          <Text style={styles.sessionTime}>
                            {formatTime(dayDetail.session_times[session])}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {dayDetail.notes && (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesTitle}>Notas do dia:</Text>
                    <Text style={styles.notesText}>{dayDetail.notes}</Text>
                  </View>
                )}
              </ScrollView>
            ) : (
              <View style={styles.noDataBox}>
                <Ionicons name="calendar-outline" size={48} color="#484f58" />
                <Text style={styles.noDataText}>Nenhum registro para este dia</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#d4a843',
  },
  statLabel: {
    fontSize: 14,
    color: '#8b949e',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#30363d',
    marginHorizontal: 16,
  },
  calendarCard: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#8b949e',
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayCellPracticed: {
    backgroundColor: 'rgba(63, 185, 80, 0.2)',
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#d4a843',
  },
  intensity1: { backgroundColor: 'rgba(63, 185, 80, 0.2)' },
  intensity2: { backgroundColor: 'rgba(63, 185, 80, 0.4)' },
  intensity3: { backgroundColor: 'rgba(63, 185, 80, 0.6)' },
  intensity4: { backgroundColor: 'rgba(63, 185, 80, 0.8)' },
  dayText: {
    fontSize: 14,
    color: '#8b949e',
  },
  dayTextPracticed: {
    color: '#ffffff',
    fontWeight: '600',
  },
  dayTextToday: {
    color: '#d4a843',
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#21262d',
    gap: 8,
  },
  legendTitle: {
    fontSize: 12,
    color: '#8b949e',
  },
  legendItems: {
    flexDirection: 'row',
    gap: 4,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 12,
    color: '#8b949e',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#161b22',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#30363d',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  modalBody: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    color: '#c9d1d9',
  },
  sessionsBox: {
    backgroundColor: '#0d1117',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  sessionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b949e',
    marginBottom: 8,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  sessionName: {
    flex: 1,
    fontSize: 14,
    color: '#c9d1d9',
    textTransform: 'capitalize',
  },
  sessionTime: {
    fontSize: 12,
    color: '#8b949e',
  },
  notesBox: {
    backgroundColor: '#0d1117',
    borderRadius: 8,
    padding: 12,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b949e',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#c9d1d9',
    lineHeight: 20,
  },
  noDataBox: {
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 14,
    color: '#8b949e',
    marginTop: 12,
  },
});
