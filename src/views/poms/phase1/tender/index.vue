<template>
  <basic-container>
    <el-tabs v-model="tabResult" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="待开标" name="pending" />
      <el-tab-pane label="中标" name="won" />
      <el-tab-pane label="未中标" name="lost" />
      <el-tab-pane label="流标" name="abort" />
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
      <template #bidFiles-form>
        <bid-file-panel v-model="form.bidFiles" />
      </template>
      <template #result="{ row }">
        <el-tag :type="TENDER_RESULT_TAG[row.result]">{{ labelOf(TENDER_RESULT, row.result) }}</el-tag>
      </template>
    </avue-crud>

    <tender-view-drawer
      v-model="viewVisible"
      :detail="viewDetail"
      :loading="viewLoading"
      @edit-result="openResultDialog"
      @edit-tender="editFromView"
      @register-winbid="goWinbid"
      @save-files="saveBidFiles"
      @closed="viewDetail = null"
    />

    <tender-result-dialog
      v-model="resultDialogVisible"
      :detail="viewDetail"
      @submit="submitResultChange"
    />
  </basic-container>
</template>

<script>
import { Option } from '../option/tender';
import BidFilePanel from '../components/BidFilePanel.vue';
import TenderViewDrawer from '../components/TenderViewDrawer.vue';
import TenderResultDialog from '../components/TenderResultDialog.vue';
import { TENDER_RESULT, TENDER_RESULT_TAG, labelOf } from '../option/dict';
import { getPage, getDetail, add, update, remove } from '@/api/poms/phase1/tender';
import { getList as getOpportunities, update as updateOpportunity } from '@/api/poms/phase1/opportunity';

export default {
  components: { BidFilePanel, TenderViewDrawer, TenderResultDialog },
  data() {
    return {
      tabResult: '',
      form: {},
      search: {},
      query: {},
      loading: false,
      page: { pageSize: 10, currentPage: 1, total: 0 },
      option: Option(this),
      data: [],
      opportunities: [],
      pendingOpportunityId: '',
      viewVisible: false,
      viewDetail: null,
      viewLoading: false,
      resultDialogVisible: false,
      TENDER_RESULT,
      TENDER_RESULT_TAG,
      labelOf,
    };
  },
  mounted() {
    const { opportunityId } = this.$route.query;
    if (opportunityId) {
      this.pendingOpportunityId = opportunityId;
      this.$nextTick(() => {
        if (this.$refs.crud) this.$refs.crud.rowAdd();
      });
    }
  },
  methods: {
    openView(row) {
      this.viewLoading = true;
      this.viewVisible = true;
      getDetail(row.id).then(res => {
        this.viewDetail = { ...res.data.data, bidFiles: res.data.data.bidFiles || [] };
      }).finally(() => {
        this.viewLoading = false;
      });
    },
    refreshViewDetail(id) {
      if (!this.viewVisible || !id) return;
      getDetail(id).then(res => {
        this.viewDetail = { ...res.data.data, bidFiles: res.data.data.bidFiles || [] };
      });
    },
    openResultDialog() {
      this.resultDialogVisible = true;
    },
    submitResultChange(payload) {
      if (!this.viewDetail) return;
      update({ ...this.viewDetail, ...payload }).then(() => {
        this.onLoad(this.page);
        this.refreshViewDetail(this.viewDetail.id);
        this.$message.success('中标结果已更新');
      });
    },
    saveBidFiles(row) {
      update({ ...row, bidFiles: row.bidFiles || [] }).then(() => {
        this.refreshViewDetail(row.id);
        this.onLoad(this.page);
        this.$message.success('投标文件已保存');
      });
    },
    editFromView(row) {
      this.viewVisible = false;
      const index = this.data.findIndex(item => item.id === row.id);
      if (index >= 0) {
        this.$refs.crud.rowEdit(row, index);
      }
    },
    loadOpportunities() {
      return getOpportunities(1, 100).then(res => {
        this.opportunities = res.data.data.records.filter(o => o.status !== 'lost');
        const col = this.findObject(this.option.column, 'opportunityId');
        if (col) {
          col.dicData = this.opportunities.map(o => ({
            id: o.id,
            name: `${o.code} - ${o.projectName}`,
          }));
        }
      });
    },
    onOppChange(id) {
      const o = this.opportunities.find(x => x.id === id);
      if (o) {
        this.form.opportunityId = id;
        this.form.opportunityName = o.projectName;
        this.form.projectName = o.projectName;
        this.form.customerName = o.customerName;
        this.form.tenderOrg = o.customerName;
      }
    },
    onTabChange() {
      this.page.currentPage = 1;
      this.onLoad(this.page);
    },
    beforeOpen(done, type) {
      const open = () => this.$nextTick(() => done());
      if (type === 'edit') {
        getDetail(this.form.id).then(res => {
          this.form = { ...res.data.data, bidFiles: res.data.data.bidFiles || [] };
          open();
        });
        return;
      }
      this.loadOpportunities().then(() => {
        this.form = { result: 'pending', tenderMethod: 'public', opportunityId: '', bidFiles: [] };
        const oppId = this.pendingOpportunityId || this.$route.query.opportunityId;
        if (oppId) {
          this.form.opportunityId = oppId;
          this.onOppChange(oppId);
          this.pendingOpportunityId = '';
        }
        open();
      });
    },
    goWinbid(row) {
      this.$router.push({ path: '/poms/phase1/winbid', query: { tenderId: row.id } });
    },
    rowSave(row, done, loading) {
      if (!row.opportunityId) {
        this.$message.warning('请选择商机');
        loading();
        return;
      }
      add({ ...row, bidFiles: row.bidFiles || [] }).then(res => {
        const tender = res.data.data;
        if (tender.opportunityId) {
          updateOpportunity({ id: tender.opportunityId, tenderId: tender.id }).then(() => {});
        }
        this.onLoad(this.page);
        done();
      }).finally(() => loading());
    },
    rowUpdate(row, index, done, loading) {
      update({ ...row, bidFiles: row.bidFiles || [] }).then(() => {
        this.onLoad(this.page);
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
      if (this.tabResult) q.result = this.tabResult;
      getPage(page.currentPage, page.pageSize, q).then(res => {
        this.page.total = res.data.data.total;
        this.data = res.data.data.records;
      }).finally(() => { this.loading = false; });
    },
  },
};
</script>
