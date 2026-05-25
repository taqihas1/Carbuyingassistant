import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getSearchRadius } from '../store/locationStore';

export default function SettingsScreen({ navigation }: any) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [priceAlertsEnabled, setPriceAlertsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Preferences</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={22} color="#3b82f6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>Get alerts for new listings</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
              thumbColor={notificationsEnabled ? '#3b82f6' : '#9ca3af'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="pricetag" size={22} color="#3b82f6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Price Alerts</Text>
                <Text style={styles.settingDescription}>Alert when prices drop</Text>
              </View>
            </View>
            <Switch
              value={priceAlertsEnabled}
              onValueChange={setPriceAlertsEnabled}
              trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
              thumbColor={priceAlertsEnabled ? '#3b82f6' : '#9ca3af'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon" size={22} color="#3b82f6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Switch to dark theme</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
              thumbColor={darkMode ? '#3b82f6' : '#9ca3af'}
            />
          </View>
        </View>

        <View style={styles.section}>
  
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Admin')}>
            <Ionicons name="shield-checkmark" size={22} color="#ef4444" />
            <Text style={styles.menuText}>Admin Panel</Text>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => alert('Thanks for rating!')}>
            <Ionicons name="star" size={22} color="#f59e0b" />
            <Text style={styles.menuText}>Rate the App</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => alert('Share this app with friends!')}>
            <Ionicons name="share-social" size={22} color="#3b82f6" />
            <Text style={styles.menuText}>Share with Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL('mailto:support@carbuyingassistant.com')}>
            <Ionicons name="mail" size={22} color="#3b82f6" />
            <Text style={styles.menuText}>Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL('https://example.com/privacy')}>
            <Ionicons name="lock-closed" size={22} color="#6b7280" />
            <Text style={styles.menuText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL('https://example.com/terms')}>
            <Ionicons name="document-text" size={22} color="#6b7280" />
            <Text style={styles.menuText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appName}>Car Buying Assistant</Text>
          <Text style={styles.appVersion}>Version 1.0.0 (Expo SDK 54)</Text>
          <Text style={styles.appDescription}>Find the best car deals from multiple marketplaces</Text>
          <Text style={styles.appPackage}>com.carbuyassistant.app</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  section: { backgroundColor: '#fff', marginTop: 12, paddingVertical: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#6b7280', paddingHorizontal: 16, paddingVertical: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 16, color: '#1f2937' },
  settingDescription: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 12 },
  menuText: { flex: 1, fontSize: 16, color: '#1f2937' },
  appInfo: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16 },
  appName: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  appVersion: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  appDescription: { fontSize: 13, color: '#9ca3af', marginTop: 8, textAlign: 'center' },
  appPackage: { fontSize: 11, color: '#d1d5db', marginTop: 4, textAlign: 'center', fontFamily: 'monospace' },
});
