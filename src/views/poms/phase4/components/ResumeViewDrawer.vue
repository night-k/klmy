<template>
  <el-drawer v-model="visible" :title="null" size="720px" append-to-body destroy-on-close class="resume-view-drawer" @closed="$emit('closed')">
    <div v-if="detail" v-loading="loading" class="resume-view">
      <div class="resume-view__hero">
        <div>
          <div class="resume-view__code">{{ detail.fileName }}</div>
          <h2 class="resume-view__title">{{ detail.candidateName }}</h2>
          <div class="resume-view__tags">
            <el-tag effect="dark" round>{{ labelOf(RESUME_MEMBER_TYPE, detail.memberType) }}</el-tag>
            <el-tag type="success" effect="plain" round>{{ detail.matchRate }}% 匹配</el-tag>
          </div>
        </div>
      </div>
      <el-card shadow="never" class="resume-view__section">
        <template #header><span class="resume-view__section-title">生成信息</span></template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="模板">
            <el-link v-if="detail.templateId" type="primary" @click="goTemplate(detail.templateId)">{{ detail.templateName }}</el-link>
            <span v-else>{{ detail.templateName || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="生成时间">{{ detail.generatedAt }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
      <div class="resume-view__actions">
        <el-button type="primary" plain @click="$emit('go-bid', detail)">去投标包</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import { RESUME_MEMBER_TYPE, labelOf } from '../option/dict';

export default {
  name: 'ResumeViewDrawer',
  props: {
    modelValue: { type: Boolean, default: false },
    detail: { type: Object, default: null },
    loading: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'closed', 'go-bid'],
  data() {
    return { RESUME_MEMBER_TYPE, labelOf };
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
  },
  methods: {
    goTemplate(templateId) {
      this.$router.push({ path: '/poms/phase4/template', query: { templateId } });
    },
  },
};
</script>

<style scoped lang="scss">
.resume-view {
  padding: 0 4px 24px;
}
.resume-view__hero {
  padding: 20px 24px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f0f9eb 0%, #f5f7fa 100%);
}
.resume-view__code {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
.resume-view__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
}
.resume-view__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.resume-view__section {
  margin-bottom: 16px;
  border-radius: 8px;
  :deep(.el-card__header) {
    padding: 12px 16px;
    background: var(--el-fill-color-light);
  }
}
.resume-view__section-title {
  font-weight: 600;
}
.resume-view__actions {
  display: flex;
  gap: 8px;
}
</style>

<style lang="scss">
.resume-view-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 20px 0;
  }
  .el-drawer__body {
    padding: 12px 20px 20px;
  }
}
</style>
