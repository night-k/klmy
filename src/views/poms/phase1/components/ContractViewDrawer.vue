<template>
  <el-drawer
    v-model="visible"
    :title="null"
    size="780px"
    append-to-body
    destroy-on-close
    class="contract-view-drawer"
    @closed="$emit('closed')"
  >
    <div v-if="detail" v-loading="loading" class="contract-view">
      <div class="contract-view__hero">
        <div class="contract-view__hero-main">
          <div class="contract-view__code">{{ detail.code }}</div>
          <h2 class="contract-view__title">{{ detail.projectName }}</h2>
          <div class="contract-view__tags">
            <el-tag :type="CONTRACT_STATUS_TAG[detail.contractStatus] || 'info'" effect="dark" round>
              {{ labelOf(CONTRACT_STATUS, detail.contractStatus) }}
            </el-tag>
            <el-tag type="primary" effect="plain" round>{{ labelOf(CONTRACT_TYPE, detail.contractType) }}</el-tag>
          </div>
        </div>
        <div class="contract-view__amount">
          <div class="contract-view__amount-label">合同金额</div>
          <div class="contract-view__amount-value">¥ {{ formatAmount(detail.contractAmount) }}</div>
        </div>
      </div>

      <el-card shadow="never" class="contract-view__section">
        <template #header>
          <span class="contract-view__section-title">基本信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="关联中标">{{ detail.winbidCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="客户名称">{{ detail.customerName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="服务周期起">{{ detail.serviceStartDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="服务周期止">{{ detail.serviceEndDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="签约时间">{{ detail.signDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.createTime || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card v-if="detail.serviceContent" shadow="never" class="contract-view__section">
        <template #header>
          <span class="contract-view__section-title">服务内容</span>
        </template>
        <div class="contract-view__content">{{ detail.serviceContent }}</div>
      </el-card>

      <el-card shadow="never" class="contract-view__section">
        <template #header>
          <span class="contract-view__section-title">付款计划</span>
        </template>
        <el-empty v-if="!paymentPlans.length" description="暂无付款计划" :image-size="64" />
        <el-table v-else :data="paymentPlans" border size="small">
          <el-table-column label="节点" prop="node" min-width="100">
            <template #default="{ row }">{{ labelOf(PAYMENT_NODE, row.node) }}</template>
          </el-table-column>
          <el-table-column label="比例(%)" prop="ratio" width="90" align="right" />
          <el-table-column label="金额" prop="amount" min-width="120" align="right">
            <template #default="{ row }">¥ {{ formatAmount(row.amount) }}</template>
          </el-table-column>
          <el-table-column label="计划日期" prop="planDate" min-width="110" />
        </el-table>
      </el-card>

      <el-card shadow="never" class="contract-view__section">
        <template #header>
          <div class="contract-view__section-head">
            <span class="contract-view__section-title">合同附件</span>
            <el-button type="primary" link @click="toggleFileEdit">
              {{ fileEditing ? '完成' : '管理附件' }}
            </el-button>
          </div>
        </template>
        <bid-file-panel
          v-model="localContractFiles"
          :readonly="fileReadonly"
          upload-label="将合同附件拖到此处"
          hint-text="支持 PDF、Word、图片、ZIP，单文件不超过 5MB"
          empty-text="暂无合同附件"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.rar"
          @change="handleFilesChange"
        />
      </el-card>

      <div v-if="actionItems.length" class="contract-view__actions">
        <div class="contract-view__actions-title">合同操作</div>
        <div class="contract-view__actions-btns">
          <el-button
            v-for="item in actionItems"
            :key="item.key"
            :type="item.type"
            plain
            @click="$emit(item.event, detail)"
          >
            {{ item.label }}
          </el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import BidFilePanel from './BidFilePanel.vue';
import {
  CONTRACT_TYPE,
  CONTRACT_STATUS,
  CONTRACT_STATUS_TAG,
  PAYMENT_NODE,
  labelOf,
} from '../option/dict';

export default {
  name: 'ContractViewDrawer',
  components: { BidFilePanel },
  props: {
    modelValue: { type: Boolean, default: false },
    detail: { type: Object, default: null },
    loading: { type: Boolean, default: false },
  },
  emits: [
    'update:modelValue',
    'closed',
    'edit-contract',
    'submit-approval',
    'mark-signed',
    'project-init',
    'view-project',
    'go-payment',
    'save-files',
  ],
  data() {
    return {
      fileEditing: false,
      localContractFiles: [],
      CONTRACT_TYPE,
      CONTRACT_STATUS,
      CONTRACT_STATUS_TAG,
      PAYMENT_NODE,
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
    paymentPlans() {
      return this.detail?.paymentPlans || [];
    },
    fileReadonly() {
      return !this.fileEditing;
    },
    actionItems() {
      const items = [
        { key: 'edit', label: '编辑合同', type: 'info', event: 'edit-contract' },
      ];
      if (this.detail?.contractStatus === 'draft') {
        items.push({ key: 'approval', label: '提交审批', type: 'primary', event: 'submit-approval' });
      }
      if (this.detail?.contractStatus !== 'signed' && this.detail?.contractStatus !== 'completed') {
        items.push({ key: 'signed', label: '标记已签', type: 'warning', event: 'mark-signed' });
      }
      if (this.detail?.contractStatus === 'signed' && !this.detail?.projectId) {
        items.push({ key: 'init', label: '项目立项', type: 'primary', event: 'project-init' });
      }
      if (this.detail?.projectId) {
        items.push({ key: 'project', label: '查看项目', type: 'success', event: 'view-project' });
      }
      if (['signed', 'executing', 'completed'].includes(this.detail?.contractStatus)) {
        items.push({ key: 'payment', label: '回款管理', type: 'info', event: 'go-payment' });
      }
      return items;
    },
  },
  watch: {
    detail: {
      immediate: true,
      handler(val) {
        this.localContractFiles = val?.contractFiles ? [...val.contractFiles] : [];
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
        this.$emit('save-files', { ...this.detail, contractFiles: files });
      }
    },
    toggleFileEdit() {
      this.fileEditing = !this.fileEditing;
    },
  },
};
</script>

<style scoped lang="scss">
.contract-view {
  padding: 0 4px 24px;
}

.contract-view__hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #ecf5ff 0%, #f5f7fa 100%);
}

.contract-view__code {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.contract-view__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.contract-view__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.contract-view__amount {
  flex-shrink: 0;
  text-align: right;
}

.contract-view__amount-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.contract-view__amount-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.contract-view__section {
  margin-bottom: 16px;
  border-radius: 8px;

  :deep(.el-card__header) {
    padding: 12px 16px;
    background: var(--el-fill-color-light);
  }
}

.contract-view__section-title {
  font-size: 14px;
  font-weight: 600;
}

.contract-view__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.contract-view__content {
  line-height: 1.7;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
}

.contract-view__actions {
  position: sticky;
  bottom: 0;
  padding: 16px 20px;
  border-radius: 8px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04);
}

.contract-view__actions-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
}

.contract-view__actions-btns {
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
.contract-view-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 20px 0;
  }

  .el-drawer__body {
    padding: 12px 20px 20px;
  }
}
</style>
