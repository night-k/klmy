<template>
  <basic-container>
    <el-tabs v-model="tabStatus" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="正常" name="normal" />
      <el-tab-pane label="暂停" name="paused" />
      <el-tab-pane label="流失" name="lost" />
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
      <template #code="{ row }">
        <el-link type="primary" @click="openView(row)">{{ row.code }}</el-link>
      </template>
      <template #status="{ row }">
        <el-tag :type="row.status === 'normal' ? 'success' : row.status === 'paused' ? 'warning' : 'danger'">
          {{ labelOf(CUSTOMER_STATUS, row.status) }}
        </el-tag>
      </template>
    </avue-crud>

    <customer-view-drawer
      v-model="viewVisible"
      :detail="viewDetail"
      :loading="viewLoading"
      :history="viewHistory"
      :history-loading="viewHistoryLoading"
      @edit="editFromView"
      @closed="onViewClosed"
    />
  </basic-container>
</template>

<script>
import CustomerViewDrawer from '../components/CustomerViewDrawer.vue';
import { Option } from '../option/customer';
import { CUSTOMER_STATUS, labelOf } from '../option/dict';
import { getPage, getDetail, add, update, remove, getHistory } from '@/api/poms/phase1/customer';

export default {
  components: { CustomerViewDrawer },
  data() {
    return {
      form: {},
      search: {},
      query: {},
      loading: false,
      page: { pageSize: 10, currentPage: 1, total: 0 },
      option: Option(this),
      data: [],
      tabStatus: '',
      viewVisible: false,
      viewDetail: null,
      viewLoading: false,
      viewHistory: null,
      viewHistoryLoading: false,
      CUSTOMER_STATUS,
      labelOf,
    };
  },
  methods: {
    openView(row) {
      this.viewLoading = true;
      this.viewHistory = null;
      this.viewHistoryLoading = true;
      this.viewVisible = true;
      getDetail(row.id)
        .then(res => {
          this.viewDetail = { ...res.data.data };
        })
        .finally(() => {
          this.viewLoading = false;
        });
      getHistory(row.id)
        .then(res => {
          this.viewHistory = res.data.data;
        })
        .finally(() => {
          this.viewHistoryLoading = false;
        });
    },
    editFromView(detail) {
      this.viewVisible = false;
      const index = this.data.findIndex(item => item.id === detail.id);
      this.$nextTick(() => {
        getDetail(detail.id).then(res => {
          this.form = { ...res.data.data };
          if (index >= 0) {
            this.$refs.crud.rowEdit(this.form, index);
          } else {
            this.$refs.crud.rowEdit(this.form, 0);
          }
        });
      });
    },
    onViewClosed() {
      this.viewDetail = null;
      this.viewHistory = null;
    },
    beforeOpen(done, type) {
      const open = () => this.$nextTick(() => done());
      if (type === 'edit') {
        getDetail(this.form.id).then(res => {
          this.form = { ...res.data.data };
          open();
        });
        return;
      }
      if (type === 'view') {
        open();
        return;
      }
      this.form = { status: 'normal', managerUserName: '张明', contacts: [] };
      open();
    },
    rowSave(row, done, loading) {
      add(row).then(() => {
        this.onLoad(this.page);
        this.$message.success('保存成功');
        done();
      }).finally(() => loading());
    },
    rowUpdate(row, index, done, loading) {
      update(row).then(() => {
        this.onLoad(this.page);
        this.$message.success('更新成功');
        done();
      }).finally(() => loading());
    },
    rowDel(row) {
      this.$confirm('确定删除？').then(() => remove(row.id)).then(() => {
        this.onLoad(this.page);
        this.$message.success('删除成功');
      });
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
    currentChange(p) { this.page.currentPage = p; },
    sizeChange(s) { this.page.pageSize = s; },
    refreshChange() { this.onLoad(this.page); },
    onLoad(page) {
      this.loading = true;
      const q = { ...this.query };
      if (this.tabStatus) q.status = this.tabStatus;
      getPage(page.currentPage, page.pageSize, q).then(res => {
        const d = res.data.data;
        this.page.total = d.total;
        this.data = d.records;
      }).finally(() => { this.loading = false; });
    },
  },
};
</script>
