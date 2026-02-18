import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { api } from '../src/services/api';
import * as Clipboard from 'expo-clipboard';
import { showAlert, showPrompt } from '../src/utils/alert';
import ResponsiveContainer from '../src/components/ResponsiveContainer';

const LEVEL_THRESHOLDS = [
  { min: 0, max: 59, level: "Iniciante", method_range: "Wohlfahrt" },
  { min: 60, max: 95, level: "Iniciante–Intermediário", method_range: "Kayser" },
  { min: 96, max: 125, level: "Intermediário", method_range: "Mazas" },
  { min: 126, max: 187, level: "Intermediário–Avançado", method_range: "Dont 37 + Kreutzer" },
  { min: 188, max: 247, level: "Avançado", method_range: "Fiorillo + Rode" },
  { min: 248, max: 271, level: "Avançado Superior", method_range: "Dont 35" },
  { min: 272, max: 296, level: "Virtuoso", method_range: "Paganini" },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLevelInfo, setShowLevelInfo] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get('/api/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert('Erro', 'Preencha todos os campos');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Erro', 'As senhas não coincidem');
      return;
    }
    if (newPassword.length < 8) {
      showAlert('Erro', 'A senha deve ter pelo menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      showAlert('Sucesso', 'Senha alterada com sucesso');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showAlert('Erro', error.response?.data?.detail || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/export');
      const jsonString = JSON.stringify(res.data, null, 2);

      if (Platform.OS === 'web') {
        // Web: Download as file
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `violin-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showAlert('Sucesso', 'Backup exportado');
      } else {
        // Mobile: Copy to clipboard
        await Clipboard.setStringAsync(jsonString);
        showAlert('Sucesso', 'Backup copiado para a área de transferência');
      }
    } catch (error) {
      showAlert('Erro', 'Erro ao exportar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    showPrompt('Importar Backup', 'Cole o JSON do backup aqui:', async (text) => {
      if (!text) return;
      try {
        const data = JSON.parse(text);
        // Preview first
        const preview = await api.post('/api/import/preview', { data });
        if (preview.data.warnings?.length > 0) {
          showAlert(
            'Aviso',
            preview.data.warnings.join('\n') + '\n\nDeseja continuar?',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Importar',
                onPress: async () => {
                  await api.post('/api/import', { data });
                  showAlert('Sucesso', 'Dados importados com sucesso');
                  loadStats();
                },
              },
            ]
          );
        } else {
          await api.post('/api/import', { data });
          showAlert('Sucesso', 'Dados importados com sucesso');
          loadStats();
        }
      } catch (error) {
        showAlert('Erro', 'JSON inválido ou erro ao importar');
      }
    });
  };

  const handleReset = () => {
    showAlert(
      'Resetar Progresso',
      'ATENÇÃO: Esta ação irá apagar todo o seu progresso. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: () => {
            showAlert(
              'Confirmação Final',
              'Tem certeza ABSOLUTA que deseja resetar todo o progresso?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Sim, Resetar Tudo',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await api.post('/api/reset');
                      showAlert('Pronto', 'Progresso resetado');
                    } catch (error) {
                      showAlert('Erro', 'Erro ao resetar');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    showAlert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ResponsiveContainer>
        {/* User Info */}
        <View style={styles.section}>
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={32} color="#d4a843" />
            </View>
            <View>
              <Text style={styles.userName}>{user?.username || 'Admin'}</Text>
              <Text style={styles.userRole}>Administrador</Text>
            </View>
          </View>
        </View>

        {/* Password Change */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Segurança</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowChangePassword(!showChangePassword)}
          >
            <Ionicons name="key-outline" size={24} color="#8b949e" />
            <Text style={styles.menuText}>Alterar Senha</Text>
            <Ionicons
              name={showChangePassword ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#8b949e"
            />
          </TouchableOpacity>

          {showChangePassword && (
            <View style={styles.passwordForm}>
              <TextInput
                style={styles.input}
                placeholder="Senha atual"
                placeholderTextColor="#8b949e"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Nova senha"
                placeholderTextColor="#8b949e"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirmar nova senha"
                placeholderTextColor="#8b949e"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#0d1117" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Methods Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conteúdo</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/methods')}
          >
            <Ionicons name="library-outline" size={24} color="#d4a843" />
            <Text style={styles.menuText}>Gerenciar Métodos e Lições</Text>
            <Ionicons name="chevron-forward" size={20} color="#8b949e" />
          </TouchableOpacity>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleExport}>
            <Ionicons name="download-outline" size={24} color="#8b949e" />
            <Text style={styles.menuText}>Exportar Backup (JSON)</Text>
            <Ionicons name="chevron-forward" size={20} color="#8b949e" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleImport}>
            <Ionicons name="push-outline" size={24} color="#8b949e" />
            <Text style={styles.menuText}>Importar Backup</Text>
            <Ionicons name="chevron-forward" size={20} color="#8b949e" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.dangerItem]} onPress={handleReset}>
            <Ionicons name="trash-outline" size={24} color="#f85149" />
            <Text style={[styles.menuText, styles.dangerText]}>Resetar Progresso</Text>
            <Ionicons name="chevron-forward" size={20} color="#f85149" />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre o Plano</Text>
          
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>Plano de Estudos de Violino v2.0</Text>
            <Text style={styles.aboutText}>
              Aplicação profissional para gerenciamento de um plano de estudos progressivo de violino.
              Do iniciante ao virtuoso.
            </Text>
            <Text style={styles.aboutStats}>489 lições em 7 sessões diárias (60 min/dia)</Text>
            <Text style={styles.aboutMethods}>
              Métodos: Flesch, Ševčík, Fischer, Schradieck, Wohlfahrt, Kayser, Mazas,
              Dont, Kreutzer, Fiorillo, Rode, Paganini
            </Text>
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowLevelInfo(true)}
          >
            <Ionicons name="trophy-outline" size={24} color="#d4a843" />
            <Text style={styles.menuText}>Tabela de Níveis</Text>
            <Ionicons name="chevron-forward" size={20} color="#8b949e" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#f85149" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
        </ResponsiveContainer>
      </ScrollView>

      {/* Level Info Modal */}
      <Modal
        visible={showLevelInfo}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLevelInfo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sistema de Níveis</Text>
              <TouchableOpacity onPress={() => setShowLevelInfo(false)}>
                <Ionicons name="close" size={24} color="#8b949e" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.levelInfoText}>
                O nível é calculado automaticamente baseado no progresso na Sessão 6 (Estudos e Caprichos).
              </Text>

              {stats && (
                <View style={styles.currentLevelBox}>
                  <Text style={styles.currentLevelLabel}>Seu nível atual:</Text>
                  <Text style={styles.currentLevelValue}>{stats.level}</Text>
                  <Text style={styles.currentLevelProgress}>
                    {stats.studies_completed} estudos concluídos
                  </Text>
                </View>
              )}

              <Text style={styles.levelTableTitle}>Tabela de Progressão:</Text>

              {LEVEL_THRESHOLDS.map((threshold, index) => {
                const isCurrentLevel = stats?.level === threshold.level;
                return (
                  <View
                    key={index}
                    style={[
                      styles.levelRow,
                      isCurrentLevel && styles.levelRowCurrent
                    ]}
                  >
                    <View style={styles.levelRowLeft}>
                      <Text style={[
                        styles.levelName,
                        isCurrentLevel && styles.levelNameCurrent
                      ]}>
                        {threshold.level}
                      </Text>
                      <Text style={styles.levelMethod}>{threshold.method_range}</Text>
                    </View>
                    <Text style={styles.levelRange}>
                      {threshold.min}–{threshold.max} estudos
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(212, 168, 67, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  userRole: {
    fontSize: 14,
    color: '#8b949e',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#c9d1d9',
  },
  dangerItem: {
    borderColor: 'rgba(248, 81, 73, 0.3)',
  },
  dangerText: {
    color: '#f85149',
  },
  passwordForm: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  input: {
    backgroundColor: '#0d1117',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  saveButton: {
    backgroundColor: '#d4a843',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#0d1117',
    fontSize: 16,
    fontWeight: '600',
  },
  aboutCard: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#d4a843',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#c9d1d9',
    lineHeight: 20,
    marginBottom: 12,
  },
  aboutStats: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  aboutMethods: {
    fontSize: 12,
    color: '#8b949e',
    lineHeight: 18,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 81, 73, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(248, 81, 73, 0.3)',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#f85149',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 1,
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
  },
  modalBody: {
    padding: 20,
  },
  levelInfoText: {
    fontSize: 14,
    color: '#8b949e',
    lineHeight: 20,
    marginBottom: 16,
  },
  currentLevelBox: {
    backgroundColor: 'rgba(212, 168, 67, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.3)',
  },
  currentLevelLabel: {
    fontSize: 12,
    color: '#8b949e',
  },
  currentLevelValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d4a843',
    marginTop: 4,
  },
  currentLevelProgress: {
    fontSize: 14,
    color: '#c9d1d9',
    marginTop: 8,
  },
  levelTableTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0d1117',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  levelRowCurrent: {
    borderWidth: 1,
    borderColor: '#d4a843',
    backgroundColor: 'rgba(212, 168, 67, 0.05)',
  },
  levelRowLeft: {
    flex: 1,
  },
  levelName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c9d1d9',
  },
  levelNameCurrent: {
    color: '#d4a843',
  },
  levelMethod: {
    fontSize: 12,
    color: '#8b949e',
    marginTop: 2,
  },
  levelRange: {
    fontSize: 12,
    color: '#8b949e',
  },
});
