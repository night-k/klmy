<template>
  <el-drawer v-model="visible" :title="null" size="780px" append-to-body destroy-on-close class="winbid-view-drawer" @closed="$emit('closed')">
    <div v-if="detail" v-loading="loading" class="winbid-view">
      <div class="winbid-view__hero">
        <div class="winbid-view__hero-main">
          <div class="winbid-view__code">{{ detail.code }}</div>
          <h2 class="winbid-view__title">{{ detail.projectName }}</h2>
          <div class="winbid-view__tags">
            <el-tag type="success" effect="dark" round>已中标</el-tag>
            <el-tag :type="detail.contractStatus === 'generated' ? 'success' : 'warning'" effect="plain" round>
              {{ labelOf(WIN_CONTRACT_STATUS, detail.contractStatus) }}
            </el-tag>
          </div>
        </div>
        <div class="winbid-view__amount">
          <div class="winbid-view__amount-label">中标金额</div>
          <div class="winbid-view__amount-value">¥ {{ formatAmount(detail.winAmount) }}</div>
        </div>
      </div>

      <el-card shadow="never" class="winbid-view__section">
        <template #header>
          <span class="winbid-view__section-title">中标信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="关联投标">{{ detail.tenderCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="客户名称">{{ detail.customerName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="通知书编号">{{ detail.noticeNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="中标日期">{{ detail.winDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="服务期">{{ detail.servicePeriod || '-' }}</el-descriptions-item>
          <el-descriptions-item label="履约保证金">¥ {{ formatAmount(detail.performanceBond) }}</el-descriptions-item>
          <el-descriptions-item label="中标服务费">¥ {{ formatAmount(detail.serviceFee) }}</el-descriptions-item>
          <el-descriptions-item label="关联合同">{{ detail.contractCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ detail.createTime || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card shadow="never" class="winbid-view__section">
        <template #header>
          <div class="winbid-view__section-head">
            <span class="winbid-view__section-title">中标通知书</span>
            <el-button type="primary" link @click="toggleFileEdit">
              {{ fileEditing ? '完成' : '管理文件' }}
            </el-button>
          </div>
        </template>
        <bid-file-panel
          v-model="localNoticeFiles"
          :readonly="fileReadonly"
          upload-label="将中标通知书拖到此处"
          hint-text="支持 PDF、Word、图片，单文件不超过 5MB"
          empty-text="暂无中标通知书"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          @change="handleFilesChange"
        />
      </el-card>

      <div v-if="actionItems.length" class="winbid-view__actions">
        <div class="winbid-view__actions-title">中标操作</div>
        <div class="winbid-view__actions-btns">
          <el-button v-for="item in actionItems" :key="item.key" :type="item.type" plain @click="$emit(item.event, detail)">
            {{ item.label }}
          </el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import BidFilePanel from './BidFilePanel.vue';
import { WIN_CONTRACT_STATUS, labelOf } from '../option/dict';

export default {
  name: 'WinbidViewDrawer',
  components: { BidFilePanel },
  props: {
    modelValue: { type: Boolean, default: false },
    detail: { type: Object, default: null },
    loading: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'closed', 'edit-winbid', 'create-contract', 'view-contract', 'save-files'],
  data() {
    return {
      fileEditing: false,
      localNoticeFiles: [],
      WIN_CONTRACT_STATUS,
      labelOf,
    };
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
    fileReadonly() {
      return !this.fileEditing;
    },
    actionItems() {
      const items = [{ key: 'edit-winbid', label: '编辑中标', type: 'info', event: 'edit-winbid' }];
      if (this.detail?.contractStatus === 'generated') {
        items.push({ key: 'view-contract', label: '查看合同', type: 'success', event: 'view-contract' });
      } else {
        items.push({ key: 'create-contract', label: '新增合同', type: 'primary', event: 'create-contract' });
      }
      return items;
    },
  },
  watch: {
    detail: {
      immediate: true,
      handler(val) {
        this.localNoticeFiles = val?.noticeFiles ? [...val.noticeFiles] : [];
        this.fileEditing = false;
      },
    },
  },
  methods: {
    formatAmount(val) {
      const num = Number(val) || 0;
      return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    handleFilesChange(files) {
      if (this.fileEditing) {
        this.$emit('save-files', { ...this.detail, noticeFiles: files });
      }
    },
    toggleFileEdit() {
      this.fileEditing = !this.fileEditing;
    },
  },
};
</script>

<style scoped lang="scss">
.winbid-view {
  padding: 0 4px 24px;
}

.winbid-view__hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f0f9eb 0%, #ecf5ff 100%);
}

.winbid-view__code {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.winbid-view__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.winbid-view__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.winbid-view__amount {
  flex-shrink: 0;
  text-align: right;
}

.winbid-view__amount-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.winbid-view__amount-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-color-success);
}

.winbid-view__section {
  margin-bottom: 16px;
  border-radius: 8px;

  :deep(.el-card__header) {
    padding: 12px 16px;
    background: var(--el-fill-color-light);
  }
}

.winbid-view__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.winbid-view__section-title {
  font-size: 14px;
  font-weight: 600;
}

.winbid-view__actions {
  position: sticky;
  bottom: 0;
  padding: 16px 20px;
  border-radius: 8px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04);
}

.winbid-view__actions-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
}

.winbid-view__actions-btns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  :deep(.el-button) {
    width: 100%;
    margin: 0;
  }
}
</style>

<style lang="scss">
.winbid-view-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 20px 0;
  }

  .el-drawer__body {
    padding: 12px 20px 20px;
  }
}
</style>
