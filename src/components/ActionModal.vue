<template>
  <div v-if="show" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ isSuccess ? 'Success' : 'Error' }}</h3>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      <div class="modal-body">
        {{ message }}
      </div>
      <div class="modal-footer">
        <button class="ok-btn" @click="close">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  show: boolean
  message: string
  isSuccess: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #111;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #333;
}

.modal-header h3 {
  margin: 0;
  color: v-bind('isSuccess ? "#4CAF50" : "#ff4444"');
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
}

.modal-body {
  padding: 1.5rem;
  color: #fff;
  text-align: center;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #333;
  display: flex;
  justify-content: center;
}

.ok-btn {
  background: v-bind('isSuccess ? "#4CAF50" : "#2c5282"');
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 2rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.ok-btn:hover {
  background: v-bind('isSuccess ? "#45a049" : "#2b6cb0"');
}
</style> 