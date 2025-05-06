<template>
  <div class="feed-container">
    <h1>Your Feed</h1>
    <div v-if="loading" class="loading">
      Loading posts...
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else-if="!posts || posts.length === 0" class="no-posts">
      No posts available. Follow some users to see their posts here!
    </div>
    <div v-else class="posts">
      <div v-for="post in posts" :key="post.userId" class="post-card">
        <div class="post-header">
          <div class="post-info">
            <h3>{{ post.title }}</h3>
            <span class="post-date">{{ formatDate(post.createdAt) }}</span>
          </div>
        </div>
        <div class="post-content">
          <p>{{ post.content }}</p>
          <img v-if="post.url" :src="post.url" alt="Post image" class="post-image" />
        </div>
        <div class="post-actions">
          <button class="action-button">
            <i class="fas fa-heart"></i> Like
          </button>
          <button class="action-button">
            <i class="fas fa-comment"></i> Comment
          </button>
          <button class="action-button">
            <i class="fas fa-share"></i> Share
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { feedService } from '@/services/feed.service';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

interface Post {
  title: string;
  content: string;
  url: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const router = useRouter();
const authStore = useAuthStore();
const posts = ref<Post[]>([]);
const loading = ref(true);
const error = ref('');

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fetchFeed = async () => {
  try {
    loading.value = true;
    error.value = '';
    const token = authStore.token;
    console.log('Current auth state:', {
      isAuthenticated: authStore.isAuthenticated,
      token: token,
      localStorageToken: localStorage.getItem('token')
    });

    if (!token) {
      console.error('No token found in auth store');
      router.push('/login');
      return;
    }

    const response = await feedService.getFeed(token);
    console.log('Feed response:', response);

    // Ensure posts is initialized as an array
    posts.value = Array.isArray(response) ? response : [];
  } catch (err) {
    error.value = 'Failed to load feed. Please try again later.';
    console.error('Error fetching feed:', err);
    if (err instanceof Error && err.message.includes('authentication')) {
      router.push('/login');
    }
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  console.log('FeedView mounted, auth state:', {
    isAuthenticated: authStore.isAuthenticated,
    token: authStore.token,
    localStorageToken: localStorage.getItem('token')
  });

  if (!authStore.isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    router.push('/login');
    return;
  }
  await fetchFeed();
});
</script>

<style scoped>
.feed-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error, .no-posts {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #dc3545;
}

.post-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  padding: 15px;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.post-info {
  flex: 1;
}

.post-info h3 {
  margin: 0;
  font-size: 1.1em;
}

.post-date {
  color: #666;
  font-size: 0.9em;
}

.post-content {
  margin-bottom: 15px;
}

.post-image {
  max-width: 100%;
  border-radius: 4px;
  margin-top: 10px;
}

.post-actions {
  display: flex;
  gap: 15px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.action-button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: #f5f5f5;
}
</style>