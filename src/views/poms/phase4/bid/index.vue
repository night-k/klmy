<template>
  <basic-container>
    <el-tabs v-model="tabStatus" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="组包中" name="draft" />
      <el-tab-pane label="可投标" name="ready" />
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
        <el-button type="primary" link :size="size" @click="openEdit(row)">编辑</el-button>
      </template>
      <template #status="{ row }">
        <el-tag :type="BID_STATUS_TAG[row.status]" effect="dark" size="small">{{ labelOf(BID_STATUS, row.status) }}</el-tag>
      </template>
    </avue-crud>

    <bid-view-drawer
      v-model="viewVisible"
      :detail="viewDetail"
      :eligible-members="eligibleMembers"
      :loading="viewLoading"
      @edit="editFromView"
      @go-tender="goTender"
      @mark-ready="handleMarkReady"
      @add-member="handleAddMember"
      @remove-member="handleRemoveMember"
      @closed="onViewClosed"
    />
  </basic-container>
</template>

<script>
import BidViewDrawer from '../components/BidViewDrawer.vue';
import { Option } from '../option/bid';
import { BID_STATUS, BID_STATUS_TAG, labelOf } from '../option/dict';
import { getPage, getDetail, add, update, markReady, addMember, removeMember, getEligibleMembers, getBidTemplateOptions } from '@/api/poms/phase4/bid';

export default {
  components: { BidViewDrawer },
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
      eligibleMembers: [],
      bidTemplates: [],
      BID_STATUS,
      BID_STATUS_TAG,
      labelOf,
    };
  },
  mounted() {
    getEligibleMembers().then(res => {
      this.eligibleMembers = res.data.data || [];
    });
    this.loadBidTemplates();
    const { packageId } = this.$route.query;
    if (packageId) this.openViewById(String(packageId));
  },
  methods: {
    loadBidTemplates() {
      return getBidTemplateOptions().then(res => {
        this.bidTemplates = res.data.data || [];
        const col = this.findObject(this.option.column, 'templateId');
        if (col) col.dicData = this.bidTemplates;
      });
    },
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
    openViewById(id) {
      getDetail(id).then(res => {
        if (res.data.data) this.openView(res.data.data);
      });
    },
    onViewClosed() {
      this.viewDetail = null;
    },
    openEdit(row) {
      const index = this.data.findIndex(item => item.id === row.id);
      getDetail(row.id).then(res => {
        this.form = { ...res.data.data };
        this.$nextTick(() => {
          this.$refs.crud.rowEdit(this.form, index >= 0 ? index : 0);
        });
      });
    },
    editFromView(detail) {
      this.viewVisible = false;
      this.openEdit(detail);
    },
    beforeOpen(done, type) {
      const open = () => {
        this.$nextTick(() => done());
      };
      this.loadBidTemplates().then(() => {
        if (type === 'add') {
          const first = this.bidTemplates[0];
          this.form = {
            requiredRoles: 3,
            templateId: first?.value || '',
            templateName: first?.label || '',
          };
        }
        open();
      });
    },
    rowSave(row, done, loading) {
      add(row)
        .then(() => {
          this.onLoad(this.page);
          this.$message.success('创建成功');
          done();
        })
        .finally(() => loading());
    },
    rowUpdate(row, index, done, loading) {
      update(row)
        .then(() => {
          this.onLoad(this.page);
          this.$message.success('更新成功');
          done();
        })
        .finally(() => loading());
    },
    handleMarkReady(detail) {
      markReady(detail.id).then(() => {
        getDetail(detail.id).then(res => {
          this.viewDetail = res.data.data;
        });
        this.onLoad(this.page);
        this.$message.success('已标记可投标');
      });
    },
    handleAddMember(memberId) {
      if (!this.viewDetail) return;
      addMember(this.viewDetail.id, memberId).then(() => {
        getDetail(this.viewDetail.id).then(res => {
          this.viewDetail = res.data.data;
        });
        this.onLoad(this.page);
        this.$message.success('成员已加入');
      });
    },
    handleRemoveMember(memberId) {
      if (!this.viewDetail) return;
      removeMember(this.viewDetail.id, memberId).then(() => {
        getDetail(this.viewDetail.id).then(res => {
          this.viewDetail = res.data.data;
        });
        this.onLoad(this.page);
        this.$message.success('成员已移除');
      });
    },
    goTender(detail) {
      this.$router.push({ path: '/poms/phase1/tender', query: { fromPhase4: detail.id, projectName: detail.projectName } });
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
