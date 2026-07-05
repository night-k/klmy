<template>
  <div class="project-header-card">
    <div class="project-header-main">
      <div class="project-header-info">
        <div class="project-title-row">
          <el-popover placement="bottom-start" :width="360" trigger="click" popper-class="poms-project-quick-popper">
            <template #reference>
              <div class="project-title-switch">
                <i class="fas fa-folder project-title-folder" aria-hidden="true" />
                <span class="project-title-line">{{ projectTitleLine }}</span>
                <el-icon class="project-title-caret"><arrow-down /></el-icon>
              </div>
            </template>
            <div class="project-quick-menu">
              <div v-if="!quickList.length" class="project-quick-empty">暂无项目</div>
              <div v-for="p in quickList" :key="p.id" class="project-quick-row" @click="$emit('switch-project', p)">
                <div class="project-quick-row-inner">
                  <i class="fas fa-folder project-quick-folder" aria-hidden="true" />
                  <span>{{ p.projectName }}</span>
                  <span class="project-quick-sep">·</span>
                  <span>{{ p.code }}</span>
                </div>
              </div>
            </div>
          </el-popover>
          <span class="state-item">
            <span class="state-label">项目状态</span>
            <span class="status-chip" :class="statusClass">{{ statusText }}</span>
          </span>
          <span v-if="isDemoEnv" class="state-item">
            <span class="state-label">优先级</span>
            <span class="priority-tag medium">中</span>
          </span>
          <span v-if="isDemoEnv" class="state-item">
            <span class="state-label">业务状态</span>
            <span class="biz-status-tag normal">正常</span>
          </span>
          <span class="state-item role-switch">
            <span class="state-label">当前角色</span>
            <el-select :model-value="currentRole" size="small" style="width: 128px" @change="$emit('role-change', $event)">
              <el-option v-for="role in roleOptions" :key="role.value" :label="role.label" :value="role.value" />
            </el-select>
          </span>
        </div>
        <div class="project-meta-row">
          <span class="project-code">{{ project.code || '--' }}</span>
          <span class="meta-divider">|</span>
          <span>{{ cooperationLabel }}</span>
          <span class="meta-divider">|</span>
          <span>客户：{{ project.customName || '--' }}</span>
        </div>
      </div>
      <project-space-toolbar :can-finish="canFinish" @refresh="$emit('refresh')" @finish="$emit('finish')" />
    </div>

    <div class="stat-grid">
      <div class="stat-card stat-blue">
        <p class="stat-title">项目进度</p>
        <p class="stat-value">{{ taskStats.progress || 0 }}%</p>
        <p class="stat-sub">待审核 {{ taskStats.pendingReview || 0 }} 项</p>
      </div>
      <div class="stat-card stat-green">
        <p class="stat-title">合同金额</p>
        <p class="stat-value">¥{{ formatMoney(project.projectAmount) }}</p>
        <p class="stat-sub">项目经理：{{ project.projectManagerName || '--' }}</p>
      </div>
      <div class="stat-card stat-orange">
        <p class="stat-title">任务完成</p>
        <p class="stat-value">{{ taskStats.doneCount || 0 }}/{{ taskStats.totalCount || 0 }}</p>
        <p class="stat-sub">待办 {{ taskStats.todoCount || 0 }} 项</p>
      </div>
      <div class="stat-card stat-purple">
        <p class="stat-title">团队成员</p>
        <p class="stat-value">{{ (project.projectRoles || []).length }}人</p>
        <p class="stat-sub">里程碑 {{ (project.milestones || []).length }} 个</p>
      </div>
    </div>

    <div class="overall-progress">
      <div class="progress-head">
        <span>整体进度</span>
        <span>{{ taskStats.progress || 0 }}%</span>
      </div>
      <el-progress :percentage="taskStats.progress || 0" :stroke-width="8" :show-text="false" />
    </div>

    <div class="period-row">
      <span>计划周期：{{ project.planStartDate || '--' }} ~ {{ project.planEndDate || '--' }}</span>
      <span>服务类型：{{ serviceLabel }}</span>
    </div>

    <div class="project-ops-row">
      <el-button size="small" plain @click="$emit('go-expense')">项目费用</el-button>
      <el-button size="small" plain @click="$emit('go-risk')">风险管理</el-button>
      <el-button size="small" plain @click="$emit('go-overdue')">逾期预警</el-button>
      <el-button size="small" plain @click="$emit('go-quality')">质量统计</el-button>
    </div>
  </div>
</template>

<script>
import { ArrowDown } from '@element-plus/icons-vue';
import { PROJECT_STATUS, COOPERATION_TYPE, SERVICE_TYPE, labelOf } from '../option/dict';
import { isDemoEnv } from '../utils/demoEnv';
import ProjectSpaceToolbar from './ProjectSpaceToolbar.vue';

export default {
  name: 'ProjectSpaceHeader',
  components: { ProjectSpaceToolbar, ArrowDown },
  props: {
    project: { type: Object, default: () => ({}) },
    taskStats: { type: Object, default: () => ({}) },
    quickList: { type: Array, default: () => [] },
    canFinish: { type: Boolean, default: false },
    currentRole: { type: String, default: 'pm' },
    roleOptions: { type: Array, default: () => [] },
  },
  emits: ['refresh', 'finish', 'switch-project', 'go-expense', 'go-risk', 'go-overdue', 'go-quality', 'role-change'],
  data() {
    return { isDemoEnv };
  },
  computed: {
    projectTitleLine() {
      const name = this.project.projectName || '--';
      const code = this.project.code || '';
      return code ? `${name} · ${code}` : name;
    },
    statusText() {
      return labelOf(PROJECT_STATUS, this.project.pomsStatus);
    },
    statusClass() {
      const s = this.project.pomsStatus;
      if (s === 'completed') return 'status-done';
      if (['ongoing', 'pending_acceptance'].includes(s)) return 'status-doing';
      return 'status-default';
    },
    cooperationLabel() {
      return labelOf(COOPERATION_TYPE, this.project.cooperationType) || '自营';
    },
    serviceLabel() {
      return labelOf(SERVICE_TYPE, this.project.serviceType) || '--';
    },
  },
  methods: {
    formatMoney(v) {
      return Number(v || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 });
    },
  },
};
</script>
