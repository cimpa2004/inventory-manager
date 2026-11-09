import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

import { globalStyles } from '../theme';

export function CameraPlaceholderScreen() {
  return (
    <View style={[globalStyles.screen, styles.container]}>
      <Icon source="camera-outline" size={48} />
      <Text variant="headlineSmall" style={styles.title}>
        Scanner
      </Text>
      <Text variant="bodyMedium" style={globalStyles.mutedText}>
        Camera scanning will be available here soon.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
  },
});
