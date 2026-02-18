import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // First password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  const router = useRouter();
  const { login, changeFirstPassword } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const result = await login(username, password);
      if (result.must_change_password) {
        setShowPasswordModal(true);
      } else {
        router.replace('/dashboard');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    setChangingPassword(true);
    try {
      await changeFirstPassword(newPassword);
      setShowPasswordModal(false);
      Alert.alert('Sucesso', 'Senha alterada com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/dashboard') }
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.detail || 'Erro ao alterar senha');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.violinIcon}>
              <Ionicons name="musical-notes" size={60} color="#d4a843" />
            </View>
          </View>
          
          <Text style={styles.title}>Plano de Estudos</Text>
          <Text style={styles.subtitle}>Violino</Text>
          <Text style={styles.tagline}>Do Iniciante ao Virtuoso</Text>
          
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#8b949e" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Usuário"
                placeholderTextColor="#8b949e"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#8b949e" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#8b949e"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#8b949e"
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0d1117" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>
            
            <Text style={styles.hintSmall}>
              Entre com suas credenciais para acessar
            </Text>
          </View>
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>489</Text>
              <Text style={styles.statLabel}>Lições</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Sessões</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>60</Text>
              <Text style={styles.statLabel}>min/dia</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* First Login Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="shield-checkmark" size={48} color="#d4a843" />
              <Text style={styles.modalTitle}>Bem-vindo!</Text>
              <Text style={styles.modalSubtitle}>
                Por segurança, defina uma nova senha para sua conta
              </Text>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#8b949e" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nova senha (mín. 8 caracteres)"
                  placeholderTextColor="#8b949e"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#8b949e"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#8b949e" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar nova senha"
                  placeholderTextColor="#8b949e"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showNewPassword}
                />
              </View>

              {newPassword.length > 0 && newPassword.length < 8 && (
                <Text style={styles.passwordHint}>
                  <Ionicons name="information-circle" size={14} color="#f85149" /> Mínimo 8 caracteres
                </Text>
              )}

              {newPassword.length >= 8 && confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <Text style={styles.passwordHint}>
                  <Ionicons name="close-circle" size={14} color="#f85149" /> As senhas não coincidem
                </Text>
              )}

              {newPassword.length >= 8 && confirmPassword === newPassword && (
                <Text style={[styles.passwordHint, { color: '#3fb950' }]}>
                  <Ionicons name="checkmark-circle" size={14} color="#3fb950" /> Senhas conferem
                </Text>
              )}

              <TouchableOpacity
                style={[styles.button, changingPassword && styles.buttonDisabled]}
                onPress={handleChangePassword}
                disabled={changingPassword || newPassword.length < 8 || newPassword !== confirmPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator color="#0d1117" />
                ) : (
                  <Text style={styles.buttonText}>Definir Senha</Text>
                )}
              </TouchableOpacity>
            </View>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  violinIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(212, 168, 67, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212, 168, 67, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: '#d4a843',
    textAlign: 'center',
    fontWeight: '600',
  },
  tagline: {
    fontSize: 14,
    color: '#8b949e',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363d',
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#d4a843',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#0d1117',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hint: {
    color: '#8b949e',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
  },
  hintSmall: {
    color: '#6e7681',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#21262d',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d4a843',
  },
  statLabel: {
    fontSize: 12,
    color: '#8b949e',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#30363d',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8b949e',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  modalForm: {
    width: '100%',
  },
  passwordHint: {
    fontSize: 12,
    color: '#f85149',
    marginBottom: 12,
    marginLeft: 4,
  },
});
