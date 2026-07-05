<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑项目计划' : '新增项目计划'" width="960px" append-to-body destroy-on-close :close-on-click-modal="false" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="关联项目" prop="projectId">
            <el-select v-model="form.projectId" filterable style="width: 100%" :disabled="!!lockProjectId" @change="onProjectChange">
              <el-option v-for="p in projects" :key="p.id" :label="`${p.code} · ${p.projectName}`" :value="p.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="计划版本" prop="version">
            <el-input v-model="form.version" placeholder="如 v1.0" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="计划周期" prop="planRange">
            <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始" end-placeholder="结束" style="width: 100%" @change="onPlanRangeChange" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">阶段规划（任务日期不可超出所属阶段）</el-divider>
      <el-table :data="form.phases" border size="small">
        <el-table-column label="阶段名" min-width="120">
          <template #default="{ row }">
            <el-input v-model="row.name" placeholder="如 启动阶段" />
          </template>
        </el-table-column>
        <el-table-column label="开始" width="150">
          <template #default="{ row }">
            <el-date-picker
              v-model="row.startDate"
              type="date"
              size="small"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              :clearable="false"
              :disabled-date="d => isPhaseStartDisabled(d, row)"
              @change="onPhaseDateChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="结束" width="150">
          <template #default="{ row }">
            <el-date-picker
              v-model="row.endDate"
              type="date"
              size="small"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              :clearable="false"
              :disabled-date="d => isPhaseEndDisabled(d, row)"
              @change="onPhaseDateChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="交付物" min-width="140">
          <template #default="{ row }"><el-input v-model="row.deliverable" /></template>
        </el-table-column>
        <el-table-column label="工时小计" width="100" align="center">
          <template #default="{ row }">{{ phaseWorkload(row.id) }} 人·天</template>
        </el-table-column>
        <el-table-column width="60" align="center">
          <template #default="{ $index }">
            <el-button link type="danger" :disabled="form.phases.length <= 1" @click="removePhase($index)">删</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="summary-row">
        <el-button link type="primary" @click="addPhase">+ 添加阶段</el-button>
        <span class="summary-stats"
          >总工作量：<strong>{{ totalWorkload }}</strong> 人·天｜共 {{ form.tasks.length }} 个任务</span
        >
      </div>

      <el-divider content-position="left">任务分解</el-divider>
      <el-table :data="form.tasks" border size="small">
        <el-table-column label="任务名" min-width="130">
          <template #default="{ row }">
            <el-input v-model="row.name" placeholder="必填" />
          </template>
        </el-table-column>
        <el-table-column label="阶段" width="130">
          <template #default="{ row }">
            <el-select v-model="row.phaseId" style="width: 100%" @change="onTaskPhaseChange(row)">
              <el-option v-for="ph in form.phases" :key="ph.id" :label="ph.name" :value="ph.id" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="责任人" width="120">
          <template #default="{ row }">
            <el-select v-model="row.assigneeId" style="width: 100%" filterable @change="row.assigneeName = userMap[row.assigneeId]">
              <el-option v-for="u in MOCK_USERS" :key="u.id" :label="u.name" :value="u.id" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="开始" width="150">
          <template #default="{ row }">
            <el-date-picker v-model="row.planStartDate" type="date" size="small" value-format="YYYY-MM-DD" style="width: 100%" :clearable="false" :disabled-date="d => isTaskStartDisabled(d, row)" />
          </template>
        </el-table-column>
        <el-table-column label="结束" width="150">
          <template #default="{ row }">
            <el-date-picker v-model="row.planEndDate" type="date" size="small" value-format="YYYY-MM-DD" style="width: 100%" :clearable="false" :disabled-date="d => isTaskEndDisabled(d, row)" />
          </template>
        </el-table-column>
        <el-table-column label="工作量" width="90">
          <template #default="{ row }">
            <el-input-number v-model="row.workload" :min="0" :controls="false" size="small" style="width: 100%" />
          </template>
        </el-table-column>
        <el-table-column label="前置任务" width="140">
          <template #default="{ row }">
            <el-select v-model="row.preTaskId" clearable placeholder="无" style="width: 100%">
              <el-option v-for="t in otherTasks(row)" :key="t.id" :label="`${t.name}`" :value="t.id" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column width="60" align="center">
          <template #default="{ $index }">
            <el-button link type="danger" :disabled="form.tasks.length <= 1" @click="form.tasks.splice($index, 1)">删</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button link type="primary" style="margin-top: 8px" @click="addTask">+ 添加任务</el-button>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="save">保存草稿</el-button>
      <el-button v-if="form.id && form.status !== 'active'" type="success" :loading="activating" @click="saveAndActivate">计划生效</el-button>
      <el-button v-if="isEdit && form.status === 'active'" type="warning" plain :loading="activating" @click="saveAndActivate">修订并重新生效</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { getPage as getProjects } from '@/api/poms/phase2/projectAdapter';
import { add, update, activate } from '@/api/poms/phase2/plan';
import { MOCK_USERS } from '../../option/dict';

function newPhase(idx = 1) {
  return { id: `phase-new-${Date.now()}-${idx}`, name: `阶段${idx}`, startDate: '', endDate: '', deliverable: '' };
}

export default {
  name: 'PlanEditDialog',
  emits: ['success'],
  data() {
    return {
      MOCK_USERS,
      userMap: MOCK_USERS.reduce((m, u) => {
        m[u.id] = u.name;
        return m;
      }, {}),
      visible: false,
      saving: false,
      activating: false,
      isEdit: false,
      lockProjectId: '',
      projects: [],
      form: this.emptyForm(),
      dateRange: [],
      rules: {
        projectId: [{ required: true, message: '请选择关联项目', trigger: 'change' }],
        version: [{ required: true, message: '请输入计划版本', trigger: 'blur' }],
        planRange: [{ required: true, validator: this.validatePlanRange, trigger: 'change' }],
      },
    };
  },
  computed: {
    totalWorkload() {
      return this.form.tasks.reduce((s, t) => s + (Number(t.workload) || 0), 0);
    },
  },
  methods: {
    emptyForm() {
      const ph = newPhase(1);
      return {
        id: '',
        projectId: '',
        version: 'v1.0',
        planStartDate: '',
        planEndDate: '',
        status: 'draft',
        phases: [ph],
        tasks: [{ id: `task-new-${Date.now()}-1`, name: '任务1', phaseId: ph.id, assigneeId: '', assigneeName: '', planStartDate: '', planEndDate: '', workload: 5, preTaskId: '' }],
      };
    },
    validatePlanRange(_rule, _value, cb) {
      if (!this.dateRange || this.dateRange.length !== 2 || !this.dateRange[0] || !this.dateRange[1]) {
        return cb(new Error('请选择计划周期'));
      }
      cb();
    },
    open(row, projectId = '') {
      this.loadProjects();
      this.lockProjectId = projectId || '';
      if (row) {
        this.isEdit = true;
        this.form = {
          ...row,
          phases: (row.phases || []).map(p => ({ ...p })),
          tasks: (row.tasks || []).map(t => ({
            ...t,
            // 兼容旧的 preTask(任务名)→preTaskId
            preTaskId: t.preTaskId || this.resolvePreTaskByName(row.tasks, t.preTask) || '',
          })),
        };
        this.dateRange = row.planStartDate && row.planEndDate ? [row.planStartDate, row.planEndDate] : [];
      } else {
        this.isEdit = false;
        this.form = this.emptyForm();
        if (projectId) this.form.projectId = projectId;
        this.dateRange = [];
      }
      this.visible = true;
    },
    resolvePreTaskByName(tasks, name) {
      const t = (tasks || []).find(x => x.name === name);
      return t?.id || '';
    },
    loadProjects() {
      getProjects(1, 100, {}).then(res => {
        this.projects = res.data.data.records || [];
      });
    },
    onProjectChange() {
      /* 预留校验位 */
    },
    onPlanRangeChange(val) {
      const [start, end] = val || [];
      // 自动把首个阶段对齐计划周期
      if (start && end && this.form.phases.length === 1) {
        this.form.phases[0].startDate = start;
        this.form.phases[0].endDate = end;
      }
    },
    isPhaseStartDisabled(date) {
      if (!this.dateRange || !this.dateRange.length) return false;
      const [start, end] = this.dateRange;
      const d = this.fmt(date);
      if (d < start) return true;
      if (d > end) return true;
      return false;
    },
    isPhaseEndDisabled(date) {
      if (!this.dateRange || !this.dateRange.length) return false;
      const [start, end] = this.dateRange;
      const d = this.fmt(date);
      if (d < start) return true;
      if (d > end) return true;
      return false;
    },
    onPhaseDateChange(row) {
      if (row.startDate && row.endDate && row.startDate > row.endDate) {
        this.$message.warning('阶段开始不能晚于结束，已自动调整');
        row.endDate = row.startDate;
      }
      // 把该阶段下任务的日期规整到阶段范围内
      this.form.tasks.forEach(t => {
        if (t.phaseId === row.id) this.onTaskPhaseChange(t, row);
      });
    },
    isTaskStartDisabled() {
      return false; // 在 onTaskPhaseChange 里做软校验
    },
    isTaskEndDisabled() {
      return false;
    },
    onTaskPhaseChange(task, phaseOverride) {
      const phase = phaseOverride || this.form.phases.find(p => p.id === task.phaseId);
      if (!phase) return;
      // 任务日期超出阶段 → 自动夹紧
      if (phase.startDate && task.planStartDate && task.planStartDate < phase.startDate) {
        task.planStartDate = phase.startDate;
        this.$message.warning(`「${task.name}」开始早于阶段，已自动夹紧`);
      }
      if (phase.endDate && task.planEndDate && task.planEndDate > phase.endDate) {
        task.planEndDate = phase.endDate;
        this.$message.warning(`「${task.name}」结束晚于阶段，已自动夹紧`);
      }
      // 任务默认占阶段范围
      if (!task.planStartDate && phase.startDate) task.planStartDate = phase.startDate;
      if (!task.planEndDate && phase.endDate) task.planEndDate = phase.endDate;
    },
    otherTasks(current) {
      return this.form.tasks.filter(t => t.id !== current.id && t.name);
    },
    phaseWorkload(phaseId) {
      return this.form.tasks.filter(t => t.phaseId === phaseId).reduce((s, t) => s + (Number(t.workload) || 0), 0);
    },
    fmt(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    },
    addPhase() {
      const [planStart, planEnd] = this.dateRange || [];
      const idx = this.form.phases.length + 1;
      this.form.phases.push({
        id: `phase-new-${Date.now()}-${idx}`,
        name: `阶段${idx}`,
        startDate: planStart || '',
        endDate: planEnd || '',
        deliverable: '',
      });
    },
    addTask() {
      const phase = this.form.phases[0];
      this.form.tasks.push({
        id: `task-new-${Date.now()}-${this.form.tasks.length + 1}`,
        name: '',
        phaseId: phase.id,
        assigneeId: '',
        assigneeName: '',
        planStartDate: phase.startDate || '',
        planEndDate: phase.endDate || '',
        workload: 5,
        preTaskId: '',
      });
    },
    removePhase(idx) {
      const phase = this.form.phases[idx];
      const hasTasks = this.form.tasks.some(t => t.phaseId === phase.id);
      if (hasTasks) {
        this.$message.warning('该阶段下仍有任务，请先迁移或删除任务');
        return;
      }
      this.form.phases.splice(idx, 1);
    },
    buildPayload() {
      const [planStartDate = '', planEndDate = ''] = this.dateRange || [];
      // 任务名去重、空名过滤
      const seenNames = new Set();
      const tasks = [];
      for (const t of this.form.tasks) {
        if (!t.name || !t.name.trim()) continue;
        if (seenNames.has(t.name.trim())) {
          this.$message.warning(`任务名「${t.name}」重复，已自动忽略`);
          continue;
        }
        seenNames.add(t.name.trim());
        // 校验任务日期在阶段内
        const phase = this.form.phases.find(p => p.id === t.phaseId);
        if (phase) {
          if (phase.startDate && t.planStartDate < phase.startDate) t.planStartDate = phase.startDate;
          if (phase.endDate && t.planEndDate > phase.endDate) t.planEndDate = phase.endDate;
          if (t.planStartDate && t.planEndDate && t.planStartDate > t.planEndDate) {
            this.$message.error(`任务「${t.name}」开始晚于结束`);
            throw new Error('task_date_invalid');
          }
        }
        // 同步 preTask(任务名) 字段，保持向下兼容
        const preTaskObj = this.form.tasks.find(x => x.id === t.preTaskId);
        tasks.push({ ...t, name: t.name.trim(), preTask: preTaskObj?.name || '', assigneeName: this.userMap[t.assigneeId] || t.assigneeName || '' });
      }
      return { ...this.form, planStartDate, planEndDate, status: this.form.status === 'active' ? 'active' : 'draft', tasks };
    },
    save() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return;
        let payload;
        try {
          payload = this.buildPayload();
        } catch (e) {
          return;
        }
        this.saving = true;
        const req = this.form.id ? update({ ...payload, id: this.form.id }) : add(payload);
        req
          .then(res => {
            this.form.id = res.data.data.id;
            this.$message.success('计划已保存');
            this.$emit('success');
          })
          .finally(() => {
            this.saving = false;
          });
      });
    },
    saveAndActivate() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return;
        let payload;
        try {
          payload = this.buildPayload();
        } catch (e) {
          return;
        }
        this.activating = true;
        const saveReq = this.form.id
          ? update({ ...payload, id: this.form.id })
          : add(payload).then(res => {
              this.form.id = res.data.data.id;
            });
        saveReq
          .then(() => activate(this.form.id))
          .then(() => {
            this.$message.success('计划已生效，任务已写入任务管理（旧 active 计划已自动归档）');
            this.visible = false;
            this.$emit('success');
          })
          .finally(() => {
            this.activating = false;
          });
      });
    },
    handleClosed() {
      this.form = this.emptyForm();
      this.dateRange = [];
    },
  },
};
</script>

<style scoped>
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.summary-stats {
  font-size: 13px;
  color: #606266;
}
.summary-stats strong {
  color: #e6a23c;
  font-weight: 600;
}
</style>
