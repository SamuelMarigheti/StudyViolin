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

interface LessonFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { title: string; subtitle: string; instruction: string; level: string; tags: string[] }) => Promise<void>;
  initialData?: { title?: string; subtitle?: string; instruction?: string; level?: string; tags?: string[] };
  isEditing?: boolean;
}

const LEVEL_OPTIONS = ['', 'Iniciante', 'Iniciante-Intermediário', 'Intermediário', 'Intermediário-Avançado', 'Avançado', 'Avançado Superior', 'Virtuoso'];

export default function LessonForm({ visible, onClose, onSave, initialData, isEditing }: LessonFormProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [instruction, setInstruction] = useState('');
  const [level, setLevel] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSubtitle(initialData.subtitle || '');
      setInstruction(initialData.instruction || '');
      setLevel(initialData.level || '');
      setTagsText((initialData.tags || []).join(', '));
    } else {
      setTitle('');
      setSubtitle('');
      setInstruction('');
      setLevel('');
      setTagsText('');
    }
  }, [initialData, visible]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const tags = tagsText.split(',').map(t => t.trim()).filter(Boolean);
      await onSave({
        title: title.trim(),
        subtitle: subtitle.trim(),
        instruction: instruction.trim(),
        level,
        tags,
      });
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
            <Text style={styles.title}>{isEditing ? 'Editar Lição' : 'Nova Lição'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#8b949e" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Estudo nº 1"
              placeholderTextColor="#8b949e"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Subtítulo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 60 Estudos Op.45"
              placeholderTextColor="#8b949e"
              value={subtitle}
              onChangeText={setSubtitle}
            />

            <Text style={styles.label}>Instrução</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Instruções de estudo..."
              placeholderTextColor="#8b949e"
              value={instruction}
              onChangeText={setInstruction}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Nível</Text>
            <View style={styles.levelRow}>
              {LEVEL_OPTIONS.filter(Boolean).map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.levelChip, level === l && styles.levelChipActive]}
                  onPress={() => setLevel(level === l ? '' : l)}
                >
                  <Text style={[styles.levelText, level === l && styles.levelTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Tags (separadas por vírgula)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: iniciante, arco, escalas"
              placeholderTextColor="#8b949e"
              value={tagsText}
              onChangeText={setTagsText}
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={loading || !title.trim()}
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  levelChipActive: {
    backgroundColor: 'rgba(212,168,67,0.2)',
    borderColor: '#d4a843',
  },
  levelText: {
    fontSize: 12,
    color: '#8b949e',
  },
  levelTextActive: {
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
