import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getDatabase } from './database';

export default function App() {
  const [databaseReady, setDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState<Error | null>(null);

  useEffect(() => {
    getDatabase()
      .then(() => setDatabaseReady(true))
      .catch((error: unknown) => {
        setDatabaseError(
          error instanceof Error
            ? error
            : new Error('Unable to initialize the database.'),
        );
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text>
        {databaseError
          ? `Database initialization failed: ${databaseError.message}`
          : databaseReady
            ? 'Inventory database ready'
            : 'Initializing inventory database...'}
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
