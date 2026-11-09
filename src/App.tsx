import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PaperProvider, Snackbar } from 'react-native-paper';

import { getDatabase } from './database';
import { LocalQueryProvider } from './data/localQuery';
import { InventoryRouter } from './router';
import { appTheme } from './theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
    <SafeAreaProvider>
      <LocalQueryProvider>
        <PaperProvider
          theme={appTheme}
          settings={{
            icon: (props) => <MaterialCommunityIcons {...props} />,
          }}
        >
          <View style={styles.container}>
            {databaseReady ? <InventoryRouter /> : null}
            <Snackbar
              visible={databaseError !== null}
              onDismiss={() => setDatabaseError(null)}
              duration={Snackbar.DURATION_LONG}
            >
              {databaseError?.message ??
                'Unable to initialize the database.'}
            </Snackbar>
            <StatusBar style="dark" />
          </View>
        </PaperProvider>
      </LocalQueryProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
