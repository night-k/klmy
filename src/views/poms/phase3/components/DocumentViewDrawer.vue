<template>
  <el-drawer v-model="visible" :title="`文档详情 · ${detail.name || ''}`" size="720px" append-to-body destroy-on-close @closed="$emit('closed')">
    <div v-if="detail.id" v-loading="loading" class="doc-drawer">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="文档编号">{{ detail.code }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ detail.version }}</el-descriptions-item>
        <el-descriptions-item label="文档类型">
          <el-tag size="small" :type="DOC_TYPE_TAG[detail.docType]">{{ labelOf(DOC_TYPE, detail.docType) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="文件格式">{{ labelOf(FILE_FORMAT, detail.fileFormat) }}</el-descriptions-item>
        <el-descriptions-item label="关联项目">{{ detail.projectName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="关联客户">{{ detail.customerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="上传人">{{ detail.uploaderName }}</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ detail.uploadTime }}</el-descriptions-item>
        <el-descriptions-item label="文件大小">{{ detail.fileSize || '-' }}</el-descriptions-item>
        <el-descriptions-item label="来源">
          <el-tag size="small" :type="detail.sourceType === 'auto' ? 'success' : ''">{{ labelOf(SOURCE_TYPE, detail.sourceType) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="权限范围">{{ labelOf(PERMISSION_SCOPE, detail.permissionScope) }}</el-descriptions-item>
        <el-descriptions-item label="允许下载">{{ detail.allowDownload ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="标签" :span="2">
          <el-tag v-for="t in detail.tags || []" :key="t" size="small" style="margin: 2px">{{ t }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detail.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div class="section-title">在线预览</div>
      <div class="preview-box">
        <div class="preview-mock">
          <i class="fas fa-file-alt preview-icon" />
          <p>{{ detail.name }}</p>
          <p class="preview-hint">演示模式：{{ labelOf(FILE_FORMAT, detail.fileFormat) }} 在线预览占位</p>
          <p v-if="detail.contentIndex" class="preview-snippet">{{ detail.contentIndex.slice(0, 120) }}…</p>
        </div>
      </div>

      <div v-if="detail.taskId || detail.projectId" class="section-title">业务关联</div>
      <div v-if="detail.taskId || detail.projectId" class="link-row">
        <el-button v-if="detail.projectId" link type="primary" @click="goProject">跳转项目空间</el-button>
        <el-button v-if="detail.taskId" link type="primary" @click="goTask">跳转关联任务</el-button>
        <el-button v-if="detail.sourceType === 'auto' && detail.docType === 'deliverable'" link type="primary" @click="goPhase2Task">来源：成果审核</el-button>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" :disabled="!detail.allowDownload" @click="$message.success('演示：下载已触发')">下载</el-button>
    </template>
  </el-drawer>
</template>

<script>
import { DOC_TYPE, FILE_FORMAT, PERMISSION_SCOPE, SOURCE_TYPE, DOC_TYPE_TAG, labelOf } from '../option/dict';

export default {
  props: {
    modelValue: Boolean,
    detail: { type: Object, default: () => ({}) },
    loading: Boolean,
  },
  emits: ['update:modelValue', 'closed'],
  data() {
    return { DOC_TYPE, FILE_FORMAT, PERMISSION_SCOPE, SOURCE_TYPE, DOC_TYPE_TAG, labelOf };
  },
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(v) {
        this.$emit('update:modelValue', v);
      },
    },
  },
  methods: {
    goProject() {
      if (this.detail.projectId) {
        this.$router.push(`/poms/phase2/projectSpace/${this.detail.projectId}`);
      }
    },
    goTask() {
      if (this.detail.taskId) {
        this.$router.push({ path: '/poms/phase2/task', query: { taskId: this.detail.taskId } });
      }
    },
    goPhase2Task() {
      this.$router.push({ path: '/poms/phase2/task', query: { status: 'pending_review' } });
    },
  },
};
</script>

<style scoped>
.section-title {
  margin: 16px 0 8px;
  font-weight: 600;
  color: #303133;
}
.preview-box {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
  min-height: 160px;
}
.preview-mock {
  padding: 24px;
  text-align: center;
  color: #606266;
}
.preview-icon {
  font-size: 36px;
  color: #409eff;
  margin-bottom: 8px;
}
.preview-hint {
  font-size: 12px;
  color: #909399;
}
.preview-snippet {
  font-size: 12px;
  text-align: left;
  background: #fff;
  padding: 8px;
  border-radius: 4px;
  margin-top: 12px;
  color: #909399;
}
.link-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
