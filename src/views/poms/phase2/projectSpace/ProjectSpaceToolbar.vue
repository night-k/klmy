<template>
  <div class="project-space-toolbar">
    <div class="toolbar-actions">
      <el-tooltip v-if="isDemoEnv" :content="priorityTip" :disabled="!priorityTip">
        <span>
          <el-button class="action-btn action-priority" :disabled="!!priorityTip" @click="onPriority">
            <i class="fas fa-sort-amount-down action-btn-icon" aria-hidden="true" />
            优先级调整
          </el-button>
        </span>
      </el-tooltip>
      <el-tooltip :content="finishTip" :disabled="!finishTip">
        <span>
          <el-button class="action-btn action-finish" :disabled="!!finishTip" @click="$emit('finish')">
            <i class="fas fa-check action-btn-icon" aria-hidden="true" />
            {{ finishLabel }}
          </el-button>
        </span>
      </el-tooltip>
      <el-button icon="el-icon-refresh" @click="$emit('refresh')">刷新</el-button>
    </div>
  </div>
</template>

<script>
import { isDemoEnv } from '../utils/demoEnv';

export default {
  name: 'PomsProjectSpaceToolbar',
  props: {
    canFinish: { type: Boolean, default: false },
  },
  emits: ['refresh', 'finish'],
  data() {
    return { isDemoEnv };
  },
  computed: {
    finishLabel() {
      return this.canFinish ? '确认项目完成' : '待最终验收';
    },
    finishTip() {
      return this.canFinish ? '' : '需通过项目验收（最终验收通过）后方可标记完成';
    },
    priorityTip() {
      return '优先级调整功能待接入';
    },
  },
  methods: {
    onPriority() {
      this.$message.info('优先级调整功能待接入');
    },
  },
};
</script>

<style lang="scss" scoped>
.project-space-toolbar {
  flex-shrink: 0;
}
.toolbar-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}
.action-btn {
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}
.action-btn-icon {
  font-size: 14px;
  margin-right: 4px;
}
.action-priority {
  background: #dbeafe;
  color: #2563eb;
}
.action-finish {
  background: #dcfce7;
  color: #16a34a;
}
</style>
