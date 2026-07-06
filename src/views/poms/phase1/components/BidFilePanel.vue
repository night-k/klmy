<template>
  <div class="bid-file-panel">
    <div v-if="!readonly" class="bid-file-panel__upload">
      <el-upload drag :show-file-list="false" :auto-upload="true" :http-request="handleUpload" :accept="accept" :disabled="uploading || (limit > 0 && fileList.length >= limit)">
        <el-icon class="bid-file-panel__icon"><upload-filled /></el-icon>
        <div class="bid-file-panel__tip">{{ uploadLabel }}，或<em>点击上传</em></div>
        <template #tip>
          <div class="bid-file-panel__hint">{{ hintText }}{{ limit ? `，最多 ${limit} 个` : '' }}</div>
        </template>
      </el-upload>
    </div>

    <el-empty v-if="!fileList.length" :description="emptyText" :image-size="72" />
    <div v-else class="bid-file-panel__list">
      <div v-for="file in fileList" :key="file.id" class="bid-file-panel__item">
        <div class="bid-file-panel__item-main">
          <el-icon class="bid-file-panel__file-icon"><document /></el-icon>
          <div class="bid-file-panel__meta">
            <div class="bid-file-panel__name" :title="file.name">{{ file.name }}</div>
            <div class="bid-file-panel__sub">
              {{ formatFileSize(file.size) }}
              <span v-if="file.uploadTime"> · {{ file.uploadTime }}</span>
            </div>
          </div>
        </div>
        <div class="bid-file-panel__actions">
          <el-button type="primary" link :disabled="!file.dataUrl" @click="handlePreview(file)">预览</el-button>
          <el-button type="primary" link :disabled="!file.dataUrl" @click="handleDownload(file)">下载</el-button>
          <el-button v-if="!readonly" type="danger" link @click="removeFile(file.id)">删除</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Document, UploadFilled } from '@element-plus/icons-vue';
import { mockUploadBidFile, formatFileSize, previewBidFile, downloadBidFile } from '../utils/mockFile';

export default {
  name: 'BidFilePanel',
  components: { Document, UploadFilled },
  props: {
    modelValue: { type: Array, default: () => [] },
    readonly: { type: Boolean, default: false },
    limit: { type: Number, default: 5 },
    accept: { type: String, default: '.pdf,.doc,.docx,.zip,.rar' },
    uploadLabel: { type: String, default: '将文件拖到此处' },
    hintText: { type: String, default: '支持 PDF、Word、ZIP，单文件不超过 5MB' },
    emptyText: { type: String, default: '暂无文件' },
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      uploading: false,
      formatFileSize,
      previewBidFile,
      downloadBidFile,
    };
  },
  computed: {
    fileList: {
      get() {
        return this.modelValue || [];
      },
      set(val) {
        this.$emit('update:modelValue', val);
        this.$emit('change', val);
      },
    },
  },
  methods: {
    handlePreview(file) {
      if (!file?.dataUrl) {
        this.$message.warning('该文件为演示占位数据，请重新上传后预览');
        return;
      }
      previewBidFile(file);
    },
    handleDownload(file) {
      if (!file?.dataUrl) {
        this.$message.warning('该文件为演示占位数据，请重新上传后下载');
        return;
      }
      downloadBidFile(file);
    },
    async handleUpload({ file }) {
      if (this.limit > 0 && this.fileList.length >= this.limit) {
        this.$message.warning(`最多上传 ${this.limit} 个文件`);
        return;
      }
      this.uploading = true;
      try {
        const item = await mockUploadBidFile(file);
        this.fileList = [...this.fileList, item];
        this.$message.success('上传成功');
      } catch (e) {
        this.$message.error(e.message || '上传失败');
      } finally {
        this.uploading = false;
      }
    },
    removeFile(id) {
      this.fileList = this.fileList.filter(f => f.id !== id);
    },
  },
};
</script>

<style scoped lang="scss">
.bid-file-panel__upload {
  margin-bottom: 16px;

  :deep(.el-upload-dragger) {
    padding: 18px 12px;
  }
}

.bid-file-panel__icon {
  font-size: 42px;
  color: var(--el-color-primary);
  margin-bottom: 8px;
}

.bid-file-panel__tip {
  color: var(--el-text-color-regular);

  em {
    color: var(--el-color-primary);
    font-style: normal;
  }
}

.bid-file-panel__hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.bid-file-panel__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bid-file-panel__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
}

.bid-file-panel__item-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.bid-file-panel__file-icon {
  font-size: 22px;
  color: var(--el-color-primary);
  flex-shrink: 0;
}

.bid-file-panel__meta {
  min-width: 0;
}

.bid-file-panel__name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bid-file-panel__sub {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.bid-file-panel__actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
}
</style>
