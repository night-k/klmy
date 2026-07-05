<template>
  <basic-container>
    <el-tabs v-model="tabStatus" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane v-for="s in PLAN_STATUS" :key="s.value" :label="s.label" :name="s.value" />
    </el-tabs>
    <div class="table-toolbar">
      <el-button type="primary" @click="handleAdd">新增计划</el-button>
    </div>
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
      <template #status="{ row }">
        <el-tag v-if="row.status === 'active'" type="primary">已生效</el-tag>
        <el-tag v-else-if="row.status === 'archived'" type="info">已归档</el-tag>
        <el-tag v-else type="warning">草稿</el-tag>
      </template>
      <template #planRange="{ row }">{{ row.planStartDate }} ~ {{ row.planEndDate }}</template>
      <template #taskCount="{ row }">{{ (row.tasks || []).length }}</template>
      <template #menu="{ row, size }">
        <el-button type="primary" link :size="size" @click="handleEdit(row)">编辑</el-button>
        <el-button v-if="row.status !== 'active' && row.status !== 'archived'" type="success" link :size="size" @click="handleActivate(row)">计划生效</el-button>
        <el-button v-if="row.status === 'active'" type="warning" link :size="size" @click="handleArchive(row)">作废</el-button>
      </template>
    </avue-crud>

    <plan-edit-dialog ref="dialogRef" @success="handleDialogSuccess" />
  </basic-container>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus';
import PlanEditDialog from './components/plan-edit-dialog.vue';
import { Option } from '../option/plan';
import { PLAN_STATUS } from '../option/dict';
import { getPage, activate, archive } from '@/api/poms/phase2/plan';
import listPageMixin from '../utils/listPageMixin';

export default {
  components: { PlanEditDialog },
  mixins: [listPageMixin],
  data() {
    return {
      option: Option(),
      PLAN_STATUS,
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
    handleAdd() {
      this.$refs.dialogRef?.open(null);
    },
    handleEdit(row) {
      this.$refs.dialogRef?.open(row);
    },
    handleDialogSuccess() {
      this.onLoad(this.page);
    },
    async handleActivate(row) {
      await ElMessageBox.confirm(`确定使计划【${row.projectName} · ${row.version}】生效？生效后任务将写入项目任务列表，旧 active 计划会自动归档。`, '计划生效');
      await activate(row.id);
      ElMessage.success('计划已生效，任务已写入任务管理');
      this.onLoad(this.page);
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
    },
  },
};
</script>

<style scoped>
.table-toolbar {
  margin-bottom: 12px;
}
</style>
