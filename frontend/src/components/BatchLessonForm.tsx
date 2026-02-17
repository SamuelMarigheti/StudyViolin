import React, { useState } from 'react';
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

interface BatchLessonFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    title_prefix: string;
    count: number;
    subtitle: string;
    instruction: string;
    level: string;
    tags: string[];
  }) => Promise<void>;
  methodName?: string;
}

export default function BatchLessonForm({ visible, onClose, onSave, methodName }: BatchLessonFormProps) {
  const [titlePrefix, setTitlePrefix] = useState('');
  const [count, setCount] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [instruction, setInstruction] = useState('');
  const [level, setLevel] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const num = parseInt(count, 10);
    if (!titlePrefix.trim() || !num || num < 1) return;
    setLoading(true);
    try {
      const tags = tagsText.split(',').map(t => t.trim()).filter(Boolean);
      await onSave({
        title_prefix: titlePrefix.trim(),
        count: num,
        subtitle: subtitle.trim(),
        instruction: instruction.trim(),
        level,
        tags,
      });
      onClose();
      // Reset fields
      setTitlePrefix('');
      setCount('');
      setSubtitle('');
      setInstruction('');
      setLevel('');
      setTagsText('');
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const num = parseInt(count, 10);
  const preview = num > 0 && titlePrefix.trim()
    ? `${titlePrefix.trim()} 1, ${titlePrefix.trim()} 2, ..., ${titlePrefix.trim()} ${num}`
    : '';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Lições em Lote</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#8b949e" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {methodName && (
              <View style={styles.methodBadge}>
                <Ionicons name="book-outline" size={16} color="#d4a843" />
                <Text style={styles.methodName}>{methodName}</Text>
              </View>
            )}

            <Text style={styles.label}>Prefixo do Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Wohlfahrt nº"
              placeholderTextColor="#8b949e"
              value={titlePrefix}
              onChangeText={setTitlePrefix}
            />

            <Text style={styles.label}>Quantidade *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 60"
              placeholderTextColor="#8b949e"
              value={count}
              onChangeText={setCount}
              keyboardType="numeric"
            />

            {preview ? (
              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>Preview:</Text>
                <Text style={styles.previewText}>{preview}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Subtítulo (padrão para todas)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 60 Estudos Op.45"
              placeholderTextColor="#8b949e"
              value={subtitle}
              onChangeText={setSubtitle}
            />

            <Text style={styles.label}>Instrução (padrão para todas)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Instruções de estudo..."
              placeholderTextColor="#8b949e"
              value={instruction}
              onChangeText={setInstruction}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Nível</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Iniciante"
              placeholderTextColor="#8b949e"
              value={level}
              onChangeText={setLevel}
            />

            <Text style={styles.label}>Tags (separadas por vírgula)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: estudos, iniciante"
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
              style={[styles.saveBtn, (!titlePrefix.trim() || !num || num < 1) && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={loading || !titlePrefix.trim() || !num || num < 1}
            >
              {loading ? (
                <ActivityIndicator color="#0d1117" size="small" />
              ) : (
                <Text style={styles.saveText}>
                  Criar {num > 0 ? `${num} Lições` : 'Lições'}
                </Text>
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
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(212,168,67,0.1)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.3)',
  },
  methodName: {
    color: '#d4a843',
    fontSize: 14,
    fontWeight: '600',
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
    minHeight: 60,
    textAlignVertical: 'top',
  },
  previewBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(88,166,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(88,166,255,0.3)',
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#58a6ff',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 13,
    color: '#c9d1d9',
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
