import AsyncStorage from '@react-native-async-storage/async-storage';

const REAL_DATA_KEY = '@admin_real_data_mode';

export async function getRealDataMode(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(REAL_DATA_KEY);
    return value === 'true';
  } catch {
    return true;
  }
}

export async function setRealDataMode(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(REAL_DATA_KEY, enabled ? 'true' : 'false');
}
