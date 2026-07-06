<template>
  <basic-container>
    <el-tabs v-model="tabStatus" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane v-for="s in PLAN_STATUS" :key="s.value" :label="s.label" :name="s.value" />
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
      <template #menu-left>
        <el-button type="primary" @click="handleAdd">新增计划</el-button>
      </template>
      <template #version="{ row }">
        <el-link type="primary" @click="openView(row)">{{ row.version }}</el-link>
      </template>
      <template #status="{ row }">
        <el-tag v-if="row.status === 'active'" type="primary">已生效</el-tag>
        <el-tag v-else-if="row.status === 'archived'" type="info">已归档</el-tag>
        <el-tag v-else type="warning">草稿</el-tag>
      </template>
      <template #planRange="{ row }">{{ row.planStartDate }} ~ {{ row.planEndDate }}</template>
      <template #taskCount="{ row }">{{ (row.tasks || []).length }}</template>
      <template #menu="{ row, size }">
        <el-button type="primary" link :size="size" @click="openView(row)">查看</el-button>
        <el-button type="primary" link :size="size" @click="handleEdit(row)">编辑</el-button>
        <el-button v-if="row.status !== 'active' && row.status !== 'archived'" type="success" link :size="size" @click="handleActivate(row)">计划生效</el-button>
        <el-button v-if="row.status === 'active'" type="warning" link :size="size" @click="handleArchive(row)">作废</el-button>
      </template>
    </avue-crud>

    <plan-edit-drawer ref="editRef" @success="handleDialogSuccess" />
    <plan-view-drawer v-model="viewVisible" :detail="viewDetail" :loading="viewLoading" @edit="editFromView" @activate="handleActivate" @archive="handleArchive" @closed="viewDetail = null" />
  </basic-container>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus';
import PlanEditDrawer from './components/plan-edit-dialog.vue';
import PlanViewDrawer from '../components/PlanViewDrawer.vue';
import { Option } from '../option/plan';
import { PLAN_STATUS } from '../option/dict';
import { getPage, getDetail, activate, archive } from '@/api/poms/phase2/plan';
import listPageMixin from '../utils/listPageMixin';

export default {
  components: { PlanEditDrawer, PlanViewDrawer },
  mixins: [listPageMixin],
  data() {
    return {
      option: Option(),
      PLAN_STATUS,
      viewVisible: false,
      viewDetail: null,
      viewLoading: false,
    };
  },
  methods: {
    onLoad(page) {
      this.loading = true;
      const params = { ...this.query };
      if (this.tabStatus) params.status = this.tabStatus;
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
    handleAdd() {
      this.$refs.editRef?.open(null);
    },
    handleEdit(row) {
      getDetail(row.id).then(res => {
        this.$refs.editRef?.open(res.data.data);
      });
    },
    editFromView(detail) {
      this.viewVisible = false;
      this.handleEdit(detail);
    },
    handleDialogSuccess() {
      this.onLoad(this.page);
      if (this.viewVisible && this.viewDetail?.id) {
        getDetail(this.viewDetail.id).then(res => {
          this.viewDetail = { ...res.data.data };
        });
      }
    },
    async handleActivate(row) {
      await ElMessageBox.confirm(`确定使计划【${row.projectName} · ${row.version}】生效？生效后任务将写入项目任务列表，并同步更新里程碑计划日期。`, '计划生效');
      await activate(row.id);
      ElMessage.success('计划已生效，任务已写入任务管理，里程碑已同步');
      this.onLoad(this.page);
      if (this.viewVisible && this.viewDetail?.id === row.id) {
        getDetail(row.id).then(res => {
          this.viewDetail = { ...res.data.data };
        });
      }
    },
    async handleArchive(row) {
      let reason = '主动作废';
      try {
        const { value } = await ElMessageBox.prompt('请输入作废原因', '作废计划', {
          inputType: 'textarea',
          inputPlaceholder: '将关联的待派发任务一并取消',
          inputValidator: v => (v && v.trim() ? true : '请输入作废原因'),
        });
        reason = value.trim();
      } catch (e) {
        return;
      }
      await archive(row.id, reason);
      ElMessage.success(`计划已作废：${reason}`);
      this.onLoad(this.page);
      if (this.viewVisible && this.viewDetail?.id === row.id) {
        getDetail(row.id).then(res => {
          this.viewDetail = { ...res.data.data };
        });
      }
    },
  },
};
</script>
