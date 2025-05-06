import { defineStore } from 'pinia';
import { feedService } from '@/services/feed.service';
import type { Post } from '@/types/post';

interface FeedState {
  posts: Post[];
  loading: boolean;
  error: string | null;
}

export const useFeedStore = defineStore('feed', {
  state: (): FeedState => ({
    posts: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchFeed() {
      this.loading = true;
      this.error = null;
      try {
        const response = await feedService.getFeed();
        this.posts = response.posts;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch feed';
      } finally {
        this.loading = false;
      }
    }
  }
});
