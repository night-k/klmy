<template>
  <el-dialog v-model="visible" title="批量派发任务" width="900px" append-to-body destroy-on-close :close-on-click-modal="false">
    <el-alert v-if="!dispatchList.length" type="warning" show-icon :closable="false" title="请勾选左侧任务后再派发" />
    <el-row :gutter="16">
      <el-col :span="13">
        <div class="panel-title">
          待派发任务（已选 {{ dispatchList.length }} / {{ tasks.length }}）
          <span v-if="preTaskWarnings.length" class="warn-text">前置未完成 {{ preTaskWarnings.length }} 项</span>
        </div>
        <el-table :data="tasks" border size="small" max-height="380" @selection-change="innerSelected = $event">
          <el-table-column type="selection" width="45" :selectable="canSelect" />
          <el-table-column prop="taskName" label="任务名称" min-width="140" />
          <el-table-column prop="phaseName" label="阶段" width="100" />
          <el-table-column prop="planStartDate" label="计划开始" width="100" />
          <el-table-column prop="planEndDate" label="计划结束" width="100" />
        </el-table>
        <el-alert v-if="preTaskWarnings.length" type="warning" show-icon :closable="false" style="margin-top: 8px">
          <template #title> 前置任务未完成：{{ preTaskWarnings.map(w => `${w.taskName}（前置 ${w.preTaskName}）`).join('、') }} </template>
        </el-alert>
      </el-col>
      <el-col :span="11">
        <div class="panel-title">派发设置（按任务逐条指派）</div>
        <el-table :data="dispatchList" border size="small" max-height="380" class="dispatch-list">
          <el-table-column label="任务" min-width="120">
            <template #default="{ row }">
              <span class="dispatch-task-name">{{ row.taskName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="责任人" width="130">
            <template #default="{ row }">
              <el-select v-model="row.assigneeId" size="small" style="width: 100%" @change="onAssigneeChange(row, $event)">
                <el-option v-for="u in MOCK_USERS" :key="u.id" :label="u.name" :value="u.id" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="计划结束" width="135">
            <template #default="{ row }">
              <el-date-picker v-model="row.planEndDate" type="date" size="small" value-format="YYYY-MM-DD" style="width: 100%" :clearable="false" />
            </template>
          </el-table-column>
        </el-table>
        <div class="bulk-actions">
          <span class="bulk-label">批量设置：</span>
          <el-select v-model="bulkAssigneeId" placeholder="同一责任人" size="small" clearable style="width: 140px" @change="applyBulkAssignee">
            <el-option v-for="u in MOCK_USERS" :key="u.id" :label="u.name" :value="u.id" />
          </el-select>
        </div>
        <el-form :model="form" label-width="80px" size="small" style="margin-top: 12px">
          <el-form-item label="派发说明">
            <el-input v-model="form.note" type="textarea" :rows="2" placeholder="可选" />
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" :disabled="!canSubmit" @click="submit"> 确认派发（{{ dispatchList.length }}） </el-button>
    </template>
  </el-dialog>
</template>

<script>
import { MOCK_USERS } from '../../option/dict';
import { dispatch, checkPreTasks } from '@/api/poms/phase2/task';

export default {
  props: {
    modelValue: Boolean,
    tasks: { type: Array, default: () => [] },
  },
  emits: ['update:modelValue', 'success'],
  data() {
    return {
      MOCK_USERS,
      form: { note: '' },
      innerSelected: [],
      preTaskWarnings: [],
      bulkAssigneeId: '',
      submitting: false,
    };
  },
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(v) {
        this.$emit('update:modelValue', v);
      },
    },
    // 始终只取用户实际勾选的任务，杜绝"空选→全表派发"风险
    dispatchList() {
      return this.innerSelected;
    },
    canSubmit() {
      if (!this.dispatchList.length) return false;
      if (this.preTaskWarnings.length) return false;
      return this.dispatchList.every(t => t.assigneeId && t.planEndDate);
    },
  },
  watch: {
    visible(val) {
      if (val) {
        // 初始化：默认全选传入的可派发任务，并为每条预设责任人/工期
        this.innerSelected = this.tasks.map(t => ({
          taskId: t.id,
          taskName: t.taskName,
          assigneeId: t.assigneeId || '',
          assigneeName: t.assigneeName || '',
          planStartDate: t.planStartDate || '',
          planEndDate: t.planEndDate || '',
        }));
        this.form.note = '';
        this.bulkAssigneeId = '';
        this.validatePreTasks(this.dispatchList.map(t => t.taskId));
      }
    },
    innerSelected(list) {
      this.validatePreTasks((list || []).map(t => t.taskId));
    },
  },
  methods: {
    canSelect(row) {
      return row.status === 'pending_dispatch';
    },
    onAssigneeChange(row, id) {
      row.assigneeName = MOCK_USERS.find(u => u.id === id)?.name || '';
    },
    applyBulkAssignee(id) {
      if (!id) return;
      const name = MOCK_USERS.find(u => u.id === id)?.name || '';
      this.dispatchList.forEach(t => {
        t.assigneeId = id;
        t.assigneeName = name;
      });
    },
    validatePreTasks(ids) {
      if (!ids.length) {
        this.preTaskWarnings = [];
        return;
      }
      checkPreTasks(ids).then(res => {
        this.preTaskWarnings = res.data.data.blocked || [];
      });
    },
    submit() {
      if (!this.canSubmit) return;
      this.submitting = true;
      const items = this.dispatchList.map(t => ({
        taskId: t.taskId,
        assigneeId: t.assigneeId,
        assigneeName: t.assigneeName,
        planStartDate: t.planStartDate,
        planEndDate: t.planEndDate,
        note: this.form.note,
      }));
      dispatch(items)
        .then(() => {
          const names = [...new Set(items.map(i => i.assigneeName))].join('、');
          this.$message.success(`已派发 ${items.length} 项任务给 ${names}`);
          this.visible = false;
          this.$emit('success');
        })
        .catch(err => {
          this.$message.error(err?.message || '派发失败');
        })
        .finally(() => {
          this.submitting = false;
        });
    },
  },
};
</script>

<style scoped>
.panel-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.warn-text {
  color: #e6a23c;
  font-size: 12px;
  font-weight: normal;
}
.bulk-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.bulk-label {
  color: #606266;
  font-size: 13px;
}
.dispatch-task-name {
  font-size: 12px;
}
.dispatch-list :deep(.el-input__inner) {
  padding-left: 6px;
  padding-right: 6px;
}
</style>
