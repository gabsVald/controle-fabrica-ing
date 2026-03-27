import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';

export default function HeaderApp({ onBack, title }) {
  const { isDarkMode, setIsDarkMode } = useContext(AppContext);

  return (
    <View style={[styles.header, isDarkMode ? styles.headerDark : styles.headerLight]}>
      <View style={styles.sideContainer}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#f8fafc" : "#1e293b"} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.titleContainer}>
        <Text style={[styles.headerTitle, isDarkMode ? styles.textDark : styles.textLight]}>
          {title || "ING"}
        </Text>
      </View>

      <View style={styles.sideContainer}>
        <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)} style={styles.themeBtn}>
          <Ionicons name={isDarkMode ? "sunny" : "moon"} size={22} color={isDarkMode ? "#fbbf24" : "#1e293b"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  headerLight: { backgroundColor: '#fff', borderBottomColor: '#e2e8f0' },
  headerDark: { backgroundColor: '#0f172a', borderBottomColor: '#334155' },
  sideContainer: { width: 40, alignItems: 'center' },
  titleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  textLight: { color: '#1e293b' },
  textDark: { color: '#f8fafc' },
  backButton: { padding: 5 },
  themeBtn: { padding: 5 }
});