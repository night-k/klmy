<template>
  <basic-container>
    <el-tabs v-model="tabStatus" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="进行中" name="ongoing" />
      <el-tab-pane label="已赢" name="won" />
      <el-tab-pane label="已输" name="lost" />
      <el-tab-pane label="挂起" name="suspended" />
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
      <template #code="{ row }">
        <el-link type="primary" @click="openView(row)">{{ row.code }}</el-link>
      </template>
      <template #menu="{ row, size }">
        <el-button type="primary" link :size="size" @click="openView(row)">查看</el-button>
      </template>
      <template #customerName="{ row }">
        <el-link type="primary" @click="goCustomer(row)">{{ row.customerName }}</el-link>
      </template>
      <template #status="{ row }">
        <el-tag :type="OPP_STATUS_TAG[row.status] || 'info'">{{ labelOf(OPP_STATUS, row.status) }}</el-tag>
      </template>
      <template #stage="{ row }">
        <el-tag type="primary">{{ labelOf(OPP_STAGE, row.stage) }}</el-tag>
      </template>
    </avue-crud>

    <opportunity-view-drawer
      v-model="viewVisible"
      :detail="viewDetail"
      :loading="viewLoading"
      @advance="advanceStage"
      @rollback="rollbackStage"
      @mark-won="markWon"
      @mark-lost="openLostDialog"
      @suspend="suspendOpportunity"
      @resume="resumeOpportunity"
      @create-tender="goTender"
      @go-customer="goCustomer"
      @closed="viewDetail = null"
    />

    <el-dialog v-model="lostDialog.visible" title="标记商机已输" width="480px" append-to-body @closed="resetLostDialog">
      <el-form label-width="90px">
        <el-form-item label="失败原因" required>
          <el-input v-model="lostDialog.reason" type="textarea" :rows="4" placeholder="请填写丢单原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="lostDialog.visible = false">取消</el-button>
        <el-button type="danger" @click="confirmMarkLost">确认</el-button>
      </template>
    </el-dialog>
  </basic-container>
</template>

<script>
import { Option } from '../option/opportunity';
import OpportunityViewDrawer from '../components/OpportunityViewDrawer.vue';
import { OPP_STATUS, OPP_STAGE, OPP_STATUS_TAG, labelOf } from '../option/dict';
import { getPage, getDetail, add, update, remove } from '@/api/poms/phase1/opportunity';
import { getList as getCustomers } from '@/api/poms/phase1/customer';

const STAGE_FLOW = ['contact', 'requirement', 'proposal', 'quote', 'negotiation'];

export default {
  components: { OpportunityViewDrawer },
  data() {
    return {
      form: {},
      search: {},
      query: {},
      tabStatus: '',
      loading: false,
      page: { pageSize: 10, currentPage: 1, total: 0 },
      option: Option(this),
      data: [],
      customers: [],
      viewVisible: false,
      viewDetail: null,
      viewLoading: false,
      lostDialog: { visible: false, row: null, reason: '' },
      OPP_STATUS,
      OPP_STAGE,
      OPP_STATUS_TAG,
      labelOf,
    };
  },
  created() {
    this.loadCustomers();
  },
  methods: {
    openView(row) {
      this.viewLoading = true;
      this.viewVisible = true;
      getDetail(row.id)
        .then(res => {
          this.viewDetail = { ...res.data.data };
        })
        .finally(() => {
          this.viewLoading = false;
        });
    },
    refreshViewDetail(id) {
      if (!this.viewVisible || !id) return;
      getDetail(id).then(res => {
        this.viewDetail = { ...res.data.data };
      });
    },
    loadCustomers() {
      getCustomers(1, 100).then(res => {
        this.customers = res.data.data.records;
        const col = this.findObject(this.option.column, 'customerId');
        if (col) col.dicData = this.customers;
      });
    },
    onCustomerChange(id) {
      const c = this.customers.find(x => x.id === id);
      if (c) {
        this.form.customerId = id;
        this.form.customerName = c.name;
        this.form.followerName = c.managerUserName;
      }
    },
    beforeOpen(done, type) {
      const open = () => {
        this.$nextTick(() => done());
      };
      if (type === 'edit') {
        getDetail(this.form.id).then(res => {
          this.form = { ...res.data.data };
          open();
        });
        return;
      }
      this.loadCustomers();
      this.form = {
        source: 'active',
        stage: 'contact',
        status: 'ongoing',
        followerName: '张明',
        expectedAmount: 0,
        customerId: '',
      };
      open();
    },
    patchOpportunity(row, patch, message) {
      return update({ ...row, ...patch }).then(() => {
        this.onLoad(this.page);
        this.refreshViewDetail(row.id);
        if (message) this.$message.success(message);
      });
    },
    advanceStage(row) {
      const idx = STAGE_FLOW.indexOf(row.stage);
      if (idx < 0 || idx >= STAGE_FLOW.length - 1) {
        this.$message.warning('当前阶段无法继续推进');
        return;
      }
      const next = STAGE_FLOW[idx + 1];
      this.patchOpportunity(row, { stage: next }, `阶段已推进至：${labelOf(OPP_STAGE, next)}`);
    },
    rollbackStage(row) {
      const idx = STAGE_FLOW.indexOf(row.stage);
      if (idx <= 0) {
        this.$message.warning('已是初始阶段');
        return;
      }
      const prev = STAGE_FLOW[idx - 1];
      this.$confirm(`确认回退至「${labelOf(OPP_STAGE, prev)}」？`).then(() => {
        this.patchOpportunity(row, { stage: prev }, `阶段已回退至：${labelOf(OPP_STAGE, prev)}`);
      });
    },
    markWon(row) {
      if (!row.customerId) {
        this.$message.warning('请先关联客户');
        return;
      }
      this.$confirm('确认商机已赢？').then(() => {
        this.patchOpportunity(row, { stage: 'won', status: 'won' }, '商机已标记为已赢');
      });
    },
    openLostDialog(row) {
      this.lostDialog = { visible: true, row, reason: row.lostReason || '' };
    },
    resetLostDialog() {
      this.lostDialog = { visible: false, row: null, reason: '' };
    },
    confirmMarkLost() {
      const reason = (this.lostDialog.reason || '').trim();
      if (!reason) {
        this.$message.warning('请填写失败原因');
        return;
      }
      const row = this.lostDialog.row;
      this.patchOpportunity(row, { stage: 'lost', status: 'lost', lostReason: reason }, '商机已标记为已输').then(() => {
        this.lostDialog.visible = false;
      });
    },
    suspendOpportunity(row) {
      this.$confirm('确认挂起该商机？').then(() => {
        this.patchOpportunity(row, { status: 'suspended' }, '商机已挂起');
      });
    },
    resumeOpportunity(row) {
      this.patchOpportunity(row, { status: 'ongoing' }, '商机已恢复跟进');
    },
    goTender(row) {
      this.$router.push({ path: '/poms/phase1/tender', query: { opportunityId: row.id } });
    },
    goCustomer(row) {
      this.$router.push({ path: '/poms/phase1/customer', query: { highlight: row.customerId } });
    },
    rowSave(row, done, loading) {
      if (!row.customerId) {
        this.$message.warning('请选择客户');
        loading();
        return;
      }
      add({ ...row, stage: row.stage || 'contact', status: row.status || 'ongoing' })
        .then(() => {
          this.onLoad(this.page);
          this.$message.success('保存成功');
          done();
        })
        .finally(() => loading());
    },
    rowUpdate(row, index, done, loading) {
      update(row)
        .then(() => {
          this.onLoad(this.page);
          done();
        })
        .finally(() => loading());
    },
    rowDel(row) {
      this.$confirm('确定删除？')
        .then(() => remove(row.id))
        .then(() => {
          this.onLoad(this.page);
        });
    },
    onTabChange() {
      this.page.currentPage = 1;
      this.onLoad(this.page);
    },
    searchReset() {
      this.query = {};
      this.onLoad(this.page);
    },
    searchChange(params, done) {
      this.query = params;
      this.page.currentPage = 1;
      this.onLoad(this.page);
      done();
    },
    currentChange(p) {
      this.page.currentPage = p;
    },
    sizeChange(s) {
      this.page.pageSize = s;
    },
    refreshChange() {
      this.onLoad(this.page);
    },
    onLoad(page) {
      this.loading = true;
      const q = { ...this.query };
      if (this.tabStatus) q.status = this.tabStatus;
      getPage(page.currentPage, page.pageSize, q)
        .then(res => {
          this.page.total = res.data.data.total;
          this.data = res.data.data.records;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
