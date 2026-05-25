import * as Location from 'expo-location';

export async function getZipFromLocation(): Promise<string | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Location permission denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.postcode || data.postalCode || null;
  } catch (error) {
    console.error('Error getting zip from location:', error);
    return null;
  }
}
