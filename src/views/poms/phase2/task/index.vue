<template>
  <basic-container>
    <el-tabs v-model="tabStatus" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane v-for="s in TASK_STATUS" :key="s.value" :label="s.label" :name="s.value" />
    </el-tabs>
    <avue-crud
      ref="crudLedger"
      v-model:page="page"
      v-model:search="search"
      :option="taskOption"
      :table-loading="loading"
      :data="data"
      class="work_order"
      @search-change="searchChange"
      @search-reset="searchReset"
      @current-change="currentChange"
      @size-change="sizeChange"
      @refresh-change="refreshChange"
      @on-load="onLoad"
      @selection-change="selected = $event"
    >
      <template #menu-left>
        <el-button type="primary" :disabled="!selected.length" @click="dispatchVisible = true">批量派发</el-button>
      </template>
      <template #code="{ row, size }">
        <el-link type="primary" :size="size" @click="openTaskDetail(row)">{{ row.code }}</el-link>
      </template>
      <template #status="{ row }">
        <el-tag size="small" :type="TASK_STATUS_TAG[row.status]">{{ labelOf(TASK_STATUS, row.status) }}</el-tag>
      </template>
      <template #planRange="{ row }">{{ row.planStartDate }} ~ {{ row.planEndDate }}</template>
      <template #deliverableCount="{ row }">{{ row.deliverableCount || 0 }}</template>
      <template #menu="{ row, size }">
        <el-button type="primary" link :size="size" @click="openTaskDetail(row)">查看</el-button>
        <el-button v-if="row.status === 'dispatched'" type="primary" link :size="size" @click="doStart(row)">开始执行</el-button>
        <el-button v-if="row.status === 'in_progress'" type="warning" link :size="size" @click="doSubmitReview(row)">提交审核</el-button>
        <el-button v-if="row.status === 'pending_review'" type="primary" link :size="size" @click="openTaskDetail(row, 'review')">审核处理</el-button>
        <el-button v-if="['in_progress', 'dispatched'].includes(row.status)" type="success" link :size="size" @click="openTaskDetail(row, 'deliverable')">上传成果物</el-button>
      </template>
    </avue-crud>
    <dispatch-dialog v-model="dispatchVisible" :tasks="selected.filter(t => t.status === 'pending_dispatch')" @success="onDispatchSuccess" />
    <task-detail-drawer v-model="taskDetailVisible" :task-id="taskDetailId" :initial-panel="taskDetailPanel" @changed="onTaskDetailChanged" @closed="onTaskDetailClosed" />
  </basic-container>
</template>

<script>
import { Option as TaskOption } from '../option/task';
import { TASK_STATUS, TASK_STATUS_TAG, labelOf } from '../option/dict';
import { getPage as getTaskPage, start, submitReview } from '@/api/poms/phase2/task';
import DispatchDialog from '../components/tabs/DispatchDialog.vue';
import TaskDetailDrawer from '../components/TaskDetailDrawer.vue';
import listPageMixin from '../utils/listPageMixin';

export default {
  components: { DispatchDialog, TaskDetailDrawer },
  mixins: [listPageMixin],
  data() {
    return {
      taskOption: TaskOption(),
      TASK_STATUS,
      TASK_STATUS_TAG,
      labelOf,
      selected: [],
      dispatchVisible: false,
      taskDetailVisible: false,
      taskDetailId: '',
      taskDetailPanel: '',
    };
  },
  watch: {
    '$route.query.status': {
      immediate: true,
      handler(status) {
        if (status !== undefined && String(status) !== this.tabStatus) {
          this.tabStatus = String(status);
          this.page.currentPage = 1;
          if (this.page) this.onLoad(this.page);
        }
      },
    },
  },
  mounted() {
    if (this.$route.query.status) {
      this.tabStatus = String(this.$route.query.status);
    }
    const taskId = this.$route.query.taskId;
    if (taskId) {
      this.taskDetailId = String(taskId);
      this.taskDetailVisible = true;
    }
  },
  methods: {
    onLoad(page) {
      this.loading = true;
      const params = { ...this.query };
      if (this.tabStatus) params.status = this.tabStatus;
      getTaskPage(page.currentPage, page.pageSize, params)
        .then(res => {
          const d = res.data.data;
          this.page.total = d.total;
          this.data = d.records;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    onTabChange(status) {
      const query = { ...this.$route.query };
      if (status) query.status = status;
      else delete query.status;
      this.$router.replace({ query });
      this.page.currentPage = 1;
      this.onLoad(this.page);
    },
    doStart(row) {
      start(row.id).then(() => {
        this.$message.success('任务已开始');
        this.onLoad(this.page);
      });
    },
    doSubmitReview(row) {
      submitReview(row.id).then(() => {
        this.$message.success('已提交审核');
        this.onLoad(this.page);
      });
    },
    onDispatchSuccess() {
      this.selected = [];
      this.onLoad(this.page);
    },
    openTaskDetail(row, panel = '') {
      this.taskDetailId = row.id;
      this.taskDetailPanel = panel;
      this.taskDetailVisible = true;
    },
    onTaskDetailChanged() {
      this.onLoad(this.page);
    },
    onTaskDetailClosed() {
      this.taskDetailId = '';
      this.taskDetailPanel = '';
    },
  },
};
</script>
