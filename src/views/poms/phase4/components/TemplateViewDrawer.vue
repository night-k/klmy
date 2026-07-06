<template>
  <el-drawer v-model="visible" :title="null" size="760px" append-to-body destroy-on-close class="template-view-drawer" @closed="$emit('closed')">
    <div v-if="detail" v-loading="loading" class="template-view">
      <div class="template-view__hero">
        <div>
          <div class="template-view__code">{{ detail.code }}</div>
          <h2 class="template-view__title">{{ detail.name }}</h2>
          <div class="template-view__tags">
            <el-tag :type="TEMPLATE_TYPE_TAG[detail.type]" effect="dark" round>{{ labelOf(TEMPLATE_TYPE, detail.type) }}</el-tag>
            <el-tag :type="detail.status === 'active' ? 'success' : 'info'" effect="plain" round>
              {{ labelOf(TEMPLATE_STATUS, detail.status) }}
            </el-tag>
          </div>
        </div>
        <div class="template-view__meta">
          <div class="template-view__meta-label">使用次数</div>
          <div class="template-view__meta-value">{{ detail.usageCount || 0 }}</div>
        </div>
      </div>

      <el-card shadow="never" class="template-view__section">
        <template #header><span class="template-view__section-title">模板信息</span></template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="文件名">{{ detail.fileName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.createTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="说明" :span="2">{{ detail.description || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card shadow="never" class="template-view__section">
        <template #header><span class="template-view__section-title">模板文件</span></template>
        <bid-file-panel :model-value="fileList" readonly empty-text="尚未上传模板文件，请编辑后上传 Word/PDF" />
      </el-card>

      <div class="template-view__actions">
        <el-button type="primary" plain @click="$emit('edit', detail)">编辑模板</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import BidFilePanel from '@/views/poms/phase1/components/BidFilePanel.vue';
import { TEMPLATE_STATUS, TEMPLATE_TYPE, TEMPLATE_TYPE_TAG, labelOf } from '../option/dict';

export default {
  name: 'TemplateViewDrawer',
  components: { BidFilePanel },
  props: {
    modelValue: { type: Boolean, default: false },
    detail: { type: Object, default: null },
    loading: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'closed', 'edit'],
  data() {
    return { TEMPLATE_TYPE, TEMPLATE_STATUS, TEMPLATE_TYPE_TAG, labelOf };
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
    fileList() {
      return this.detail?.templateFile ? [this.detail.templateFile] : [];
    },
  },
};
</script>

<style scoped lang="scss">
.template-view {
  padding: 0 4px 24px;
}
.template-view__hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f0f9eb 0%, #f5f7fa 100%);
}
.template-view__code {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
.template-view__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
}
.template-view__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.template-view__meta {
  text-align: right;
}
.template-view__meta-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.template-view__meta-value {
  font-size: 26px;
  font-weight: 700;
  color: #2c7be5;
}
.template-view__section {
  margin-bottom: 16px;
  border-radius: 8px;
  :deep(.el-card__header) {
    padding: 12px 16px;
    background: var(--el-fill-color-light);
  }
}
.template-view__section-title {
  font-weight: 600;
}
.template-view__actions {
  display: flex;
  gap: 8px;
  padding: 16px 0;
}
</style>

<style lang="scss">
.template-view-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 20px 0;
  }
  .el-drawer__body {
    padding: 12px 20px 20px;
  }
}
</style>
