import { Alert, Platform } from 'react-native';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export function showAlert(title: string, message: string, buttons?: AlertButton[]) {
  if (Platform.OS === 'web') {
    if (!buttons || buttons.length <= 1) {
      window.alert(`${title}\n\n${message}`);
      const onPress = buttons?.[0]?.onPress;
      if (onPress) onPress();
    } else {
      // Find the action button (non-cancel)
      const cancelBtn = buttons.find(b => b.style === 'cancel');
      const actionBtn = buttons.find(b => b.style !== 'cancel') || buttons[buttons.length - 1];
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed) {
        actionBtn?.onPress?.();
      } else {
        cancelBtn?.onPress?.();
      }
    }
  } else {
    Alert.alert(title, message, buttons);
  }
}

export function showPrompt(title: string, message: string, callback: (text: string | null) => void) {
  if (Platform.OS === 'web') {
    const result = window.prompt(`${title}\n\n${message}`);
    callback(result);
  } else {
    // On iOS, Alert.prompt works. On Android, this needs a custom modal.
    // For now, use Alert.prompt on iOS and fallback on Android.
    if (Platform.OS === 'ios') {
      Alert.prompt(title, message, (text) => callback(text || null));
    } else {
      // Android doesn't support Alert.prompt — caller should use a modal
      callback(null);
    }
  }
}
