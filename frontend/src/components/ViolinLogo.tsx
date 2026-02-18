import React from 'react';
import Svg, { Path, Line, Rect, Circle, G } from 'react-native-svg';

interface Props {
  size?: number;
}

export default function ViolinLogo({ size = 80 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <G transform="translate(16, 2)">
        {/* Scroll (voluta) */}
        <Path
          d="M14 2 C11 2, 8.5 4.5, 8.5 7 C8.5 9.5, 11 11, 12.5 9.5 C14 8, 12.5 5.5, 11 7"
          stroke="#d4a843"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Pegs */}
        <Line x1="9" y1="8" x2="6" y2="7" stroke="#d4a843" strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="9.5" y1="10.5" x2="6.5" y2="10" stroke="#d4a843" strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="21" y1="8" x2="24" y2="7" stroke="#d4a843" strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="20.5" y1="10.5" x2="23.5" y2="10" stroke="#d4a843" strokeWidth="1.5" strokeLinecap="round" />

        {/* Neck (braco) */}
        <Rect x="13" y="11" width="4" height="14" rx="1.5" fill="#6B4F10" stroke="#d4a843" strokeWidth="0.8" />

        {/* Upper bout */}
        <Path
          d="M7 25 C3 27.5, 0.5 31, 0.5 35 C0.5 37.5, 2.5 39.5, 7 39.5"
          stroke="#d4a843"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M23 25 C27 27.5, 29.5 31, 29.5 35 C29.5 37.5, 27.5 39.5, 23 39.5"
          stroke="#d4a843"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* C-bouts (cintura) */}
        <Path
          d="M7 39.5 C9 38, 9.5 37, 8 41 C6.5 44.5, 7 43, 7 43"
          stroke="#d4a843"
          strokeWidth="1.6"
          fill="none"
        />
        <Path
          d="M23 39.5 C21 38, 20.5 37, 22 41 C23.5 44.5, 23 43, 23 43"
          stroke="#d4a843"
          strokeWidth="1.6"
          fill="none"
        />

        {/* Lower bout (corpo inferior) */}
        <Path
          d="M7 43 C2.5 45, -0.5 49, -0.5 53 C-0.5 58.5, 5 62, 15 62 C25 62, 30.5 58.5, 30.5 53 C30.5 49, 27.5 45, 23 43"
          stroke="#d4a843"
          strokeWidth="2"
          fill="#1a1510"
          strokeLinecap="round"
        />

        {/* F-holes */}
        <Path
          d="M9 46 C7.5 49, 7.5 53, 9 56"
          stroke="#d4a843"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          opacity="0.9"
        />
        <Circle cx="9" cy="46" r="1" fill="#d4a843" opacity="0.6" />
        <Circle cx="9" cy="56" r="1" fill="#d4a843" opacity="0.6" />

        <Path
          d="M21 46 C22.5 49, 22.5 53, 21 56"
          stroke="#d4a843"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          opacity="0.9"
        />
        <Circle cx="21" cy="46" r="1" fill="#d4a843" opacity="0.6" />
        <Circle cx="21" cy="56" r="1" fill="#d4a843" opacity="0.6" />

        {/* Bridge (cavalete) */}
        <Path
          d="M11 50 L12 48 L15 47.5 L18 48 L19 50"
          stroke="#d4a843"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Strings (cordas) */}
        <Line x1="13.2" y1="12" x2="13.2" y2="58" stroke="#d4a843" strokeWidth="0.5" opacity="0.45" />
        <Line x1="14.6" y1="12" x2="14.6" y2="58" stroke="#d4a843" strokeWidth="0.5" opacity="0.45" />
        <Line x1="16" y1="12" x2="16" y2="58" stroke="#d4a843" strokeWidth="0.5" opacity="0.45" />
        <Line x1="17.4" y1="12" x2="17.4" y2="58" stroke="#d4a843" strokeWidth="0.5" opacity="0.45" />

        {/* Tailpiece (estandarte) */}
        <Path
          d="M13 57 L15 62 L17 57"
          stroke="#d4a843"
          strokeWidth="1.3"
          fill="#6B4F10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Chin rest hint (queixeira) */}
        <Path
          d="M22 56 C24 58, 25 60, 24 62"
          stroke="#d4a843"
          strokeWidth="1.2"
          fill="none"
          opacity="0.5"
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
}
