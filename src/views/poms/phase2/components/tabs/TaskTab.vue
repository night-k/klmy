<template>
  <div class="task-tab">
    <div class="toolbar">
      <el-tabs v-model="statusFilter" @tab-change="load">
        <el-tab-pane label="全部" name="" />
        <el-tab-pane v-for="s in TASK_STATUS" :key="s.value" :label="s.label" :name="s.value" />
      </el-tabs>
      <el-button type="primary" :disabled="!selected.length" @click="dispatchVisible = true">批量派发</el-button>
    </div>
    <el-table :data="tasks" border @selection-change="selected = $event">
      <el-table-column type="selection" width="45" />
      <el-table-column prop="code" label="编号" width="180" />
      <el-table-column prop="taskName" label="任务名称" min-width="160" />
      <el-table-column prop="assigneeName" label="责任人" width="90" />
      <el-table-column label="计划起止" width="180">
        <template #default="{ row }">{{ row.planStartDate }} ~ {{ row.planEndDate }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="TASK_STATUS_TAG[row.status]">{{ labelOf(TASK_STATUS, row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === 'dispatched'" link type="primary" @click="doStart(row)">开始执行</el-button>
          <el-button v-if="row.status === 'in_progress'" link type="warning" @click="doSubmitReview(row)">提交审核</el-button>
        </template>
      </el-table-column>
    </el-table>
    <dispatch-dialog v-model="dispatchVisible" :tasks="selected.filter(t => t.status === 'pending_dispatch')" @success="load" />
  </div>
</template>

<script>
import { TASK_STATUS, TASK_STATUS_TAG, labelOf } from '../../option/dict';
import { getPage, start, submitReview } from '@/api/poms/phase2/task';
import DispatchDialog from './DispatchDialog.vue';

export default {
  components: { DispatchDialog },
  props: {
    projectId: { type: String, required: true },
    mode: { type: String, default: '' },
  },
  emits: ['changed'],
  data() {
    return {
      TASK_STATUS,
      TASK_STATUS_TAG,
      tasks: [],
      selected: [],
      statusFilter: '',
      dispatchVisible: false,
    };
  },
  watch: {
    projectId: {
      immediate: true,
      handler() {
        this.load();
      },
    },
    mode: {
      immediate: true,
      handler(v) {
        if (v === 'dispatch') this.statusFilter = 'pending_dispatch';
      },
    },
  },
  methods: {
    labelOf,
    load() {
      const params = { projectId: this.projectId };
      if (this.statusFilter) params.status = this.statusFilter;
      getPage(1, 100, params).then(res => {
        this.tasks = res.data.data.records;
      });
    },
    doStart(row) {
      start(row.id).then(() => {
        this.$message.success('任务已开始');
        this.load();
        this.$emit('changed');
      });
    },
    doSubmitReview(row) {
      submitReview(row.id).then(() => {
        this.$message.success('已提交审核');
        this.load();
        this.$emit('changed');
      });
    },
  },
};
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}
</style>
