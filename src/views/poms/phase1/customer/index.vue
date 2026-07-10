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
        <el-button type="primary" @click="handleAdd">新增客户</el-button>
      </template>
      <template #menu="{ row, size }">
        <el-button type="primary" link :size="size" @click="openView(row)">查看</el-button>
        <el-button type="primary" link :size="size" @click="handleEdit(row)">编辑</el-button>
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

    <customer-view-drawer v-model="viewVisible" :detail="viewDetail" :loading="viewLoading" :history="viewHistory" :history-loading="viewHistoryLoading" @edit="editFromView" @closed="onViewClosed" />

    <crud-form-drawer ref="editRef" :crud-option="option" add-title="新增客户" edit-title="编辑客户" @save="handleFormSave" />
  </basic-container>
</template>

<script>
import CustomerViewDrawer from '../components/CustomerViewDrawer.vue';
import CrudFormDrawer from '../components/CrudFormDrawer.vue';
import { Option } from '../option/customer';
import { CUSTOMER_STATUS, labelOf } from '../option/dict';
import { getPage, getDetail, add, update, remove, getHistory } from '@/api/poms/phase1/customer';

export default {
  components: { CustomerViewDrawer, CrudFormDrawer },
  data() {
    return {
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
    handleAdd() {
      this.$refs.editRef?.open({ status: 'normal', managerUserName: '张明', contacts: [] });
    },
    handleEdit(row) {
      getDetail(row.id).then(res => {
        this.$refs.editRef?.open({ ...res.data.data });
      });
    },
    editFromView(detail) {
      this.viewVisible = false;
      this.handleEdit(detail);
    },
    handleFormSave(row, { done, loading }) {
      const request = row.id ? update(row) : add(row);
      request
        .then(() => {
          this.onLoad(this.page);
          this.$message.success(row.id ? '更新成功' : '保存成功');
          if (this.viewVisible && row.id && this.viewDetail?.id === row.id) {
            getDetail(row.id).then(res => {
              this.viewDetail = { ...res.data.data };
            });
          }
          done();
        })
        .finally(() => loading());
    },
    onViewClosed() {
      this.viewDetail = null;
      this.viewHistory = null;
    },
    rowDel(row) {
      this.$confirm('确定删除？')
        .then(() => remove(row.id))
        .then(() => {
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
          const d = res.data.data;
          this.page.total = d.total;
          this.data = d.records;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
