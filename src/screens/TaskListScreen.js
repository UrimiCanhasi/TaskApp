import React, { useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import TaskCard from '../components/TaskCard';
import TaskInput from '../components/TaskInput';
import SearchBar from '../components/SearchBar';
import FilterButtons from '../components/FilterButtons';
import { useTasks } from '../hooks/useTasks';

const TaskListScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const {
    tasks,
    loading,
    searchQuery,
    filterStatus,
    addTask,
    toggleTaskStatus,
    deleteTask,
    removeTask,
    updateTask,
    handleSearch,
    handleFilter,
    refresh,
  } = useTasks();

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No Tasks Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || filterStatus !== 'all' 
          ? 'Try adjusting your search or filters' 
          : 'Tap the + button to create your first task'}
      </Text>
    </View>
  );

  const renderTask = ({ item }) => (
    <TaskCard
      task={item}
      onPress={() => navigation.navigate('TaskDetail', {
        task: item,
        onTaskUpdate: (updatedTask) => {
          if (updateTask) updateTask(updatedTask.id, updatedTask);
        }
      ,
        onTaskRemove: async () => {
          if (removeTask) await removeTask(item.id);
        }
      })}
      onToggle={() => toggleTaskStatus(item.id)}
      onDelete={() => deleteTask(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <SearchBar value={searchQuery} onChange={handleSearch} />
      <FilterButtons currentFilter={filterStatus} onFilterChange={handleFilter} />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} />
          }
        />
      )}
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <TaskInput
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={addTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 40,
  },
});

export default TaskListScreen;