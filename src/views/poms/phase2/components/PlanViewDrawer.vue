<template>
  <el-drawer v-model="visible" :title="null" size="860px" append-to-body destroy-on-close class="plan-view-drawer" @closed="$emit('closed')">
    <div v-if="detail" v-loading="loading" class="plan-view">
      <div class="plan-view__hero">
        <div>
          <div class="plan-view__code">{{ detail.projectCode }} · {{ detail.projectName }}</div>
          <h2 class="plan-view__title">计划 {{ detail.version }}</h2>
          <div class="plan-view__tags">
            <el-tag :type="statusTag(detail.status)" effect="dark" round>{{ statusLabel(detail.status) }}</el-tag>
            <el-tag type="info" effect="plain" round>{{ detail.planStartDate }} ~ {{ detail.planEndDate }}</el-tag>
          </div>
        </div>
        <div class="plan-view__meta">
          <div class="plan-view__meta-value">{{ (detail.tasks || []).length }}</div>
          <div class="plan-view__meta-label">任务数</div>
        </div>
      </div>

      <el-card shadow="never" class="plan-view__section">
        <template #header><span class="plan-view__section-title">阶段规划</span></template>
        <el-table :data="detail.phases || []" border size="small">
          <el-table-column prop="name" label="阶段名" min-width="120" />
          <el-table-column prop="startDate" label="开始" width="120" />
          <el-table-column prop="endDate" label="结束" width="120" />
          <el-table-column prop="deliverable" label="交付物" min-width="140" />
        </el-table>
      </el-card>

      <el-card shadow="never" class="plan-view__section">
        <template #header><span class="plan-view__section-title">任务分解</span></template>
        <el-table :data="detail.tasks || []" border size="small">
          <el-table-column prop="name" label="任务名" min-width="140" />
          <el-table-column label="阶段" min-width="110">
            <template #default="{ row }">{{ phaseName(row.phaseId) }}</template>
          </el-table-column>
          <el-table-column prop="assigneeName" label="责任人" width="100" />
          <el-table-column label="计划起止" min-width="180">
            <template #default="{ row }">{{ row.planStartDate }} ~ {{ row.planEndDate }}</template>
          </el-table-column>
          <el-table-column prop="workload" label="工作量" width="90" align="center" />
        </el-table>
      </el-card>

      <el-alert type="info" show-icon :closable="false" title="里程碑联动" description="计划生效后，将根据阶段周期自动更新项目里程碑的计划日期。" style="margin-bottom: 16px" />

      <div class="plan-view__actions">
        <el-button type="primary" plain @click="$emit('edit', detail)">编辑</el-button>
        <el-button v-if="detail.status !== 'active' && detail.status !== 'archived'" type="success" plain @click="$emit('activate', detail)">计划生效</el-button>
        <el-button v-if="detail.status === 'active'" type="warning" plain @click="$emit('archive', detail)">作废</el-button>
        <el-button type="primary" link @click="goMilestone">查看里程碑 →</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
export default {
  name: 'PlanViewDrawer',
  props: {
    modelValue: { type: Boolean, default: false },
    detail: { type: Object, default: null },
    loading: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'closed', 'edit', 'activate', 'archive'],
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
  },
  methods: {
    statusLabel(status) {
      if (status === 'active') return '已生效';
      if (status === 'archived') return '已归档';
      return '草稿';
    },
    statusTag(status) {
      if (status === 'active') return 'primary';
      if (status === 'archived') return 'info';
      return 'warning';
    },
    phaseName(phaseId) {
      return (this.detail?.phases || []).find(p => p.id === phaseId)?.name || '-';
    },
    goMilestone() {
      if (!this.detail?.projectId) return;
      this.$router.push({ path: '/poms/phase2/projectSpace', query: { projectId: this.detail.projectId, tab: 'milestone' } });
    },
  },
};
</script>

<style scoped lang="scss">
.plan-view {
  padding: 0 4px 24px;
}
.plan-view__hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #ecf5ff 0%, #f5f7fa 100%);
}
.plan-view__code {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
.plan-view__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
}
.plan-view__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.plan-view__meta {
  text-align: right;
  flex-shrink: 0;
}
.plan-view__meta-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.plan-view__meta-value {
  font-size: 26px;
  font-weight: 700;
  color: #2c7be5;
}
.plan-view__section {
  margin-bottom: 16px;
  border-radius: 8px;
  :deep(.el-card__header) {
    padding: 12px 16px;
    background: var(--el-fill-color-light);
  }
}
.plan-view__section-title {
  font-weight: 600;
}
.plan-view__actions {
  position: sticky;
  bottom: 0;
  padding: 16px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}
</style>

<style lang="scss">
.plan-view-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 20px 0;
  }
  .el-drawer__body {
    padding: 12px 20px 20px;
  }
}
</style>
