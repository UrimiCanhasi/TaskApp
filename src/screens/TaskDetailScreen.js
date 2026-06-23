import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import api from '../api/api';

const TaskDetailScreen = ({ route, navigation }) => {
  const { task, onTaskUpdate, onTaskRemove } = route.params;

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [currentTask, setCurrentTask] = useState(task);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const loadComments = async () => {
    if (comments.length > 0) return; 
    
    try {
      setLoadingComments(true);
      const response = await api.get(`/posts/${task.id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const updateTaskInStorage = async (updatedTask) => {
    try {
      setCurrentTask(updatedTask);
      if (onTaskUpdate) {
        onTaskUpdate(updatedTask);
      } else {
        console.warn('onTaskUpdate callback not provided');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editedTitle.trim() || !editedDescription.trim()) {
      Alert.alert('Error', 'Both title and description are required.');
      return;
    }
    
    const updatedTask = {
      ...currentTask,
      title: editedTitle.trim(),
      description: editedDescription.trim(),
    };
    
    await updateTaskInStorage(updatedTask);
    setIsEditing(false);
    Alert.alert('Success', 'Task updated successfully!');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
            onPress: async () => {
            try {
              if (onTaskRemove) {
                await onTaskRemove();
              } else if (route.params && route.params.onTaskUpdate) {
                // fallback: signal parent to remove via update with null
                await route.params.onTaskUpdate({ ...currentTask, _deleted: true });
              } else {
                console.warn('No remove callback provided');
              }
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting task:', error);
            }
          }
        }
      ]
    );
  };

  const handleToggleStatus = async () => {
    const updatedTask = {
      ...currentTask,
      status: currentTask.status === 'completed' ? 'pending' : 'completed'
    };
    await updateTaskInStorage(updatedTask);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {isEditing ? (
          <View>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Enter title"
            />
            <Text style={[styles.label, { marginTop: 16 }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editedDescription}
              onChangeText={setEditedDescription}
              placeholder="Enter description"
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleSaveEdit}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{currentTask.title}</Text>
              <View style={[
                styles.statusBadge,
                currentTask.status === 'completed' ? styles.completedBadge : styles.pendingBadge
              ]}>
                <Text style={styles.statusText}>
                  {currentTask.status === 'completed' ? 'Completed' : 'Pending'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.description}>{currentTask.description}</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Created:</Text>
              <Text style={styles.infoValue}>{formatDate(currentTask.createdDate)}</Text>
            </View>
            
            {currentTask.fromApi && (
              <View style={styles.apiBadge}>
                <Text style={styles.apiBadgeText}>Imported from API</Text>
              </View>
            )}
            
            <View style={styles.actionContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.toggleButton]} 
                onPress={handleToggleStatus}
              >
                <Text style={styles.actionButtonText}>
                  {currentTask.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]} 
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]} 
                onPress={handleDelete}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>


            {comments.length > 0 && (
              <View style={styles.commentsContainer}>
                <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
                {comments.map((comment, index) => (
                  <View key={index} style={styles.commentItem}>
                    <Text style={styles.commentEmail}>{comment.email}</Text>
                    <Text style={styles.commentBody}>{comment.body}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
  },
  pendingBadge: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  apiBadge: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  apiBadgeText: {
    fontSize: 12,
    color: '#4A90E2',
  },
  actionContainer: {
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: '#4CAF50',
  },
  editButton: {
    backgroundColor: '#4A90E2',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  commentButton: {
    backgroundColor: '#E8F4FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  commentButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  commentsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  commentItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentEmail: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
    marginBottom: 4,
  },
  commentBody: {
    fontSize: 14,
    color: '#555',
  },
});

export default TaskDetailScreen;