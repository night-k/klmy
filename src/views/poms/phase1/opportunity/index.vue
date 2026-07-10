<template>
  <basic-container>
    <el-tabs v-model="tabStatus" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="已登记" name="ongoing" />
      <el-tab-pane label="挂起" name="suspended" />
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
        <el-button type="primary" @click="handleAdd">新增商机</el-button>
      </template>
      <template #code="{ row }">
        <el-link type="primary" @click="openView(row)">{{ row.code }}</el-link>
      </template>
      <template #menu="{ row, size }">
        <el-button type="primary" link :size="size" @click="openView(row)">查看</el-button>
        <el-button type="primary" link :size="size" @click="handleEdit(row)">编辑</el-button>
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
      @edit="editFromView"
      @suspend="suspendOpportunity"
      @resume="resumeOpportunity"
      @create-tender="goTender"
      @go-customer="goCustomer"
      @closed="viewDetail = null"
    />

    <crud-form-drawer ref="editRef" :crud-option="option" add-title="新增商机" edit-title="编辑商机" @save="handleFormSave" />
  </basic-container>
</template>

<script>
import { Option } from '../option/opportunity';
import OpportunityViewDrawer from '../components/OpportunityViewDrawer.vue';
import CrudFormDrawer from '../components/CrudFormDrawer.vue';
import { OPP_STATUS, OPP_STAGE, OPP_STATUS_TAG, labelOf } from '../option/dict';
import { getPage, getDetail, add, update, remove } from '@/api/poms/phase1/opportunity';
import { getList as getCustomers } from '@/api/poms/phase1/customer';

export default {
  components: { OpportunityViewDrawer, CrudFormDrawer },
  data() {
    return {
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
      return getCustomers(1, 100).then(res => {
        this.customers = res.data.data.records;
        const col = this.findObject(this.option.column, 'customerId');
        if (col) col.dicData = this.customers;
      });
    },
    onCustomerChange(id) {
      const c = this.customers.find(x => x.id === id);
      const drawer = this.$refs.editRef;
      if (c && drawer) {
        drawer.setForm({
          customerId: id,
          customerName: c.name,
          followerName: c.managerUserName,
        });
      }
    },
    handleAdd() {
      this.loadCustomers().then(() => {
        this.$refs.editRef?.open({
          source: 'active',
          stage: 'registered',
          status: 'ongoing',
          followerName: '张明',
          expectedAmount: 0,
          customerId: '',
        });
      });
    },
    handleEdit(row) {
      this.loadCustomers().then(() => {
        getDetail(row.id).then(res => {
          this.$refs.editRef?.open({ ...res.data.data });
        });
      });
    },
    editFromView(detail) {
      this.viewVisible = false;
      this.handleEdit(detail);
    },
    handleFormSave(row, { done, loading }) {
      if (!row.customerId) {
        this.$message.warning('请选择客户');
        loading();
        return;
      }
      const payload = row.id ? row : { ...row, stage: row.stage || 'registered', status: 'ongoing' };
      const request = row.id ? update(payload) : add(payload);
      request
        .then(() => {
          this.onLoad(this.page);
          this.$message.success(row.id ? '更新成功' : '保存成功');
          this.refreshViewDetail(row.id);
          done();
        })
        .finally(() => loading());
    },
    patchOpportunity(row, patch, message) {
      return update({ ...row, ...patch }).then(() => {
        this.onLoad(this.page);
        this.refreshViewDetail(row.id);
        if (message) this.$message.success(message);
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
