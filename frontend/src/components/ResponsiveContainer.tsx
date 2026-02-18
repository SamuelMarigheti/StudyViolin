import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useResponsive } from '../utils/responsive';

interface Props {
  children: React.ReactNode;
  maxWidth?: number;
  style?: ViewStyle;
}

export default function ResponsiveContainer({ children, maxWidth, style }: Props) {
  const { contentMaxWidth } = useResponsive();
  const effectiveMaxWidth = maxWidth || contentMaxWidth;

  return (
    <View
      style={[
        {
          width: '100%',
          maxWidth: effectiveMaxWidth,
          alignSelf: 'center',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
