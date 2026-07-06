<template>
  <el-drawer v-model="visible" :title="null" size="860px" append-to-body destroy-on-close class="payment-view-drawer" @closed="$emit('closed')">
    <div v-if="detail" v-loading="loading" class="payment-view">
      <div class="payment-view__hero">
        <div class="payment-view__hero-main">
          <div class="payment-view__code">{{ detail.contractCode }}</div>
          <h2 class="payment-view__title">{{ detail.projectName || detail.customerName }}</h2>
          <div class="payment-view__tags">
            <el-tag :type="PAYMENT_STATUS_TAG[detail.status] || 'info'" effect="dark" round>
              {{ labelOf(PAYMENT_STATUS, detail.status) }}
            </el-tag>
            <el-tag type="primary" effect="plain" round>{{ detail.receivedNodeCount }}/{{ detail.nodeCount }} 节点已回</el-tag>
          </div>
          <div class="payment-view__sub">{{ detail.customerName }}</div>
        </div>
        <div class="payment-view__amounts">
          <div class="payment-view__amount-block">
            <div class="payment-view__amount-label">计划总额</div>
            <div class="payment-view__amount-value plan">¥ {{ formatAmount(detail.planTotal) }}</div>
          </div>
          <div class="payment-view__amount-block">
            <div class="payment-view__amount-label">已收金额</div>
            <div class="payment-view__amount-value actual">¥ {{ formatAmount(detail.receivedTotal) }}</div>
          </div>
        </div>
      </div>

      <div class="payment-view__progress">
        <div class="payment-view__progress-head">
          <span>合同回款进度</span>
          <span>{{ receivePercent }}%</span>
        </div>
        <el-progress :percentage="receivePercent" :status="receivePercent >= 100 ? 'success' : detail.status === 'overdue' ? 'exception' : undefined" :stroke-width="10" />
        <div v-if="remainAmount > 0" class="payment-view__remain">待收 ¥ {{ formatAmount(remainAmount) }}</div>
      </div>

      <el-card shadow="never" class="payment-view__section">
        <template #header>
          <span class="payment-view__section-title">回款节点明细</span>
        </template>
        <el-table :data="detail.nodes || []" border size="small" class="payment-view__node-table">
          <el-table-column label="计划节点" min-width="100">
            <template #default="{ row }">{{ labelOf(PAYMENT_NODE, row.planNode) }}</template>
          </el-table-column>
          <el-table-column label="比例" prop="planRatio" width="72" align="right">
            <template #default="{ row }">{{ row.planRatio ?? '-' }}%</template>
          </el-table-column>
          <el-table-column label="计划金额" min-width="110" align="right">
            <template #default="{ row }">¥ {{ formatAmount(row.planAmount) }}</template>
          </el-table-column>
          <el-table-column label="计划日期" prop="planDate" min-width="105" />
          <el-table-column label="实际日期" prop="actualDate" min-width="105">
            <template #default="{ row }">{{ row.actualDate || '-' }}</template>
          </el-table-column>
          <el-table-column label="实际金额" min-width="110" align="right">
            <template #default="{ row }">¥ {{ formatAmount(row.actualAmount) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="88" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="PAYMENT_STATUS_TAG[row.status] || 'info'">
                {{ labelOf(PAYMENT_STATUS, row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="88" fixed="right" align="center">
            <template #default="{ row }">
              <el-button type="primary" link @click="openNodeEdit(row)">
                {{ hasActualReceipt(row) ? '修改' : '登记' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <el-dialog v-model="nodeDialogVisible" :title="nodeDialogTitle" width="520px" append-to-body destroy-on-close @closed="resetNodeForm">
      <div v-if="editingNode" class="payment-view__node-summary">
        <span>{{ labelOf(PAYMENT_NODE, editingNode.planNode) }}</span>
        <span>计划 ¥ {{ formatAmount(editingNode.planAmount) }}</span>
        <span v-if="editingNode.planDate">计划日期 {{ editingNode.planDate }}</span>
      </div>
      <el-form ref="nodeFormRef" :model="nodeForm" :rules="nodeRules" label-width="100px">
        <el-form-item label="实际日期" prop="actualDate">
          <el-date-picker v-model="nodeForm.actualDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择实际回款日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="实际金额" prop="actualAmount">
          <el-input-number
            v-model="nodeForm.actualAmount"
            :min="0"
            :precision="2"
            :max="editingNode ? Number(editingNode.planAmount) || undefined : undefined"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="回款方式" prop="paymentMethod">
          <el-select v-model="nodeForm.paymentMethod" placeholder="请选择回款方式" style="width: 100%">
            <el-option v-for="item in PAYMENT_METHOD" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="开票状态" prop="invoiceStatus">
          <el-select v-model="nodeForm.invoiceStatus" placeholder="请选择开票状态" style="width: 100%">
            <el-option v-for="item in INVOICE_STATUS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="nodeForm.remark" type="textarea" :rows="2" placeholder="可选，填写回款说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="nodeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitNode">保存</el-button>
      </template>
    </el-dialog>
  </el-drawer>
</template>

<script>
import { PAYMENT_NODE, PAYMENT_METHOD, PAYMENT_STATUS, PAYMENT_STATUS_TAG, INVOICE_STATUS, labelOf } from '../option/dict';

export default {
  name: 'PaymentViewDrawer',
  props: {
    modelValue: { type: Boolean, default: false },
    detail: { type: Object, default: null },
    loading: { type: Boolean, default: false },
    saving: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'closed', 'save-node'],
  data() {
    return {
      nodeDialogVisible: false,
      editingNode: null,
      nodeForm: {
        actualDate: '',
        actualAmount: 0,
        paymentMethod: 'bank_transfer',
        invoiceStatus: 'not_invoiced',
        remark: '',
      },
      nodeRules: {
        actualDate: [{ required: true, message: '请选择实际回款日期', trigger: 'change' }],
        actualAmount: [{ required: true, message: '请输入实际回款金额', trigger: 'blur' }],
        paymentMethod: [{ required: true, message: '请选择回款方式', trigger: 'change' }],
      },
      PAYMENT_NODE,
      PAYMENT_METHOD,
      PAYMENT_STATUS,
      PAYMENT_STATUS_TAG,
      INVOICE_STATUS,
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
    receivePercent() {
      const plan = Number(this.detail?.planTotal) || 0;
      const actual = Number(this.detail?.receivedTotal) || 0;
      if (!plan) return 0;
      return Math.min(100, Math.round((actual / plan) * 100));
    },
    remainAmount() {
      const plan = Number(this.detail?.planTotal) || 0;
      const actual = Number(this.detail?.receivedTotal) || 0;
      return Math.max(0, plan - actual);
    },
    nodeDialogTitle() {
      if (!this.editingNode) return '登记实际回款';
      return this.hasActualReceipt(this.editingNode) ? '修改实际回款' : '登记实际回款';
    },
  },
  watch: {
    detail() {
      this.nodeDialogVisible = false;
      this.editingNode = null;
    },
  },
  methods: {
    formatAmount(val) {
      const num = Number(val) || 0;
      return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    hasActualReceipt(row) {
      return Number(row?.actualAmount) > 0 || !!row?.actualDate;
    },
    openNodeEdit(row) {
      this.editingNode = row;
      this.nodeForm = {
        actualDate: row.actualDate || '',
        actualAmount: Number(row.actualAmount) || 0,
        paymentMethod: row.paymentMethod || 'bank_transfer',
        invoiceStatus: row.invoiceStatus || 'not_invoiced',
        remark: row.remark || '',
      };
      this.nodeDialogVisible = true;
    },
    resetNodeForm() {
      this.editingNode = null;
    },
    submitNode() {
      this.$refs.nodeFormRef.validate(valid => {
        if (!valid || !this.editingNode) return;
        this.$emit('save-node', {
          ...this.editingNode,
          ...this.nodeForm,
        });
      });
    },
    closeNodeDialog() {
      this.nodeDialogVisible = false;
    },
  },
};
</script>

<style scoped lang="scss">
.payment-view {
  padding: 0 4px 24px;
}

.payment-view__hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #fff7e6 0%, #ecf5ff 100%);
}

.payment-view__code {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.payment-view__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.payment-view__sub {
  margin-top: 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.payment-view__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.payment-view__amounts {
  display: flex;
  gap: 20px;
  flex-shrink: 0;
}

.payment-view__amount-block {
  text-align: right;
}

.payment-view__amount-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.payment-view__amount-value {
  font-size: 20px;
  font-weight: 700;

  &.plan {
    color: var(--el-color-primary);
  }

  &.actual {
    color: var(--el-color-success);
  }
}

.payment-view__progress {
  margin-bottom: 16px;
  padding: 16px 20px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}

.payment-view__progress-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
}

.payment-view__remain {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.payment-view__section {
  margin-bottom: 16px;
  border-radius: 8px;

  :deep(.el-card__header) {
    padding: 12px 16px;
    background: var(--el-fill-color-light);
  }
}

.payment-view__section-title {
  font-size: 14px;
  font-weight: 600;
}

.payment-view__node-table {
  width: 100%;
}

.payment-view__node-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
  font-size: 13px;
  color: var(--el-text-color-regular);
}
</style>

<style lang="scss">
.payment-view-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 20px 0;
  }

  .el-drawer__body {
    padding: 12px 20px 20px;
  }
}
</style>
