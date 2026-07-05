<template>
  <basic-container>
    <el-tabs v-model="tabSignGroup" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="未签" name="unsigned" />
      <el-tab-pane label="已签" name="signed" />
    </el-tabs>

    <avue-crud
      ref="crud"
      v-model:page="page"
      v-model:search="search"
      v-model="form"
      :option="option"
      :table-loading="loading"
      :data="data"
      :before-open="beforeOpen"
      @row-save="rowSave"
      @row-update="rowUpdate"
      @row-del="rowDel"
      @search-change="searchChange"
      @search-reset="searchReset"
      @current-change="currentChange"
      @size-change="sizeChange"
      @refresh-change="refreshChange"
      @on-load="onLoad"
    >
      <template #menu="{ row, size }">
        <el-button type="primary" link :size="size" @click="openView(row)">查看</el-button>
      </template>
      <template #contractStatus="{ row }">
        <el-tag :type="CONTRACT_STATUS_TAG[row.contractStatus]">{{ labelOf(CONTRACT_STATUS, row.contractStatus) }}</el-tag>
      </template>
      <template #code="{ row }">
        <el-link type="primary" @click="openView(row)">{{ row.code }}</el-link>
      </template>
      <template #contractFiles-form>
        <bid-file-panel
          v-model="form.contractFiles"
          upload-label="将合同附件拖到此处"
          hint-text="支持 PDF、Word、图片、ZIP，单文件不超过 5MB"
          empty-text="暂无合同附件"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.rar"
        />
      </template>
    </avue-crud>

    <contract-view-drawer
      v-model="viewVisible"
      :detail="viewDetail"
      :loading="viewLoading"
      @edit-contract="editFromView"
      @submit-approval="submitApproval"
      @mark-signed="markSigned"
      @project-init="goProjectInit"
      @view-project="goProjectList"
      @go-payment="goPayment"
      @save-files="saveContractFiles"
      @closed="viewDetail = null"
    />
  </basic-container>
</template>

<script>
import { Option } from '../option/contract';
import BidFilePanel from '../components/BidFilePanel.vue';
import ContractViewDrawer from '../components/ContractViewDrawer.vue';
import { CONTRACT_STATUS, CONTRACT_STATUS_TAG, labelOf } from '../option/dict';
import { getPage, getDetail, add, update, remove } from '@/api/poms/phase1/contract';
import { getList as getWinbids, getDetail as getWinbidDetail, update as updateWinbid } from '@/api/poms/phase1/winbid';
import { getDetail as getTenderDetail } from '@/api/poms/phase1/tender';
import { getDetail as getOpportunityDetail } from '@/api/poms/phase1/opportunity';
import { syncContractPayments } from '@/api/poms/phase1/mockStore';

export default {
  components: { BidFilePanel, ContractViewDrawer },
  data() {
    return {
      tabSignGroup: '',
      form: {},
      search: {},
      query: {},
      loading: false,
      page: { pageSize: 10, currentPage: 1, total: 0 },
      option: Option(this),
      data: [],
      winbids: [],
      viewVisible: false,
      viewDetail: null,
      viewLoading: false,
      CONTRACT_STATUS,
      CONTRACT_STATUS_TAG,
      labelOf,
    };
  },
  mounted() {
    const { id, winbidId, action } = this.$route.query;
    if (id) {
      this.openView({ id });
      return;
    }
    if (winbidId && action === 'add') {
      this.$nextTick(() => {
        if (this.$refs.crud) this.$refs.crud.rowAdd();
      });
    }
  },
  methods: {
    onTabChange() {
      this.page.currentPage = 1;
      this.onLoad(this.page);
    },
    openView(row) {
      this.viewLoading = true;
      this.viewVisible = true;
      getDetail(row.id).then(res => {
        this.viewDetail = { paymentPlans: [], contractFiles: [], ...res.data.data };
      }).finally(() => {
        this.viewLoading = false;
      });
    },
    refreshViewDetail(id) {
      if (!this.viewVisible || !id) return;
      getDetail(id).then(res => {
        this.viewDetail = { paymentPlans: [], contractFiles: [], ...res.data.data };
      });
    },
    saveContractFiles(row) {
      update({ ...row, contractFiles: row.contractFiles || [] }).then(() => {
        this.refreshViewDetail(row.id);
        this.onLoad(this.page);
        this.$message.success('合同附件已保存');
      });
    },
    editFromView(row) {
      this.viewVisible = false;
      const index = this.data.findIndex(item => item.id === row.id);
      if (index >= 0) this.$refs.crud.rowEdit(row, index);
    },
    submitApproval(row) {
      update({ ...row, contractStatus: 'approving' }).then(() => {
        this.$message.success('已提交审批（演示占位）');
        this.onLoad(this.page);
        this.refreshViewDetail(row.id);
      });
    },
    markSigned(row) {
      this.$confirm('确认合同已签订？').then(() => {
        const payload = {
          ...row,
          contractStatus: 'signed',
          signDate: row.signDate || new Date().toISOString().slice(0, 10),
        };
        return update(payload);
      }).then(res => {
        const detail = res?.data?.data || { ...row, contractStatus: 'signed' };
        syncContractPayments(detail);
        this.$message.success('合同状态已更新为已签，可进行项目立项');
        this.onLoad(this.page);
        this.refreshViewDetail(row.id);
      });
    },
    goProjectInit() {
      this.viewVisible = false;
      this.$router.push('/poms/phase2/projectList');
    },
    goProjectList() {
      this.$router.push('/poms/phase2/projectList');
    },
    goPayment(row) {
      this.viewVisible = false;
      this.$router.push({ path: '/poms/phase1/payment', query: { contractId: row.id } });
    },
    loadWinbids() {
      return getWinbids(1, 100).then(res => {
        this.winbids = res.data.data.records.filter(w => w.contractStatus !== 'generated');
        const col = this.findObject(this.option.column, 'winbidId');
        if (col) {
          col.dicData = this.winbids.map(w => ({
            id: w.id,
            name: `${w.code} - ${w.projectName}`,
          }));
        }
      });
    },
    buildPaymentPlans(amount) {
      const total = Number(amount) || 0;
      return [
        { node: 'prepay', ratio: 30, amount: Math.round(total * 0.3), planDate: '' },
        { node: 'progress', ratio: 40, amount: Math.round(total * 0.4), planDate: '' },
        { node: 'acceptance', ratio: 25, amount: Math.round(total * 0.25), planDate: '' },
        { node: 'warranty', ratio: 5, amount: Math.round(total * 0.05), planDate: '' },
      ];
    },
    onWinbidChange(id) {
      const w = this.winbids.find(x => x.id === id);
      if (!w) return;
      this.form.winbidId = id;
      this.form.winbidCode = w.code;
      this.form.customerName = w.customerName;
      this.form.projectName = w.projectName;
      this.form.contractAmount = w.winAmount;
      this.form.contractType = 'tech_service';
      this.form.contractStatus = 'draft';
      this.form.paymentPlans = this.buildPaymentPlans(w.winAmount);
      if (w.tenderId) {
        getTenderDetail(w.tenderId).then(res => {
          const t = res.data.data;
          if (!t) return;
          if (t.opportunityId) {
            this.form.opportunityId = t.opportunityId;
            getOpportunityDetail(t.opportunityId).then(oppRes => {
              const opp = oppRes.data.data;
              if (opp?.customerId) this.form.customerId = opp.customerId;
            });
          }
        });
      }
    },
    beforeOpen(done, type) {
      const open = () => this.$nextTick(() => done());
      if (type === 'edit') {
        getDetail(this.form.id).then(res => {
          this.form = { paymentPlans: [], contractFiles: [], ...res.data.data };
          open();
        });
        return;
      }
      this.loadWinbids().then(() => {
        this.form = {
          contractStatus: 'draft',
          contractType: 'tech_service',
          winbidId: '',
          paymentPlans: [],
          contractFiles: [],
        };
        const { winbidId } = this.$route.query;
        if (winbidId) {
          const applyWinbid = w => {
            if (w && !this.winbids.find(x => x.id === w.id)) {
              this.winbids.push(w);
              const col = this.findObject(this.option.column, 'winbidId');
              if (col) {
                col.dicData = this.winbids.map(item => ({
                  id: item.id,
                  name: `${item.code} - ${item.projectName}`,
                }));
              }
            }
            this.form.winbidId = winbidId;
            this.onWinbidChange(winbidId);
            open();
          };
          const cached = this.winbids.find(x => x.id === winbidId);
          if (cached) {
            applyWinbid(cached);
          } else {
            getWinbidDetail(winbidId).then(res => applyWinbid(res.data.data));
          }
          return;
        }
        open();
      });
    },
    rowSave(row, done, loading) {
      if (!row.winbidId) {
        this.$message.warning('请选择中标记录');
        loading();
        return;
      }
      add({ ...row, paymentPlans: row.paymentPlans || [], contractFiles: row.contractFiles || [] }).then(res => {
        const contract = res.data.data;
        if (row.winbidId && contract) {
          updateWinbid({
            id: row.winbidId,
            contractStatus: 'generated',
            contractId: contract.id,
            contractCode: contract.code,
          });
        }
        this.onLoad(this.page);
        done();
      }).finally(() => loading());
    },
    rowUpdate(row, index, done, loading) {
      update({ ...row, paymentPlans: row.paymentPlans || [], contractFiles: row.contractFiles || [] }).then(() => {
        this.onLoad(this.page);
        this.refreshViewDetail(row.id);
        done();
      }).finally(() => loading());
    },
    rowDel(row) {
      this.$confirm('确定删除？').then(() => remove(row.id)).then(() => this.onLoad(this.page));
    },
    searchReset() { this.query = {}; this.onLoad(this.page); },
    searchChange(params, done) { this.query = params; this.page.currentPage = 1; this.onLoad(this.page); done(); },
    currentChange(p) { this.page.currentPage = p; },
    sizeChange(s) { this.page.pageSize = s; },
    refreshChange() { this.onLoad(this.page); },
    onLoad(page) {
      this.loading = true;
      const q = { ...this.query };
      if (this.tabSignGroup) q.signGroup = this.tabSignGroup;
      getPage(page.currentPage, page.pageSize, q).then(res => {
        this.page.total = res.data.data.total;
        this.data = res.data.data.records;
      }).finally(() => { this.loading = false; });
    },
  },
};
</script>
