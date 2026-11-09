import { MD3LightTheme } from 'react-native-paper';

export const appTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1D4ED8',
    onPrimary: '#FFFFFF',
    primaryContainer: '#DBEAFE',
    onPrimaryContainer: '#0F172A',
    secondary: '#475569',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceVariant: '#E2E8F0',
    outline: '#CBD5E1',
    error: '#B91C1C',
  },
  roundness: 3,
};

export const globalStyles = {
  screen: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  mutedText: {
    color: appTheme.colors.secondary,
  },
  field: {
    marginTop: 12,
  },
  primaryButton: {
    marginTop: 20,
  },
};
