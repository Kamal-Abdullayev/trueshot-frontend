export interface Post {
  id: string;
  content: string;
  authorName: string;
  authorAvatar: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  comments: number;
}

export interface FeedResponse {
  posts: Post[];
}
