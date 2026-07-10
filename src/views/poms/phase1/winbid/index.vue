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
      :option="option"
      :table-loading="loading"
      :data="data"
      @row-del="rowDel"
      @search-change="searchChange"
      @search-reset="searchReset"
      @current-change="currentChange"
      @size-change="sizeChange"
      @refresh-change="refreshChange"
      @on-load="onLoad"
    >
      <template #menu-left>
        <el-button type="primary" @click="handleAdd">登记中标</el-button>
      </template>
      <template #code="{ row }">
        <el-link type="primary" @click="openView(row)">{{ row.code }}</el-link>
      </template>
      <template #menu="{ row, size }">
        <el-button type="primary" link :size="size" @click="openView(row)">查看</el-button>
        <el-button type="primary" link :size="size" @click="handleEdit(row)">编辑</el-button>
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

    <crud-form-drawer ref="editRef" :crud-option="option" add-title="登记中标" edit-title="编辑中标" size="780px" @save="handleFormSave">
      <template #noticeFiles="{ form }">
        <bid-file-panel
          v-model="form.noticeFiles"
          upload-label="将中标通知书拖到此处"
          hint-text="支持 PDF、Word、图片，单文件不超过 5MB"
          empty-text="暂无中标通知书"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
      </template>
    </crud-form-drawer>
  </basic-container>
</template>

<script>
import { Option } from '../option/winbid';
import BidFilePanel from '../components/BidFilePanel.vue';
import WinbidViewDrawer from '../components/WinbidViewDrawer.vue';
import CrudFormDrawer from '../components/CrudFormDrawer.vue';
import { WIN_CONTRACT_STATUS, labelOf } from '../option/dict';
import { getPage, getDetail, add, update, remove } from '@/api/poms/phase1/winbid';
import { getList as getTenders } from '@/api/poms/phase1/tender';

export default {
  components: { BidFilePanel, WinbidViewDrawer, CrudFormDrawer },
  data() {
    return {
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
      this.$nextTick(() => this.handleAdd());
    }
  },
  methods: {
    openView(row) {
      this.viewLoading = true;
      this.viewVisible = true;
      getDetail(row.id)
        .then(res => {
          this.viewDetail = { ...res.data.data, noticeFiles: res.data.data.noticeFiles || [] };
        })
        .finally(() => {
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
    handleAdd() {
      this.loadTenders().then(() => {
        const form = { contractStatus: 'pending', tenderId: '', noticeFiles: [] };
        const tid = this.pendingTenderId || this.$route.query.tenderId;
        if (tid) {
          form.tenderId = tid;
          this.onTenderChange(tid, form);
          this.pendingTenderId = '';
        }
        this.$refs.editRef?.open(form);
      });
    },
    handleEdit(row) {
      this.loadTenders().then(() => {
        getDetail(row.id).then(res => {
          this.$refs.editRef?.open({ ...res.data.data, noticeFiles: res.data.data.noticeFiles || [] });
        });
      });
    },
    editFromView(row) {
      this.viewVisible = false;
      this.handleEdit(row);
    },
    handleFormSave(row, { done, loading }) {
      if (!row.tenderId) {
        this.$message.warning('请选择投标');
        loading();
        return;
      }
      const payload = { ...row, noticeFiles: row.noticeFiles || [] };
      const request = row.id ? update(payload) : add({ ...payload, contractStatus: 'pending' });
      request
        .then(() => {
          this.onLoad(this.page);
          this.$message.success(row.id ? '更新成功' : '保存成功');
          this.refreshViewDetail(row.id);
          done();
        })
        .finally(() => loading());
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
    onTenderChange(id, targetForm) {
      const t = this.tenders.find(x => x.id === id);
      const patch = t
        ? {
            tenderId: id,
            tenderCode: t.code,
            projectName: t.projectName,
            customerName: t.customerName,
          }
        : { tenderId: id };
      if (targetForm) {
        Object.assign(targetForm, patch);
        return;
      }
      this.$refs.editRef?.setForm(patch);
    },
    rowDel(row) {
      this.$confirm('确定删除？')
        .then(() => remove(row.id))
        .then(() => this.onLoad(this.page));
    },
    searchReset() {
      this.query = {};
      this.onLoad(this.page);
    },
    onTabChange() {
      this.page.currentPage = 1;
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
      if (this.tabContractStatus) q.contractStatus = this.tabContractStatus;
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
