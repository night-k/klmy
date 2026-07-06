<template>
  <el-drawer v-model="visible" :title="null" size="780px" append-to-body destroy-on-close class="tender-view-drawer" @closed="$emit('closed')">
    <div v-if="detail" v-loading="loading" class="tender-view">
      <div class="tender-view__hero">
        <div class="tender-view__hero-main">
          <div class="tender-view__code">{{ detail.code }}</div>
          <h2 class="tender-view__title">{{ detail.projectName }}</h2>
          <div class="tender-view__tags">
            <el-tag :type="TENDER_RESULT_TAG[detail.result] || 'info'" effect="dark" round>
              {{ labelOf(TENDER_RESULT, detail.result) }}
            </el-tag>
            <el-tag type="primary" effect="plain" round>{{ labelOf(TENDER_METHOD, detail.tenderMethod) }}</el-tag>
          </div>
        </div>
        <div class="tender-view__amount">
          <div class="tender-view__amount-label">投标报价</div>
          <div class="tender-view__amount-value">¥ {{ formatAmount(detail.bidAmount) }}</div>
        </div>
      </div>

      <el-card shadow="never" class="tender-view__section">
        <template #header>
          <span class="tender-view__section-title">投标信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="关联商机">{{ detail.opportunityName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="客户名称">{{ detail.customerName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="招标单位">{{ detail.tenderOrg || '-' }}</el-descriptions-item>
          <el-descriptions-item label="公告编号">{{ detail.announcementNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="投标日期">{{ detail.bidDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="开标时间">{{ detail.openTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="投标保证金">¥ {{ formatAmount(detail.bidBond) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.createTime || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.remark" label="备注" :span="2">{{ detail.remark }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card v-if="detail.result === 'won'" shadow="never" class="tender-view__section tender-view__section--success">
        <template #header>
          <span class="tender-view__section-title">中标信息</span>
        </template>
        <el-descriptions v-if="hasWinInfo" :column="2" border>
          <el-descriptions-item label="中标金额">¥ {{ formatAmount(detail.winAmount) }}</el-descriptions-item>
          <el-descriptions-item label="中标日期">{{ detail.winDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="通知书编号" :span="2">{{ detail.winNoticeNo || '-' }}</el-descriptions-item>
        </el-descriptions>
        <el-empty v-else description="登记中标后显示中标金额、日期及通知书编号" :image-size="64" />
      </el-card>

      <el-card shadow="never" class="tender-view__section">
        <template #header>
          <div class="tender-view__section-head">
            <span class="tender-view__section-title">投标文件</span>
            <el-button type="primary" link @click="toggleFileEdit">
              {{ fileEditing ? '完成' : '管理文件' }}
            </el-button>
          </div>
        </template>
        <bid-file-panel v-model="localBidFiles" :readonly="fileReadonly" @change="handleFilesChange" />
      </el-card>

      <div v-if="actionItems.length" class="tender-view__actions">
        <div class="tender-view__actions-title">投标操作</div>
        <div class="tender-view__actions-btns">
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
import { TENDER_METHOD, TENDER_RESULT, TENDER_RESULT_TAG, labelOf } from '../option/dict';

export default {
  name: 'TenderViewDrawer',
  components: { BidFilePanel },
  props: {
    modelValue: { type: Boolean, default: false },
    detail: { type: Object, default: null },
    loading: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'closed', 'edit-result', 'edit-tender', 'register-winbid', 'save-files'],
  data() {
    return {
      fileEditing: false,
      localBidFiles: [],
      TENDER_METHOD,
      TENDER_RESULT,
      TENDER_RESULT_TAG,
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
    hasWinInfo() {
      const d = this.detail;
      return !!(d?.winAmount || d?.winDate || d?.winNoticeNo);
    },
    actionItems() {
      const items = [
        { key: 'edit-result', label: '修改中标结果', type: 'primary', event: 'edit-result' },
        { key: 'edit-tender', label: '编辑投标', type: 'info', event: 'edit-tender' },
      ];
      if (this.detail?.result === 'won' && !this.hasWinInfo) {
        items.push({ key: 'register-winbid', label: '登记中标', type: 'success', event: 'register-winbid' });
      }
      return items;
    },
  },
  watch: {
    detail: {
      immediate: true,
      handler(val) {
        this.localBidFiles = val?.bidFiles ? [...val.bidFiles] : [];
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
        this.$emit('save-files', { ...this.detail, bidFiles: files });
      }
    },
    toggleFileEdit() {
      this.fileEditing = !this.fileEditing;
    },
  },
};
</script>

<style scoped lang="scss">
.tender-view {
  padding: 0 4px 24px;
}

.tender-view__hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f0f9eb 0%, #f5f7fa 100%);
}

.tender-view__code {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.tender-view__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.tender-view__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tender-view__amount {
  flex-shrink: 0;
  text-align: right;
}

.tender-view__amount-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.tender-view__amount-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-color-success);
}

.tender-view__section {
  margin-bottom: 16px;
  border-radius: 8px;

  :deep(.el-card__header) {
    padding: 12px 16px;
    background: var(--el-fill-color-light);
  }
}

.tender-view__section--success {
  :deep(.el-card__header) {
    background: var(--el-color-success-light-9);
  }
}

.tender-view__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tender-view__section-title {
  font-size: 14px;
  font-weight: 600;
}

.tender-view__actions {
  position: sticky;
  bottom: 0;
  padding: 16px 20px;
  border-radius: 8px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04);
}

.tender-view__actions-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
}

.tender-view__actions-btns {
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
.tender-view-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 20px 0;
  }

  .el-drawer__body {
    padding: 12px 20px 20px;
  }
}
</style>
