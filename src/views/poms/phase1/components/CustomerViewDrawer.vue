<template>
  <el-drawer
    v-model="visible"
    :title="null"
    size="780px"
    append-to-body
    destroy-on-close
    class="customer-view-drawer"
    @closed="$emit('closed')"
  >
    <div v-if="detail" v-loading="loading" class="customer-view">
      <div class="customer-view__hero">
        <div class="customer-view__hero-main">
          <div class="customer-view__code">{{ detail.code }}</div>
          <h2 class="customer-view__title">{{ detail.name }}</h2>
          <div class="customer-view__tags">
            <el-tag :type="statusTagType" effect="dark" round>
              {{ labelOf(CUSTOMER_STATUS, detail.status) }}
            </el-tag>
            <el-tag type="primary" effect="plain" round>
              {{ labelOf(CUSTOMER_LEVEL, detail.customerLevel) }}
            </el-tag>
            <el-tag type="info" effect="plain" round>
              {{ labelOf(CUSTOMER_TYPE, detail.customerType) }}
            </el-tag>
          </div>
        </div>
        <div class="customer-view__meta">
          <div class="customer-view__meta-label">客户经理</div>
          <div class="customer-view__meta-value">{{ detail.managerUserName || '-' }}</div>
        </div>
      </div>

      <el-card shadow="never" class="customer-view__section">
        <template #header>
          <span class="customer-view__section-title">基本信息</span>
        </template>
        <el-descriptions :column="2" border size="default">
          <el-descriptions-item label="所属行业">{{ labelOf(INDUSTRY, detail.industry) }}</el-descriptions-item>
          <el-descriptions-item label="所属区域">{{ detail.region || '-' }}</el-descriptions-item>
          <el-descriptions-item label="详细地址" :span="2">{{ detail.address || '-' }}</el-descriptions-item>
          <el-descriptions-item label="纳税人识别号">{{ detail.taxNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="开户行">{{ detail.bankName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="银行账号" :span="2">{{ detail.bankAccount || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ detail.createTime || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card shadow="never" class="customer-view__section">
        <template #header>
          <span class="customer-view__section-title">联系人</span>
        </template>
        <el-table v-if="detail.contacts?.length" :data="detail.contacts" border size="default">
          <el-table-column prop="name" label="姓名" min-width="100" />
          <el-table-column prop="title" label="职务" min-width="100" />
          <el-table-column prop="phone" label="电话" min-width="130" />
          <el-table-column prop="email" label="邮箱" min-width="160" />
          <el-table-column label="主联系人" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.isPrimary" type="success" size="small">是</el-tag>
              <span v-else class="customer-view__muted">否</span>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无联系人" :image-size="64" />
      </el-card>

      <el-card shadow="never" class="customer-view__section">
        <template #header>
          <span class="customer-view__section-title">历史关联</span>
        </template>
        <el-tabs v-if="historyLoaded" model-value="projects">
          <el-tab-pane label="历史项目" name="projects">
            <el-table :data="history.projects" border size="default" empty-text="暂无历史项目">
              <el-table-column prop="code" label="项目编号" min-width="130" />
              <el-table-column prop="projectName" label="项目名称" min-width="180" />
              <el-table-column prop="status" label="状态" min-width="100">
                <template #default="{ row }">{{ labelOf(PROJECT_STATUS, row.status) }}</template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="历史合同" name="contracts">
            <el-table :data="history.contracts" border size="default" empty-text="暂无历史合同">
              <el-table-column prop="code" label="合同编号" min-width="130" />
              <el-table-column prop="projectName" label="项目名称" min-width="180" />
              <el-table-column prop="contractAmount" label="金额" min-width="120">
                <template #default="{ row }">¥ {{ formatAmount(row.contractAmount) }}</template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="历史回款" name="payments">
            <el-table :data="history.payments" border size="default" empty-text="暂无历史回款">
              <el-table-column prop="contractCode" label="合同编号" min-width="130" />
              <el-table-column prop="planAmount" label="计划金额" min-width="120">
                <template #default="{ row }">¥ {{ formatAmount(row.planAmount) }}</template>
              </el-table-column>
              <el-table-column prop="actualAmount" label="实际金额" min-width="120">
                <template #default="{ row }">¥ {{ formatAmount(row.actualAmount) }}</template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
        <div v-else v-loading="historyLoading" class="customer-view__history-loading" />
      </el-card>

      <div class="customer-view__actions">
        <el-button type="primary" plain @click="$emit('edit', detail)">编辑客户</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import {
  CUSTOMER_LEVEL,
  CUSTOMER_STATUS,
  CUSTOMER_TYPE,
  INDUSTRY,
  PROJECT_STATUS,
  labelOf,
} from '../option/dict';

export default {
  name: 'CustomerViewDrawer',
  props: {
    modelValue: { type: Boolean, default: false },
    detail: { type: Object, default: null },
    loading: { type: Boolean, default: false },
    history: { type: Object, default: null },
    historyLoading: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'closed', 'edit'],
  data() {
    return {
      CUSTOMER_TYPE,
      CUSTOMER_LEVEL,
      CUSTOMER_STATUS,
      INDUSTRY,
      PROJECT_STATUS,
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
    statusTagType() {
      const map = { normal: 'success', paused: 'warning', lost: 'danger' };
      return map[this.detail?.status] || 'info';
    },
    historyLoaded() {
      return this.history !== null && !this.historyLoading;
    },
  },
  methods: {
    formatAmount(val) {
      const num = Number(val) || 0;
      return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    },
  },
};
</script>

<style scoped lang="scss">
.customer-view {
  padding: 0 4px 24px;
}

.customer-view__hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f0f9eb 0%, #f5f7fa 100%);
}

.customer-view__code {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.customer-view__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.customer-view__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.customer-view__meta {
  flex-shrink: 0;
  text-align: right;
}

.customer-view__meta-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.customer-view__meta-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.customer-view__section {
  margin-bottom: 16px;
  border-radius: 8px;

  :deep(.el-card__header) {
    padding: 12px 16px;
    background: var(--el-fill-color-light);
  }
}

.customer-view__section-title {
  font-size: 14px;
  font-weight: 600;
}

.customer-view__muted {
  color: var(--el-text-color-placeholder);
}

.customer-view__history-loading {
  min-height: 120px;
}

.customer-view__actions {
  position: sticky;
  bottom: 0;
  padding: 16px 20px;
  margin-top: 8px;
  border-radius: 8px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04);
}
</style>

<style lang="scss">
.customer-view-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 20px 0;
  }

  .el-drawer__body {
    padding: 12px 20px 20px;
  }
}
</style>
