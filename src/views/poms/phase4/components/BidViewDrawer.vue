<template>
  <el-drawer v-model="visible" :title="null" size="760px" append-to-body destroy-on-close class="bid-view-drawer" @closed="$emit('closed')">
    <div v-if="detail" v-loading="loading" class="bid-view">
      <div class="bid-view__hero">
        <div>
          <div class="bid-view__code">{{ detail.code }}</div>
          <h2 class="bid-view__title">{{ detail.projectName }}</h2>
          <div class="bid-view__tags">
            <el-tag :type="BID_STATUS_TAG[detail.status]" effect="dark" round>{{ labelOf(BID_STATUS, detail.status) }}</el-tag>
            <el-tag type="primary" effect="plain" round>{{ detail.customerName }}</el-tag>
          </div>
        </div>
        <div class="bid-view__meta">
          <div class="bid-view__meta-label">准备度</div>
          <div class="bid-view__meta-value">{{ progress }}%</div>
        </div>
      </div>

      <el-card shadow="never" class="bid-view__section">
        <template #header><span class="bid-view__section-title">组包情况</span></template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="模板">
            <el-link v-if="detail.templateId" type="primary" @click="goTemplate(detail.templateId)">{{ detail.templateName }}</el-link>
            <span v-else>{{ detail.templateName || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detail.updatedAt }}</el-descriptions-item>
          <el-descriptions-item label="成员数">{{ (detail.candidateIds || []).length }} / {{ detail.requiredRoles }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card shadow="never" class="bid-view__section">
        <template #header><span class="bid-view__section-title">成员列表</span></template>
        <div class="bid-view__tags">
          <el-tag v-for="(name, idx) in detail.memberNames || []" :key="idx" closable effect="plain" @close="$emit('remove-member', detail.candidateIds[idx])">
            {{ name }}
          </el-tag>
        </div>
      </el-card>

      <el-card shadow="never" class="bid-view__section">
        <template #header><span class="bid-view__section-title">添加成员</span></template>
        <el-select v-model="selectedMemberId" placeholder="选择已生成简历的成员" style="width: 100%; margin-bottom: 8px">
          <el-option v-for="m in eligibleMembers" :key="m.id" :label="`${m.name} · ${m.position}`" :value="m.id" :disabled="(detail.candidateIds || []).includes(m.id)" />
        </el-select>
        <el-button type="primary" plain :disabled="!selectedMemberId" @click="$emit('add-member', selectedMemberId)">加入投标包</el-button>
      </el-card>

      <div class="bid-view__actions">
        <el-button type="primary" plain @click="$emit('edit', detail)">编辑</el-button>
        <el-button type="success" plain @click="$emit('go-tender', detail)">去招投标页</el-button>
        <el-button type="warning" plain :disabled="detail.status === 'ready'" @click="$emit('mark-ready', detail)">标记可投标</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import { BID_STATUS, BID_STATUS_TAG, labelOf } from '../option/dict';

export default {
  name: 'BidViewDrawer',
  props: {
    modelValue: { type: Boolean, default: false },
    detail: { type: Object, default: null },
    eligibleMembers: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'closed', 'edit', 'go-tender', 'mark-ready', 'add-member', 'remove-member'],
  data() {
    return { BID_STATUS, BID_STATUS_TAG, labelOf, selectedMemberId: '' };
  },
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
    progress() {
      const total = Number(this.detail?.requiredRoles) || 0;
      const current = (this.detail?.candidateIds || []).length;
      if (!total) return 0;
      return Math.min(100, Math.round((current / total) * 100));
    },
  },
  watch: {
    detail() {
      this.selectedMemberId = '';
    },
  },
  methods: {
    goTemplate(templateId) {
      this.$router.push({ path: '/poms/phase4/template', query: { templateId } });
    },
  },
};
</script>

<style scoped lang="scss">
.bid-view {
  padding: 0 4px 24px;
}
.bid-view__hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f0f9eb 0%, #f5f7fa 100%);
}
.bid-view__code {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
.bid-view__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
}
.bid-view__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.bid-view__meta {
  text-align: right;
}
.bid-view__meta-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.bid-view__meta-value {
  font-size: 26px;
  font-weight: 700;
  color: #2c7be5;
}
.bid-view__section {
  margin-bottom: 16px;
  border-radius: 8px;
  :deep(.el-card__header) {
    padding: 12px 16px;
    background: var(--el-fill-color-light);
  }
}
.bid-view__section-title {
  font-weight: 600;
}
.bid-view__actions {
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
.bid-view-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 20px 0;
  }
  .el-drawer__body {
    padding: 12px 20px 20px;
  }
}
</style>
