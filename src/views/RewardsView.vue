<template>
  <div class="rewards-container">
    <div class="rewards-header">
      <h1>Your Achievements</h1>
      <div class="points-display">
        <div class="points-circle">
          <span class="points-value">{{ points }}</span>
          <span class="points-label">Points</span>
        </div>
      </div>
    </div>

    <div class="rewards-grid">
      <div v-for="reward in rewards" :key="reward.id" class="reward-card" :class="getRewardClass(reward.type)">
        <div class="reward-icon">
          <i :class="getRewardIcon(reward.type)"></i>
        </div>
        <div class="reward-info">
          <h3>{{ formatRewardType(reward.type) }}</h3>
          <p>{{ reward.description }}</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading rewards...</p>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { rewardService } from '@/services/reward.service'
import type { Reward } from '@/types/reward'
import { RewardType } from '@/types/reward'

const authStore = useAuthStore()
const points = ref<number>(0)
const rewards = ref<Reward[]>([])
const loading = ref<boolean>(true)
const error = ref<string>('')

const fetchData = async () => {
  console.log('RewardsView: fetchData called');
  try {
    loading.value = true
    error.value = ''
    
    console.log('RewardsView: Starting to fetch points and rewards');
    const [userPoints, userRewards] = await Promise.all([
      rewardService.getUserPoints(),
      rewardService.getUserRewards()
    ])
    console.log('RewardsView: Successfully fetched data:', { userPoints, userRewards });

    points.value = userPoints
    // Transform string array into Reward objects
    rewards.value = userRewards.map((type, index) => ({
      id: index.toString(),
      type: type as RewardType,
      description: `Achieved ${formatRewardType(type as RewardType)} status`
    }));
    console.log('RewardsView: Processed rewards:', rewards.value);
  } catch (err: any) {
    console.error('RewardsView: Error in fetchData:', err);
    error.value = err.message || 'Failed to load rewards'
  } finally {
    console.log('RewardsView: fetchData completed, setting loading to false');
    loading.value = false
  }
}

const getRewardClass = (type: RewardType): string => {
  const classes = {
    [RewardType.TOP_USER]: 'reward-top-user',
    [RewardType.LOOSER]: 'reward-looser',
    [RewardType.DRAMA_QUEEN]: 'reward-drama-queen',
    [RewardType.HA_HA_HA]: 'reward-ha-ha-ha'
  }
  return classes[type] || ''
}

const getRewardIcon = (type: RewardType): string => {
  const icons = {
    [RewardType.TOP_USER]: 'fas fa-crown',
    [RewardType.LOOSER]: 'fas fa-trophy',
    [RewardType.DRAMA_QUEEN]: 'fas fa-theater-masks',
    [RewardType.HA_HA_HA]: 'fas fa-laugh-squint'
  }
  return icons[type] || 'fas fa-medal'
}

const formatRewardType = (type: RewardType): string => {
  return type.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ')
}

onMounted(() => {
  console.log('RewardsView: Component mounted');
  fetchData()
})
</script>

<style scoped>
.rewards-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background-color: #000;
  color: #fff;
}

.rewards-header {
  text-align: center;
  margin-bottom: 3rem;
}

.points-display {
  margin-top: 2rem;
}

.points-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2196F3, #1976D2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  box-shadow: 0 0 20px rgba(33, 150, 243, 0.3);
}

.points-value {
  font-size: 2.5rem;
  font-weight: bold;
}

.points-label {
  font-size: 1rem;
  opacity: 0.8;
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.reward-card {
  background: #111;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease;
  border: 1px solid #333;
}

.reward-card:hover {
  transform: translateY(-5px);
}

.reward-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.reward-info {
  flex: 1;
}

.reward-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.reward-info p {
  margin: 0 0 0.5rem 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-spinner {
  border: 4px solid #333;
  border-top: 4px solid #2196F3;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #ff4444;
  text-align: center;
  padding: 1rem;
  background: rgba(255, 68, 68, 0.1);
  border-radius: 8px;
  margin-top: 2rem;
}

/* Reward type specific styles */
.reward-top-user {
  background: linear-gradient(135deg, #111, #1a237e);
  border-color: #3949ab;
}

.reward-top-user .reward-icon {
  background: rgba(57, 73, 171, 0.2);
  color: #3949ab;
}

.reward-looser {
  background: linear-gradient(135deg, #111, #b71c1c);
  border-color: #d32f2f;
}

.reward-looser .reward-icon {
  background: rgba(211, 47, 47, 0.2);
  color: #d32f2f;
}

.reward-drama-queen {
  background: linear-gradient(135deg, #111, #880e4f);
  border-color: #c2185b;
}

.reward-drama-queen .reward-icon {
  background: rgba(194, 24, 91, 0.2);
  color: #c2185b;
}

.reward-ha-ha-ha {
  background: linear-gradient(135deg, #111, #f57f17);
  border-color: #ffa000;
}

.reward-ha-ha-ha .reward-icon {
  background: rgba(255, 160, 0, 0.2);
  color: #ffa000;
}
</style> 