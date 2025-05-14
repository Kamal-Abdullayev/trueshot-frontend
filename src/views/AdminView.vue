<template>
  <div class="admin-container">
    <div class="admin-header">
      <h1>Admin Dashboard</h1>
      <button @click="logout" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i>
        Logout
      </button>
    </div>
    <div class="admin-content">
      <div class="admin-section">
        <h2>Create New Group</h2>
        <form @submit.prevent="createGroup" class="create-group-form">
          <div class="form-group">
            <label for="groupName">Group Name</label>
            <input
              type="text"
              id="groupName"
              v-model="groupName"
              required
              placeholder="Enter group name"
              class="form-input"
            />
          </div>
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create Group' }}
          </button>
        </form>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="success" class="success-message">{{ success }}</div>
      </div>

      <div class="admin-section">
        <h2>Create New Challenge</h2>
        <form @submit.prevent="createChallenge" class="create-challenge-form">
          <div class="form-group">
            <label for="challengeTitle">Title</label>
            <input
              type="text"
              id="challengeTitle"
              v-model="challenge.title"
              required
              placeholder="Enter challenge title"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="challengeContent">Content</label>
            <textarea
              id="challengeContent"
              v-model="challenge.content"
              required
              placeholder="Enter challenge description"
              class="form-textarea"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="challengeGroup">Group</label>
            <select
              id="challengeGroup"
              v-model="challenge.groupId"
              required
              class="form-input"
            >
              <option value="">Select a group</option>
              <option v-for="group in groups" :key="group.id" :value="group.id">
                {{ group.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="challengePoints">Points</label>
            <input
              type="number"
              id="challengePoints"
              v-model.number="challenge.point"
              required
              min="0"
              step="0.1"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="challengeRewardTag">Reward Tag</label>
            <select
              id="challengeRewardTag"
              v-model="challenge.challengeRewardTag"
              required
              class="form-input"
            >
              <option value="">Select a reward tag</option>
              <option value="TOP_USER">Top User</option>
              <option value="LOOSER">Looser</option>
              <option value="DRAMA_QUEEN">Drama Queen</option>
              <option value="HA_HA_HA">Ha Ha Ha</option>
            </select>
          </div>
          <div class="form-group">
            <label for="challengeEndTime">End Time</label>
            <input
              type="datetime-local"
              id="challengeEndTime"
              v-model="challengeEndTime"
              required
              class="form-input"
            />
          </div>
          <button type="submit" class="submit-btn" :disabled="loadingChallenge">
            {{ loadingChallenge ? 'Creating...' : 'Create Challenge' }}
          </button>
        </form>
        <div v-if="challengeError" class="error-message">{{ challengeError }}</div>
        <div v-if="challengeSuccess" class="success-message">{{ challengeSuccess }}</div>
      </div>

      <div class="admin-section groups-section">
        <h2>Groups</h2>
        <div v-if="loadingGroups" class="loading">
          <div class="loading-spinner"></div>
          <p>Loading groups...</p>
        </div>
        <div v-else-if="groupsError" class="error-message">{{ groupsError }}</div>
        <div v-else-if="groups.length === 0" class="no-groups">
          <p>No groups created yet.</p>
        </div>
        <div v-else class="groups-list">
          <div v-for="group in groups" :key="group.id" class="group-card">
            <div class="group-info">
              <h3>{{ group.name }}</h3>
              <div class="group-meta">
                <div class="admin-info">
                  <span class="label">Admin:</span>
                  <span class="value">{{ group.admin.name }}</span>
                </div>
                <div class="members-info">
                  <span class="label">Members:</span>
                  <span class="value">{{ group.userList.length }}</span>
                </div>
              </div>
              <div class="members-list" v-if="group.userList.length > 0">
                <h4>Group Members:</h4>
                <ul>
                  <li v-for="user in group.userList" :key="user.id" class="member-item">
                    <span class="member-name">{{ user.name }}</span>
                    <span class="member-points">{{ user.point }} points</span>
                  </li>
                </ul>
              </div>
              <div v-else class="no-members">
                No members in this group yet
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { groupService, type Group } from '@/services/group.service'
import { challengeService, type CreateChallengeRequest } from '@/services/challenge.service'

const router = useRouter()
const groupName = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const groups = ref<Group[]>([])
const loadingGroups = ref(false)
const groupsError = ref('')

// Challenge form state
const challenge = ref<CreateChallengeRequest>({
  title: '',
  content: '',
  groupId: '',
  point: 0,
  challengeRewardTag: '',
  endTime: ''
})
const challengeEndTime = ref('')
const loadingChallenge = ref(false)
const challengeError = ref('')
const challengeSuccess = ref('')

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/login')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchGroups = async () => {
  try {
    loadingGroups.value = true
    groupsError.value = ''
    groups.value = await groupService.getGroups()
  } catch (err: any) {
    groupsError.value = err.response?.data?.message || 'Failed to fetch groups'
  } finally {
    loadingGroups.value = false
  }
}

const createGroup = async () => {
  try {
    loading.value = true
    error.value = ''
    success.value = ''

    await groupService.createGroup(groupName.value)
    success.value = 'Group created successfully!'
    groupName.value = ''
    await fetchGroups()
  } catch (err: any) {
    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else {
      error.value = 'Failed to create group. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

const createChallenge = async () => {
  try {
    loadingChallenge.value = true
    challengeError.value = ''
    challengeSuccess.value = ''

    // Format the datetime for the API
    const endTime = new Date(challengeEndTime.value)
    // Format as yyyy-MM-dd HH:mm:ss
    const year = endTime.getFullYear()
    const month = String(endTime.getMonth() + 1).padStart(2, '0')
    const day = String(endTime.getDate()).padStart(2, '0')
    const hours = String(endTime.getHours()).padStart(2, '0')
    const minutes = String(endTime.getMinutes()).padStart(2, '0')
    const seconds = String(endTime.getSeconds()).padStart(2, '0')
    challenge.value.endTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`

    console.log('Submitting challenge:', challenge.value)
    await challengeService.createChallenge({ ...challenge.value })
    challengeSuccess.value = 'Challenge created successfully!'
    
    // Reset form
    challenge.value = {
      title: '',
      content: '',
      groupId: '',
      point: 0,
      challengeRewardTag: '',
      endTime: ''
    }
    challengeEndTime.value = ''
  } catch (err: any) {
    console.error('Challenge creation error:', err)
    if (err.response?.data?.message) {
      challengeError.value = err.response.data.message
    } else if (err.message === 'No authentication token found') {
      challengeError.value = 'You are not logged in. Please log in again.'
    } else if (err.response?.status === 400) {
      challengeError.value = 'Invalid challenge data. Please check all fields.'
    } else if (err.response?.status === 401) {
      challengeError.value = 'Unauthorized. Please log in again.'
    } else if (err.response?.status === 403) {
      challengeError.value = 'You do not have permission to create challenges.'
    } else {
      challengeError.value = `Failed to create challenge: ${err.message || 'Unknown error'}`
    }
  } finally {
    loadingChallenge.value = false
  }
}

onMounted(() => {
  fetchGroups()
})
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #000;
  min-height: 100vh;
  color: #fff;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #333;
  margin-bottom: 2rem;
}

.admin-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.logout-btn {
  background: #dc3545;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background: #c82333;
}

.admin-content {
  background: #111;
  padding: 2rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.admin-section {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.admin-section h2 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: #fff;
}

.create-group-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #fff;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #333;
  border-radius: 8px;
  font-size: 1rem;
  background: #000;
  color: #fff;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #2196F3;
}

.submit-btn {
  background: #2196F3;
  color: #fff;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #1976D2;
}

.submit-btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid #dc3545;
  border-radius: 8px;
  color: #dc3545;
}

.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(40, 167, 69, 0.1);
  border: 1px solid #28a745;
  border-radius: 8px;
  color: #28a745;
}

.groups-section {
  margin-top: 2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #fff;
}

.loading-spinner {
  border: 3px solid #333;
  border-top: 3px solid #fff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-groups {
  text-align: center;
  padding: 2rem;
  background: #000;
  border-radius: 8px;
  color: #666;
}

.groups-list {
  display: grid;
  gap: 1rem;
}

.group-card {
  background: #000;
  border-radius: 8px;
  padding: 1rem;
  transition: transform 0.2s;
}

.group-card:hover {
  transform: translateY(-2px);
}

.group-info h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
}

.group-meta {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.admin-info, .members-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label {
  color: #888;
}

.value {
  color: #fff;
}

.members-list {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #333;
}

.members-list h4 {
  font-size: 0.9rem;
  color: #888;
  margin: 0 0 0.5rem 0;
}

.members-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #000;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.member-name {
  color: #fff;
  font-weight: 500;
}

.member-points {
  color: #666;
  font-size: 0.9rem;
}

.no-members {
  margin-top: 1rem;
  padding: 0.5rem;
  background: #000;
  border-radius: 4px;
  color: #666;
  text-align: center;
  font-size: 0.9rem;
}

.create-challenge-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-textarea {
  padding: 0.75rem;
  border: 1px solid #333;
  border-radius: 8px;
  font-size: 1rem;
  background: #000;
  color: #fff;
  transition: border-color 0.2s;
  min-height: 100px;
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: #2196F3;
}

select.form-input {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1em;
  padding-right: 2.5rem;
}
</style> 