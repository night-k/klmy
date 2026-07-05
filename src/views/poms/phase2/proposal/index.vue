<template>
  <basic-container>
    <el-tabs v-model="tabStatus" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane v-for="s in PROPOSAL_STATUS" :key="s.value" :label="s.label" :name="s.value" />
    </el-tabs>
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
      <template #auditStatus="{ row }">
        <el-tag :type="row.auditStatus === 'approved' ? 'success' : row.auditStatus === 'rejected' ? 'danger' : 'warning'">
          {{ labelOf(PROPOSAL_STATUS, row.auditStatus) }}
        </el-tag>
      </template>
      <template #menu="{ row, size }">
        <el-button type="primary" link :size="size" @click="openDrawer(row)">查看/处理</el-button>
      </template>
    </avue-crud>
    <proposal-view-drawer v-model="drawerVisible" :project-id="drawerProjectId" @changed="onDrawerChanged" @closed="drawerProjectId = ''" />
  </basic-container>
</template>

<script>
import ProposalViewDrawer from '../components/ProposalViewDrawer.vue';
import { Option } from '../option/proposal';
import { PROPOSAL_STATUS, labelOf } from '../option/dict';
import { getPage } from '@/api/poms/phase2/proposal';
import listPageMixin from '../utils/listPageMixin';

export default {
  components: { ProposalViewDrawer },
  mixins: [listPageMixin],
  data() {
    return {
      option: Option(),
      PROPOSAL_STATUS,
      labelOf,
      drawerVisible: false,
      drawerProjectId: '',
    };
  },
  methods: {
    onLoad(page) {
      this.loading = true;
      const params = { ...this.query };
      if (this.tabStatus) params.auditStatus = this.tabStatus;
      getPage(page.currentPage, page.pageSize, params)
        .then(res => {
          const d = res.data.data;
          this.page.total = d.total;
          this.data = d.records;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    openDrawer(row) {
      this.drawerProjectId = row.projectId;
      this.drawerVisible = true;
    },
    onDrawerChanged() {
      this.onLoad(this.page);
    },
  },
};
</script>
