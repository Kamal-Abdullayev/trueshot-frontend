import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SignupView from '@/views/SignupView.vue'
import LoginView from '@/views/LoginView.vue'
import WelcomeView from '@/views/WelcomeView.vue'
import FeedView from '../views/FeedView.vue'
import CreatePostView from '../views/CreatePostView.vue'
import PostManagement from '../views/PostManagement.vue'
import CalendarView from '../views/CalendarView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: WelcomeView
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/feed',
      name: 'feed',
      component: FeedView,
      meta: { requiresAuth: true }
    },
    {
      path: '/create-post',
      name: 'create-post',
      component: CreatePostView,
      meta: { requiresAuth: true }
    },
    {
      path: '/posts',
      name: 'posts',
      component: PostManagement,
      meta: { requiresAuth: true }
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: CalendarView,
      meta: { requiresAuth: true }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: NotificationsView,
      meta: { requiresAuth: true }
    }
  ],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if trying to access protected route while not authenticated
    next('/login');
  } else {
    next();
  }
});

export default router
