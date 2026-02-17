import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SESSION_OPTIONS = [
  { id: 'scales', label: 'Escalas e Arpejos' },
  { id: 'bow', label: 'Técnica de Arco' },
  { id: 'speed', label: 'Velocidade e Dedilhado' },
  { id: 'positions', label: 'Posições e Trinados' },
  { id: 'studies', label: 'Estudos e Caprichos' },
  { id: 'repertoire', label: 'Repertório' },
];

const CATEGORY_OPTIONS = [
  'Escalas', 'Arco', 'Dedilhado', 'Posições', 'Estudos', 'Repertório',
];

interface MethodFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { name: string; author: string; category: string; session_type: string }) => Promise<void>;
  initialData?: { name?: string; author?: string; category?: string; session_type?: string };
  isEditing?: boolean;
}

export default function MethodForm({ visible, onClose, onSave, initialData, isEditing }: MethodFormProps) {
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Estudos');
  const [sessionType, setSessionType] = useState('studies');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setAuthor(initialData.author || '');
      setCategory(initialData.category || 'Estudos');
      setSessionType(initialData.session_type || 'studies');
    } else {
      setName('');
      setAuthor('');
      setCategory('Estudos');
      setSessionType('studies');
    }
  }, [initialData, visible]);

  const handleSave = async () => {
    if (!name.trim() || !author.trim()) return;
    setLoading(true);
    try {
      await onSave({ name: name.trim(), author: author.trim(), category, session_type: sessionType });
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{isEditing ? 'Editar Método' : 'Novo Método'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#8b949e" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            <Text style={styles.label}>Nome do Método *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Wohlfahrt Op.45"
              placeholderTextColor="#8b949e"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Autor *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Franz Wohlfahrt"
              placeholderTextColor="#8b949e"
              value={author}
              onChangeText={setAuthor}
            />

            <Text style={styles.label}>Categoria</Text>
            <View style={styles.optionsRow}>
              {CATEGORY_OPTIONS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.optionChip, category === cat && styles.optionChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.optionText, category === cat && styles.optionTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {!isEditing && (
              <>
                <Text style={styles.label}>Sessão</Text>
                <View style={styles.optionsCol}>
                  {SESSION_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.sessionOption, sessionType === opt.id && styles.sessionOptionActive]}
                      onPress={() => setSessionType(opt.id)}
                    >
                      <View style={[styles.radio, sessionType === opt.id && styles.radioActive]} />
                      <Text style={[styles.sessionText, sessionType === opt.id && styles.sessionTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, (!name.trim() || !author.trim()) && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={loading || !name.trim() || !author.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#0d1117" size="small" />
              ) : (
                <Text style={styles.saveText}>{isEditing ? 'Salvar' : 'Criar'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  body: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c9d1d9',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#0d1117',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  optionChipActive: {
    backgroundColor: 'rgba(212,168,67,0.2)',
    borderColor: '#d4a843',
  },
  optionText: {
    fontSize: 13,
    color: '#8b949e',
  },
  optionTextActive: {
    color: '#d4a843',
    fontWeight: '600',
  },
  optionsCol: {
    gap: 6,
  },
  sessionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  sessionOptionActive: {
    borderColor: '#d4a843',
    backgroundColor: 'rgba(212,168,67,0.1)',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#8b949e',
    marginRight: 12,
  },
  radioActive: {
    borderColor: '#d4a843',
    backgroundColor: '#d4a843',
  },
  sessionText: {
    fontSize: 14,
    color: '#c9d1d9',
  },
  sessionTextActive: {
    color: '#d4a843',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#21262d',
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  cancelText: {
    color: '#8b949e',
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#d4a843',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: '#0d1117',
    fontSize: 16,
    fontWeight: '600',
  },
});
