<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { groupService, type Group } from '@/services/group.service';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const groupName = ref('');
const groups = ref<Group[]>([]);
const error = ref('');
const success = ref('');
const isLoading = ref(false);

const fetchGroups = async () => {
  try {
    isLoading.value = true;
    error.value = '';
    groups.value = await groupService.getGroups();
  } catch (err) {
    error.value = 'Failed to fetch groups. Please try again.';
    console.error('Error fetching groups:', err);
  } finally {
    isLoading.value = false;
  }
};

const createGroup = async () => {
  try {
    error.value = '';
    success.value = '';
    
    if (!groupName.value.trim()) {
      error.value = 'Group name is required';
      return;
    }

    const newGroup = await groupService.createGroup(groupName.value);
    groups.value.push(newGroup);
    success.value = 'Group created successfully!';
    groupName.value = '';
  } catch (err) {
    error.value = 'Failed to create group. Please try again.';
    console.error('Error creating group:', err);
  }
};

onMounted(fetchGroups);
</script>

<template>
  <div class="admin-container">
    <h1>Admin Dashboard</h1>
    
    <div class="group-creation-section">
      <h2>Create New Group</h2>
      <div class="form-group">
        <input
          v-model="groupName"
          type="text"
          placeholder="Enter group name"
          class="form-input"
        />
        <button @click="createGroup" class="create-btn">Create Group</button>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-if="success" class="success-message">
        {{ success }}
      </div>
    </div>

    <div class="groups-list">
      <h2>Existing Groups</h2>
      <div v-if="isLoading" class="loading">
        Loading groups...
      </div>
      <div v-else-if="groups.length === 0" class="no-groups">
        No groups created yet
      </div>
      <div v-else class="groups-grid">
        <div v-for="group in groups" :key="group.id" class="group-card">
          <h3>{{ group.name }}</h3>
          <p>Admin: {{ group.adminUsername }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

.group-creation-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.create-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.create-btn:hover {
  background-color: #3aa876;
}

.error-message {
  color: #dc3545;
  margin-top: 1rem;
}

.success-message {
  color: #28a745;
  margin-top: 1rem;
}

.groups-list {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.no-groups {
  color: #6c757d;
  text-align: center;
  padding: 2rem;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.group-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.group-card h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.group-card p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.loading {
  color: #6c757d;
  text-align: center;
  padding: 2rem;
  font-style: italic;
}
</style> 