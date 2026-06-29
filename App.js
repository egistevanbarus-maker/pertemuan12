import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  Alert, StyleSheet, Switch, SafeAreaView, Keyboard, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key untuk AsyncStorage
const TASKS_KEY = '@mytasklist_tasks';
const THEME_KEY = '@mytasklist_theme';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load Data saat aplikasi dibuka
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem(TASKS_KEY);
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedTheme !== null) setIsDarkMode(JSON.parse(savedTheme));
    } catch (error) {
      console.error('Gagal memuat data:', error);
    }
  };

  const saveTasks = async (newTasks) => {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(newTasks));
    } catch (error) {
      console.error('Gagal menyimpan tugas:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, JSON.stringify(newTheme));
    } catch (error) {
      console.error('Gagal menyimpan tema:', error);
    }
  };

  // Fungsi Tambah
  const addTask = () => {
    if (inputText.trim() === '') {
      Alert.alert('Peringatan', 'Tugas tidak boleh kosong!');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      text: inputText,
      completed: false,
      timestamp: new Date().toLocaleDateString('id-ID', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
      }) 
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    saveTasks(updatedTasks); 
    setInputText(''); 
    Keyboard.dismiss();
  };

  // Fungsi Toggle Selesai
  const toggleComplete = (id) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks); 
  };

  // Fungsi Konfirmasi Hapus
  const confirmDelete = (id) => {
    Alert.alert(
      'Hapus Tugas',
      'Yakin ingin menghapus tugas ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => deleteTask(id) }
      ]
    );
  };

  // Fungsi Hapus
  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks); 
  };

  // Konfigurasi Warna
  const colors = {
    background: isDarkMode ? '#0f172a' : '#f8fafc',
    text: isDarkMode ? '#f1f5f9' : '#0f172a',
    card: isDarkMode ? '#1e293b' : '#ffffff',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    primary: '#3b82f6',
    danger: '#ef4444',
    muted: isDarkMode ? '#94a3b8' : '#64748b'
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.muted }]}>
        Belum ada tugas. Mulai tambahkan tugas barumu!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>MyTaskList</Text>
        <View style={styles.themeToggle}>
          <Text style={{ color: colors.text, marginRight: 8 }}>
            {isDarkMode ? '🌙' : '☀️'}
          </Text>
          <Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ true: colors.primary }} />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Apa yang ingin dikerjakan?"
          placeholderTextColor={colors.muted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={addTask}
        />
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            
            <TouchableOpacity style={styles.taskContent} onPress={() => toggleComplete(item.id)}>
              <View style={[styles.checkbox, { borderColor: colors.primary }, item.completed && { backgroundColor: colors.primary }]}>
                {item.completed && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.taskText, { color: colors.text }, item.completed && styles.taskCompleted]}>
                  {item.text}
                </Text>
                <Text style={[styles.timestamp, { color: colors.muted }]}>
                  {item.timestamp}
                </Text>
              </View>
            </TouchableOpacity>
            
            {/* Tombol Hapus dengan hitSlop agar mudah diklik */}
            <TouchableOpacity 
              onPress={() => confirmDelete(item.id)} 
              style={styles.deleteButton}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Text style={{ color: colors.danger, fontWeight: 'bold', fontSize: 16 }}>X</Text>
            </TouchableOpacity>
            
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  themeToggle: { flexDirection: 'row', alignItems: 'center' },
  inputContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, height: 50, marginRight: 10 },
  addButton: { width: 50, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20, flexGrow: 1 },
  taskCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
  taskContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderRadius: 6, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkMark: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  textContainer: { flex: 1, paddingRight: 10 },
  taskText: { fontSize: 16 },
  taskCompleted: { textDecorationLine: 'line-through', opacity: 0.5 },
  timestamp: { fontSize: 12, marginTop: 4 },
  deleteButton: { padding: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, fontStyle: 'italic' }
});