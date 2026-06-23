import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { loadTasks, saveTasks } from '../utils/storage';
import { fetchPosts } from '../api/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'pending'

  // Load tasks from storage or API
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      
      // First try to load from local storage
      const storedTasks = await loadTasks();
      
      if (storedTasks && storedTasks.length > 0) {
        setTasks(storedTasks);
        setFilteredTasks(storedTasks);
        setLoading(false);
        return;
      }

      // If no tasks in storage, fetch from API
      const posts = await fetchPosts();
      const apiTasks = posts.map((post, index) => ({
        id: `task_${Date.now()}_${index}`,
        title: post.title,
        description: post.body,
        status: Math.random() > 0.5 ? 'completed' : 'pending',
        createdDate: new Date().toISOString(),
        fromApi: true,
      }));
      
      setTasks(apiTasks);
      setFilteredTasks(apiTasks);
      await saveTasks(apiTasks);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters and search
  const applyFilters = useCallback(() => {
    let filtered = tasks;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => 
        task.status === filterStatus
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query)
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, filterStatus, searchQuery]);

  // Add a new task
  const addTask = useCallback(async (title, description) => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Validation Error', 'Please fill in both title and description.');
      return false;
    }

    const newTask = {
      id: `task_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      status: 'pending',
      createdDate: new Date().toISOString(),
      fromApi: false,
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    // update filtered list immediately based on current search/filter
    let updatedFiltered = updatedTasks;
    if (filterStatus !== 'all') {
      updatedFiltered = updatedFiltered.filter(t => t.status === filterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      updatedFiltered = updatedFiltered.filter(t =>
        t.title.toLowerCase().includes(q)
      );
    }
    setFilteredTasks(updatedFiltered);
    await saveTasks(updatedTasks);
    return true;
  }, [tasks, applyFilters]);

  // Toggle task status
  const toggleTaskStatus = useCallback(async (taskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: task.status === 'completed' ? 'pending' : 'completed'
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    // compute filtered immediately
    let updatedFiltered = updatedTasks;
    if (filterStatus !== 'all') {
      updatedFiltered = updatedFiltered.filter(t => t.status === filterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      updatedFiltered = updatedFiltered.filter(t =>
        t.title.toLowerCase().includes(q)
      );
    }
    setFilteredTasks(updatedFiltered);
    await saveTasks(updatedTasks);
  }, [tasks, applyFilters]);

  // Delete a task
  const deleteTask = useCallback(async (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            setTasks(updatedTasks);
            // update filtered immediately
            let updatedFiltered = updatedTasks;
            if (filterStatus !== 'all') {
              updatedFiltered = updatedFiltered.filter(t => t.status === filterStatus);
            }
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase().trim();
              updatedFiltered = updatedFiltered.filter(t =>
                t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
              );
            }
            setFilteredTasks(updatedFiltered);
            await saveTasks(updatedTasks);
          }
        }
      ]
    );
  }, [tasks, applyFilters]);

  // Remove task without confirmation (useful for detail screen navigation)
  const removeTask = useCallback(async (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    // update filtered immediately
    let updatedFiltered = updatedTasks;
    if (filterStatus !== 'all') {
      updatedFiltered = updatedFiltered.filter(t => t.status === filterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      updatedFiltered = updatedFiltered.filter(t =>
        t.title.toLowerCase().includes(q)
      );
    }
    setFilteredTasks(updatedFiltered);
    await saveTasks(updatedTasks);
  }, [tasks, applyFilters]);

  // Update task
  const updateTask = useCallback(async (taskId, updatedData) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, ...updatedData };
      }
      return task;
    });
    setTasks(updatedTasks);
    // update filtered immediately
    let updatedFiltered = updatedTasks;
    if (filterStatus !== 'all') {
      updatedFiltered = updatedFiltered.filter(t => t.status === filterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      updatedFiltered = updatedFiltered.filter(t =>
        t.title.toLowerCase().includes(q)
      );
    }
    setFilteredTasks(updatedFiltered);
    await saveTasks(updatedTasks);
  }, [tasks, applyFilters]);

  // Search handler
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Filter handler
  const handleFilter = useCallback((status) => {
    setFilterStatus(status);
  }, []);

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters();
  }, [tasks, filterStatus, searchQuery, applyFilters]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    tasks: filteredTasks,
    allTasks: tasks,
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
    refresh: loadInitialData,
  };
};