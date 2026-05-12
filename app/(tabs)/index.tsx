import React, { useState } from 'react';
import {
  Platform,
  // eslint-disable-next-line deprecation/deprecation
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

const H_PAD = 14;
const GAP = 10;
const MAX_CALC_WIDTH = 420;

const BUTTONS = [
  ['AC', '⌫', '(', ')'],
  ['7', '8', '9', '÷'],
  ['4', '5', '6', '×'],
  ['1', '2', '3', '-'],
  ['%', '0', '.', '+'],
  ['='],
];

const OPERATORS = ['+', '-', '×', '÷'];

export default function Calculator() {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const calcW = Math.min(screenW, MAX_CALC_WIDTH);
  // Shrink buttons so display + grid fits in the available screen height.
  // 6 rows of buttons + 5 row-gaps + bottom padding + display area (140px)
  const BTN_FROM_W = (calcW - H_PAD * 2 - GAP * 3) / 4;
  const BTN_FROM_H = (screenH - 140 - 16 - GAP * 5) / 6;
  const BTN = Math.min(BTN_FROM_W, BTN_FROM_H);

  const [input, setInput] = useState('');
  const [history, setHistory] = useState('');
  const [isResult, setIsResult] = useState(false);

  const press = (label: string) => {
    if (label === 'AC') {
      setInput('');
      setHistory('');
      setIsResult(false);
      return;
    }

    if (label === '⌫') {
      if (isResult) {
        setInput('');
        setHistory('');
        setIsResult(false);
      } else {
        setInput(p => p.slice(0, -1));
      }
      return;
    }

    if (label === '=') {
      if (!input || input === 'Error') return;
      try {
        const sanitized = input
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/%/g, '/100');
        if (!/^[\d+\-*/.()^\s]+$/.test(sanitized)) throw new Error();
        // eslint-disable-next-line no-new-func
        const res: number = Function('"use strict"; return (' + sanitized + ')')();
        if (!isFinite(res) || isNaN(res)) throw new Error();
        const formatted = parseFloat(res.toFixed(10)).toString();
        setHistory(input + ' =');
        setInput(formatted);
        setIsResult(true);
      } catch {
        setHistory(input + ' =');
        setInput('Error');
        setIsResult(true);
      }
      return;
    }

    const isOp = OPERATORS.includes(label);

    if (isResult) {
      if (isOp) {
        setInput(p => p + label);
      } else {
        setInput(label);
        setHistory('');
      }
      setIsResult(false);
      return;
    }

    setInput(p => p + label);
  };

  const getBtnBg = (label: string) => {
    if (OPERATORS.includes(label) || label === '=') return styles.bgOrange;
    if (label === 'AC') return styles.bgRed;
    if (label === '⌫') return styles.bgGray;
    if (['(', ')', '%'].includes(label)) return styles.bgDark;
    return styles.bgMid;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.outer, { height: screenH }]}>
        <View style={[styles.calculator, { width: calcW }]}>
          {/* Display */}
          <View style={styles.display}>
            <Text style={styles.historyTxt} numberOfLines={1}>
              {history}
            </Text>
            <Text
              style={[styles.inputTxt, input === 'Error' && styles.errorTxt]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.35}
            >
              {input || '0'}
            </Text>
          </View>

          {/* Button Grid */}
          <View style={styles.grid}>
            {BUTTONS.map((row, ri) => (
              <View key={ri} style={styles.row}>
                {row.map(label => (
                  <TouchableOpacity
                    key={label}
                    style={[
                      {
                        width: BTN,
                        height: BTN,
                        borderRadius: BTN / 2,
                        justifyContent: 'center' as const,
                        alignItems: 'center' as const,
                      },
                      getBtnBg(label),
                      label === '=' && styles.btnFull,
                    ]}
                    onPress={() => press(label)}
                    activeOpacity={0.72}
                  >
                    <Text style={styles.btnTxt}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0,
  },
  outer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
  },
  calculator: {
    flex: 1,
    paddingHorizontal: H_PAD,
    paddingBottom: 16,
  },
  display: {
    height: 140,
    justifyContent: 'flex-end',
    paddingBottom: 12,
    paddingHorizontal: 4,
  },
  historyTxt: {
    color: '#636366',
    fontSize: 20,
    textAlign: 'right',
    marginBottom: 6,
  },
  inputTxt: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '200',
    textAlign: 'right',
  },
  errorTxt: {
    color: '#FF453A',
    fontSize: 48,
  },
  grid: { gap: GAP },
  row: { flexDirection: 'row', gap: GAP },
  btnFull: { flex: 1, width: undefined },
  btnTxt: { color: '#FFFFFF', fontSize: 28, fontWeight: '400' },
  bgOrange: { backgroundColor: '#FF9F0A' },
  bgRed: { backgroundColor: '#FF453A' },
  bgGray: { backgroundColor: '#48484A' },
  bgDark: { backgroundColor: '#2C2C2E' },
  bgMid: { backgroundColor: '#3A3A3C' },
});
