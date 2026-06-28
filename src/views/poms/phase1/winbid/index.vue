<template>
  <basic-container>
    <el-tabs v-model="tabContractStatus" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="待起草" name="pending" />
      <el-tab-pane label="已生成合同" name="generated" />
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
      <template #noticeFiles-form>
        <bid-file-panel
          v-model="form.noticeFiles"
          upload-label="将中标通知书拖到此处"
          hint-text="支持 PDF、Word、图片，单文件不超过 5MB"
          empty-text="暂无中标通知书"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
      </template>
      <template #contractStatus="{ row }">
        <el-tag :type="row.contractStatus === 'generated' ? 'success' : 'info'">
          {{ labelOf(WIN_CONTRACT_STATUS, row.contractStatus) }}
        </el-tag>
      </template>
    </avue-crud>

    <winbid-view-drawer
      v-model="viewVisible"
      :detail="viewDetail"
      :loading="viewLoading"
      @edit-winbid="editFromView"
      @create-contract="goCreateContract"
      @view-contract="goContract"
      @save-files="saveNoticeFiles"
      @closed="viewDetail = null"
    />
  </basic-container>
</template>

<script>
import { Option } from '../option/winbid';
import BidFilePanel from '../components/BidFilePanel.vue';
import WinbidViewDrawer from '../components/WinbidViewDrawer.vue';
import { WIN_CONTRACT_STATUS, labelOf } from '../option/dict';
import { getPage, getDetail, add, update, remove } from '@/api/poms/phase1/winbid';
import { getList as getTenders } from '@/api/poms/phase1/tender';

export default {
  components: { BidFilePanel, WinbidViewDrawer },
  data() {
    return {
      form: {},
      search: {},
      query: {},
      loading: false,
      page: { pageSize: 10, currentPage: 1, total: 0 },
      option: Option(this),
      data: [],
      tenders: [],
      pendingTenderId: '',
      viewVisible: false,
      viewDetail: null,
      viewLoading: false,
      tabContractStatus: '',
      WIN_CONTRACT_STATUS,
      labelOf,
    };
  },
  mounted() {
    const { tenderId } = this.$route.query;
    if (tenderId) {
      this.pendingTenderId = tenderId;
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
        this.viewDetail = { ...res.data.data, noticeFiles: res.data.data.noticeFiles || [] };
      }).finally(() => {
        this.viewLoading = false;
      });
    },
    refreshViewDetail(id) {
      if (!this.viewVisible || !id) return;
      getDetail(id).then(res => {
        this.viewDetail = { ...res.data.data, noticeFiles: res.data.data.noticeFiles || [] };
      });
    },
    saveNoticeFiles(row) {
      update({ ...row, noticeFiles: row.noticeFiles || [] }).then(() => {
        this.refreshViewDetail(row.id);
        this.onLoad(this.page);
        this.$message.success('中标通知书已保存');
      });
    },
    editFromView(row) {
      this.viewVisible = false;
      const index = this.data.findIndex(item => item.id === row.id);
      if (index >= 0) this.$refs.crud.rowEdit(row, index);
    },
    goCreateContract(row) {
      this.$router.push({ path: '/poms/phase1/contract', query: { winbidId: row.id, action: 'add' } });
    },
    goContract(row) {
      this.$router.push({ path: '/poms/phase1/contract', query: { id: row.contractId } });
    },
    loadTenders() {
      return getTenders(1, 100, { result: 'won' }).then(res => {
        this.tenders = res.data.data.records;
        const col = this.findObject(this.option.column, 'tenderId');
        if (col) {
          col.dicData = this.tenders.map(t => ({
            id: t.id,
            name: `${t.code} - ${t.projectName}`,
          }));
        }
      });
    },
    onTenderChange(id) {
      const t = this.tenders.find(x => x.id === id);
      if (t) {
        this.form.tenderId = id;
        this.form.tenderCode = t.code;
        this.form.projectName = t.projectName;
        this.form.customerName = t.customerName;
      }
    },
    beforeOpen(done, type) {
      const open = () => this.$nextTick(() => done());
      if (type === 'edit') {
        getDetail(this.form.id).then(res => {
          this.form = { ...res.data.data, noticeFiles: res.data.data.noticeFiles || [] };
          open();
        });
        return;
      }
      this.loadTenders().then(() => {
        this.form = { contractStatus: 'pending', tenderId: '', noticeFiles: [] };
        const tid = this.pendingTenderId || this.$route.query.tenderId;
        if (tid) {
          this.form.tenderId = tid;
          this.onTenderChange(tid);
          this.pendingTenderId = '';
        }
        open();
      });
    },
    rowSave(row, done, loading) {
      if (!row.tenderId) {
        this.$message.warning('请选择投标');
        loading();
        return;
      }
      add({ ...row, contractStatus: 'pending', noticeFiles: row.noticeFiles || [] }).then(() => {
        this.onLoad(this.page);
        done();
      }).finally(() => loading());
    },
    rowUpdate(row, index, done, loading) {
      update({ ...row, noticeFiles: row.noticeFiles || [] }).then(() => {
        this.onLoad(this.page);
        done();
      }).finally(() => loading());
    },
    rowDel(row) {
      this.$confirm('确定删除？').then(() => remove(row.id)).then(() => this.onLoad(this.page));
    },
    searchReset() { this.query = {}; this.onLoad(this.page); },
    onTabChange() {
      this.page.currentPage = 1;
      this.onLoad(this.page);
    },
    searchChange(params, done) { this.query = params; this.page.currentPage = 1; this.onLoad(this.page); done(); },
    currentChange(p) { this.page.currentPage = p; },
    sizeChange(s) { this.page.pageSize = s; },
    refreshChange() { this.onLoad(this.page); },
    onLoad(page) {
      this.loading = true;
      const q = { ...this.query };
      if (this.tabContractStatus) q.contractStatus = this.tabContractStatus;
      getPage(page.currentPage, page.pageSize, q).then(res => {
        this.page.total = res.data.data.total;
        this.data = res.data.data.records;
      }).finally(() => { this.loading = false; });
    },
  },
};
</script>
