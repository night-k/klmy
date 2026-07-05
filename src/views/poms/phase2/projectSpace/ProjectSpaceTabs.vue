<template>
  <div class="space-tabs">
    <div v-for="tab in tabs" :key="tab.key" class="tab-item" :class="{ active: modelValue === tab.key }" @click="$emit('update:modelValue', tab.key)">
      <i v-if="tab.icon" class="tab-icon" :class="tab.icon" aria-hidden="true" />
      <span>{{ tab.label }}</span>
      <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectSpaceTabs',
  props: {
    modelValue: { type: String, default: 'basic' },
    tabs: { type: Array, default: () => [] },
  },
  emits: ['update:modelValue'],
};
</script>
