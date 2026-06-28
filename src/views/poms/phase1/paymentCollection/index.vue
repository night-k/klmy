<template>
  <basic-container class="payment-collection">
    <el-tabs v-model="tabStatus" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="未到期" name="not_due" />
      <el-tab-pane label="待回款" name="pending" />
      <el-tab-pane label="已回款" name="received" />
      <el-tab-pane label="逾期" name="overdue" />
    </el-tabs>

    <div class="payment-statistics">
      <div v-for="item in statItems" :key="item.key" class="statistics-item">
        <el-tag :type="item.type" class="statistics-tag">{{ item.icon }}</el-tag>
        <div class="item-content">
          <p class="title">{{ item.label }}</p>
          <p class="num" :title="formatStatValue(item)">{{ formatStatValue(item) }}</p>
        </div>
      </div>
    </div>

    <avue-crud
      ref="crud"
      v-model:page="page"
      v-model:search="search"
      :option="option"
      :table-loading="loading"
      :data="data"
      @search-change="searchChange"
      @search-reset="searchReset"
      @current-change="currentChange"
      @size-change="sizeChange"
      @refresh-change="refreshChange"
      @on-load="onLoad"
    >
      <template #projectId-search>
        <el-select
          v-model="search.projectId"
          filterable
          clearable
          placeholder="请选择项目"
          style="width: 100%"
          @change="onSearchProjectChange"
        >
          <el-option
            v-for="item in projectOptions"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </template>
      <template #contractId-search>
        <el-select
          v-model="search.contractId"
          filterable
          clearable
          placeholder="请选择合同"
          style="width: 100%"
          @change="onSearchContractChange"
        >
          <el-option
            v-for="item in contractSearchOptions"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </template>
      <template #menu="{ row, size }">
        <el-button type="primary" link :size="size" @click="openView(row)">查看明细</el-button>
      </template>
      <template #contractCode="{ row }">
        <el-link type="primary" @click="openView(row)">{{ row.contractCode }}</el-link>
      </template>
      <template #planTotal="{ row }">{{ formatAmount(row.planTotal) }}</template>
      <template #receivedTotal="{ row }">{{ formatAmount(row.receivedTotal) }}</template>
      <template #pendingTotal="{ row }">{{ formatAmount(row.pendingTotal) }}</template>
      <template #nodeProgress="{ row }">{{ row.receivedNodeCount }}/{{ row.nodeCount }}</template>
      <template #status="{ row }">
        <el-tag :type="PAYMENT_STATUS_TAG[row.status]">{{ labelOf(PAYMENT_STATUS, row.status) }}</el-tag>
      </template>
    </avue-crud>

    <payment-view-drawer
      ref="paymentViewDrawer"
      v-model="viewVisible"
      :detail="viewDetail"
      :loading="viewLoading"
      :saving="viewSaving"
      @save-node="savePaymentNode"
      @closed="viewDetail = null"
    />
  </basic-container>
</template>

<script>
import PaymentViewDrawer from '../components/PaymentViewDrawer.vue';
import { Option } from '../option/paymentCollection';
import { PAYMENT_STATUS, PAYMENT_STATUS_TAG, labelOf } from '../option/dict';
import { getPage, getDetail, updateNode, getStatistics, getProjectTree } from '@/api/poms/phase1/paymentCollection';
import { getList as getContracts } from '@/api/poms/phase1/contract';

export default {
  components: { PaymentViewDrawer },
  data() {
    return {
      projectTree: [],
      tabStatus: '',
      viewVisible: false,
      viewDetail: null,
      viewLoading: false,
      viewSaving: false,
      search: { projectId: '', contractId: '' },
      query: {},
      loading: false,
      page: { pageSize: 10, currentPage: 1, total: 0 },
      option: Option(this),
      data: [],
      contracts: [],
      statistics: {},
      PAYMENT_STATUS,
      PAYMENT_STATUS_TAG,
      labelOf,
      statItems: [
        { key: 'contractTotal', label: '合同总数', icon: '合', type: 'primary' },
        { key: 'contractAmount', label: '合同总额', icon: '¥', type: 'success', money: true },
        { key: 'contractReceived', label: '已收款项', icon: '收', type: 'success', money: true },
        { key: 'contractPending', label: '待收款项', icon: '待', type: 'warning', money: true },
        { key: 'contractExpected', label: '逾期款项', icon: '!', type: 'danger', money: true },
        { key: 'contractReceiptRate', label: '回款率', icon: '%', type: 'primary', percent: true },
      ],
    };
  },
  computed: {
    projectOptions() {
      return this.projectTree.map(p => ({
        id: p.id,
        label: `${p.code} - ${p.projectName}`,
      }));
    },
    contractSearchOptions() {
      if (this.search.projectId) {
        const project = this.projectTree.find(p => p.id === this.search.projectId);
        if (!project) return [];
        return project.contracts.map(c => ({
          id: c.id,
          label: `${c.code} - ${c.projectName}`,
        }));
      }
      const list = [];
      this.projectTree.forEach(p => {
        (p.contracts || []).forEach(c => {
          list.push({
            id: c.id,
            label: `${c.code} - ${c.projectName}`,
          });
        });
      });
      return list;
    },
  },
  mounted() {
    this.loadContracts();
    this.loadTree().then(() => {
      const { contractId } = this.$route.query;
      if (contractId) {
        this.selectContractById(contractId);
      } else {
        this.loadAll();
      }
    });
  },
  methods: {
    openView(row) {
      const contractId = row.contractId || row.id;
      this.viewLoading = true;
      this.viewVisible = true;
      getDetail(contractId).then(res => {
        this.viewDetail = res.data.data;
      }).finally(() => {
        this.viewLoading = false;
      });
    },
    savePaymentNode(node) {
      this.viewSaving = true;
      updateNode(node.id, node)
        .then(() => {
          this.$message.success('节点回款已保存');
          const contractId = this.viewDetail?.contractId;
          return getDetail(contractId);
        })
        .then(res => {
          this.viewDetail = res.data.data;
          this.$refs.paymentViewDrawer?.closeNodeDialog();
          this.loadAll();
        })
        .finally(() => {
          this.viewSaving = false;
        });
    },
    formatAmount(val) {
      const num = Number(val) || 0;
      return `¥ ${num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    },
    formatStatValue(item) {
      const val = this.statistics[item.key];
      if (item.money) return this.formatAmount(val);
      if (item.percent) return `${val || 0} %`;
      return val ?? 0;
    },
    loadTree() {
      return getProjectTree().then(res => {
        this.projectTree = res.data.data || [];
      });
    },
    loadContracts() {
      return getContracts(1, 200).then(res => {
        this.contracts = res.data.data.records;
      });
    },
    loadStats() {
      const scope = {};
      if (this.search.contractId) scope.contractId = this.search.contractId;
      else if (this.search.projectId) scope.projectId = this.search.projectId;
      getStatistics(scope).then(res => {
        this.statistics = res.data.data;
      });
    },
    loadAll() {
      this.loadStats();
      this.onLoad(this.page);
    },
    onSearchProjectChange() {
      if (this.search.contractId) {
        const valid = this.contractSearchOptions.some(c => c.id === this.search.contractId);
        if (!valid) this.search.contractId = '';
      }
      this.page.currentPage = 1;
      this.loadAll();
    },
    onSearchContractChange() {
      if (this.search.contractId && !this.search.projectId) {
        for (const project of this.projectTree) {
          const contract = project.contracts?.find(c => c.id === this.search.contractId);
          if (contract) {
            this.search.projectId = project.id;
            break;
          }
        }
      }
      this.page.currentPage = 1;
      this.loadAll();
    },
    onTabChange() {
      this.page.currentPage = 1;
      this.onLoad(this.page);
    },
    selectContractById(contractId) {
      for (const project of this.projectTree) {
        const contract = project.contracts.find(c => c.id === contractId);
        if (contract) {
          this.search.projectId = project.id;
          this.search.contractId = contractId;
          this.loadAll();
          return;
        }
      }
      const c = this.contracts.find(x => x.id === contractId);
      if (c) {
        this.search.projectId = c.projectId || '__unassigned__';
        this.search.contractId = contractId;
        this.loadAll();
      }
    },
    searchReset() {
      this.query = {};
      this.search = { projectId: '', contractId: '' };
      this.page.currentPage = 1;
      this.loadAll();
    },
    searchChange(params, done) {
      this.query = { ...params };
      delete this.query.projectId;
      delete this.query.contractId;
      this.page.currentPage = 1;
      this.loadAll();
      done();
    },
    currentChange(p) { this.page.currentPage = p; },
    sizeChange(s) { this.page.pageSize = s; },
    refreshChange() { this.loadAll(); },
    onLoad(page) {
      this.loading = true;
      const q = { ...this.query };
      if (this.search.contractId) {
        q.contractId = this.search.contractId;
      } else if (this.search.projectId) {
        q.projectId = this.search.projectId;
      }
      if (this.tabStatus) q.status = this.tabStatus;
      getPage(page.currentPage, page.pageSize, q).then(res => {
        this.page.total = res.data.data.total;
        this.data = res.data.data.records;
      }).finally(() => { this.loading = false; });
    },
  },
};
</script>

<style scoped lang="scss">
.payment-statistics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.statistics-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #fafafa;
  border-radius: 8px;
  min-width: 0;
  overflow: hidden;
}

.statistics-tag {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.item-content .title {
  margin: 0;
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-content .num {
  margin: 4px 0 0;
  font-size: clamp(14px, 1.6vw, 18px);
  font-weight: 600;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
