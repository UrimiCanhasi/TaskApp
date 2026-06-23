import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const TaskCard = ({ task, onPress, onToggle, onDelete }) => {
  const isCompleted = task.status === 'completed';
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text 
            style={[
              styles.title, 
              isCompleted && styles.completedText
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          <View style={[
            styles.statusBadge,
            isCompleted ? styles.completedBadge : styles.pendingBadge
          ]}>
            <Text style={styles.statusText}>
              {isCompleted ? 'Done' : 'Pending'}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={onDelete}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.deleteText}>X</Text>
        </TouchableOpacity>
      </View>
      
      <Text 
        style={[
          styles.description,
          isCompleted && styles.completedText
        ]}
        numberOfLines={2}
      >
        {task.description}
      </Text>
      
      <View style={styles.footerContainer}>
        <Text style={styles.date}>
          {formatDate(task.createdDate)}
        </Text>
        <TouchableOpacity 
          onPress={onToggle}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {isCompleted ? 'Mark Pending' : 'Mark Done'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  completedText: {
    color: '#999',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
  },
  pendingBadge: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  deleteText: {
    fontSize: 18,
    color: '#ff4444',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#4A90E2',
    borderRadius: 15,
  },
  toggleText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});

export default TaskCard;