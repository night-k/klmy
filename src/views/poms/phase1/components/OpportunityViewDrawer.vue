<template>
  <el-drawer
    v-model="visible"
    :title="null"
    size="760px"
    append-to-body
    destroy-on-close
    class="opp-view-drawer"
    @closed="$emit('closed')"
  >
    <div v-if="detail" v-loading="loading" class="opp-view">
      <div class="opp-view__hero">
        <div class="opp-view__hero-main">
          <div class="opp-view__code">{{ detail.code }}</div>
          <h2 class="opp-view__title">{{ detail.projectName }}</h2>
          <div class="opp-view__tags">
            <el-tag :type="OPP_STATUS_TAG[detail.status] || 'info'" effect="dark" round>
              {{ labelOf(OPP_STATUS, detail.status) }}
            </el-tag>
            <el-tag type="primary" effect="plain" round>
              {{ labelOf(OPP_STAGE, detail.stage) }}
            </el-tag>
          </div>
        </div>
        <div class="opp-view__amount">
          <div class="opp-view__amount-label">预计金额</div>
          <div class="opp-view__amount-value">¥ {{ formatAmount(detail.expectedAmount) }}</div>
        </div>
      </div>

      <el-card shadow="never" class="opp-view__section">
        <template #header>
          <span class="opp-view__section-title">跟进阶段</span>
        </template>
        <el-steps :active="stageActive" :process-status="stageProcessStatus" align-center finish-status="success">
          <el-step v-for="item in STAGE_STEPS" :key="item.value" :title="item.label" />
        </el-steps>
      </el-card>

      <el-card shadow="never" class="opp-view__section">
        <template #header>
          <span class="opp-view__section-title">基本信息</span>
        </template>
        <el-descriptions :column="2" border size="default">
          <el-descriptions-item label="客户名称">
            <el-link type="primary" @click="$emit('go-customer', detail)">{{ detail.customerName || '-' }}</el-link>
          </el-descriptions-item>
          <el-descriptions-item label="跟进人">{{ detail.followerName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="商机来源">{{ labelOf(OPP_SOURCE, detail.source) }}</el-descriptions-item>
          <el-descriptions-item label="项目类型">{{ labelOf(PROJECT_TYPE, detail.projectType) }}</el-descriptions-item>
          <el-descriptions-item label="预计签约日">{{ detail.expectedSignDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.createTime || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card v-if="detail.status === 'lost' && detail.lostReason" shadow="never" class="opp-view__section opp-view__section--danger">
        <template #header>
          <span class="opp-view__section-title">失败原因</span>
        </template>
        <div class="opp-view__lost-reason">{{ detail.lostReason }}</div>
      </el-card>

      <div v-if="actionItems.length" class="opp-view__actions">
        <div class="opp-view__actions-title">商机操作</div>
        <div class="opp-view__actions-btns">
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
import {
  OPP_SOURCE,
  OPP_STAGE,
  OPP_STATUS,
  OPP_STATUS_TAG,
  PROJECT_TYPE,
  labelOf,
} from '../option/dict';

const STAGE_FLOW = ['contact', 'requirement', 'proposal', 'quote', 'negotiation'];

export default {
  name: 'OpportunityViewDrawer',
  props: {
    modelValue: { type: Boolean, default: false },
    detail: { type: Object, default: null },
    loading: { type: Boolean, default: false },
  },
  emits: [
    'update:modelValue',
    'closed',
    'advance',
    'rollback',
    'mark-won',
    'mark-lost',
    'suspend',
    'resume',
    'create-tender',
    'go-customer',
  ],
  data() {
    return {
      OPP_SOURCE,
      OPP_STAGE,
      OPP_STATUS,
      OPP_STATUS_TAG,
      PROJECT_TYPE,
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
    STAGE_STEPS() {
      return STAGE_FLOW.map(value => ({
        value,
        label: labelOf(OPP_STAGE, value),
      }));
    },
    stageActive() {
      if (!this.detail) return 0;
      if (this.detail.stage === 'won') return STAGE_FLOW.length;
      if (this.detail.stage === 'lost') {
        const idx = STAGE_FLOW.indexOf('negotiation');
        return idx >= 0 ? idx : STAGE_FLOW.length - 1;
      }
      const idx = STAGE_FLOW.indexOf(this.detail.stage);
      return idx >= 0 ? idx : 0;
    },
    stageProcessStatus() {
      if (this.detail?.stage === 'lost') return 'error';
      if (this.detail?.status === 'suspended') return 'wait';
      return 'process';
    },
    isOngoing() {
      return this.detail?.status === 'ongoing';
    },
    canAdvanceStage() {
      if (!this.detail) return false;
      const idx = STAGE_FLOW.indexOf(this.detail.stage);
      return this.isOngoing && idx >= 0 && idx < STAGE_FLOW.length - 1;
    },
    canRollbackStage() {
      if (!this.detail) return false;
      const idx = STAGE_FLOW.indexOf(this.detail.stage);
      return this.isOngoing && idx > 0;
    },
    canMarkWon() {
      return this.isOngoing && this.detail?.stage === 'negotiation';
    },
    canMarkLost() {
      return this.isOngoing;
    },
    canSuspend() {
      return this.isOngoing;
    },
    canResume() {
      return this.detail?.status === 'suspended';
    },
    canCreateTender() {
      return this.detail?.status === 'won' || this.detail?.stage === 'won';
    },
    actionItems() {
      const items = [];
      if (this.canAdvanceStage) items.push({ key: 'advance', label: '推进阶段', type: 'primary', event: 'advance' });
      if (this.canRollbackStage) items.push({ key: 'rollback', label: '回退阶段', type: 'info', event: 'rollback' });
      if (this.canMarkWon) items.push({ key: 'mark-won', label: '标记已赢', type: 'success', event: 'mark-won' });
      if (this.canMarkLost) items.push({ key: 'mark-lost', label: '标记已输', type: 'danger', event: 'mark-lost' });
      if (this.canSuspend) items.push({ key: 'suspend', label: '挂起', type: 'warning', event: 'suspend' });
      if (this.canResume) items.push({ key: 'resume', label: '恢复跟进', type: 'primary', event: 'resume' });
      if (this.canCreateTender) items.push({ key: 'create-tender', label: '创建投标', type: 'success', event: 'create-tender' });
      return items;
    },
  },
  methods: {
    formatAmount(val) {
      const num = Number(val) || 0;
      return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
  },
};
</script>

<style scoped lang="scss">
.opp-view {
  padding: 0 4px 24px;
}

.opp-view__hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #ecf5ff 0%, #f5f7fa 100%);
}

.opp-view__code {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.opp-view__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}

.opp-view__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.opp-view__amount {
  flex-shrink: 0;
  text-align: right;
}

.opp-view__amount-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.opp-view__amount-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.opp-view__section {
  margin-bottom: 16px;
  border-radius: 8px;

  :deep(.el-card__header) {
    padding: 12px 16px;
    background: var(--el-fill-color-light);
  }
}

.opp-view__section--danger {
  :deep(.el-card__header) {
    background: var(--el-color-danger-light-9);
  }
}

.opp-view__section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.opp-view__lost-reason {
  line-height: 1.7;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
}

.opp-view__actions {
  position: sticky;
  bottom: 0;
  padding: 16px 20px;
  margin-top: 8px;
  border-radius: 8px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04);
}

.opp-view__actions-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.opp-view__actions-btns {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;

  :deep(.el-button) {
    width: 100%;
    margin: 0;
  }
}
</style>

<style lang="scss">
.opp-view-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 20px 0;
  }

  .el-drawer__body {
    padding: 12px 20px 20px;
  }
}
</style>
