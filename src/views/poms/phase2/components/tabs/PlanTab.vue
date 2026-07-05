<template>
  <div class="plan-tab">
    <div class="plan-tab-toolbar">
      <el-button type="primary" :disabled="!canEdit" @click="startEdit(null)">新增计划</el-button>
      <el-button @click="goGantt">查看甘特图</el-button>
      <el-button link type="primary" @click="goPlanPage">管理全部计划 →</el-button>
    </div>

    <el-table v-loading="loading" :data="plans" border size="small" style="margin-top: 12px">
      <el-table-column prop="version" label="版本" width="90" />
      <el-table-column label="计划周期" min-width="180">
        <template #default="{ row }">{{ row.planStartDate }} ~ {{ row.planEndDate }}</template>
      </el-table-column>
      <el-table-column label="任务数" width="80" align="center">
        <template #default="{ row }">{{ (row.tasks || []).length }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'primary' : 'warning'" size="small">
            {{ row.status === 'active' ? '已生效' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="startEdit(row)">编辑</el-button>
          <el-button v-if="row.status !== 'active'" link type="success" @click="activate(row)">生效</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && !plans.length" description="开题报告通过后可制定项目计划" />

    <el-dialog v-model="dialogVisible" :title="editingPlan ? '编辑项目计划' : '新增项目计划'" width="920px" append-to-body destroy-on-close @closed="resetForm">
      <el-form :model="form" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="计划版本"><el-input v-model="form.version" /></el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="计划周期" required>
              <el-date-picker v-model="form.planStartDate" type="date" value-format="YYYY-MM-DD" placeholder="开始" style="width: 46%" />
              <span style="margin: 0 6px">~</span>
              <el-date-picker v-model="form.planEndDate" type="date" value-format="YYYY-MM-DD" placeholder="结束" style="width: 46%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">阶段规划</el-divider>
        <el-table :data="form.phases" border size="small">
          <el-table-column label="阶段名"
            ><template #default="{ row }"><el-input v-model="row.name" /></template
          ></el-table-column>
          <el-table-column label="开始" width="140"
            ><template #default="{ row }"><el-input v-model="row.startDate" placeholder="YYYY-MM-DD" /></template
          ></el-table-column>
          <el-table-column label="结束" width="140"
            ><template #default="{ row }"><el-input v-model="row.endDate" placeholder="YYYY-MM-DD" /></template
          ></el-table-column>
          <el-table-column label="交付物"
            ><template #default="{ row }"><el-input v-model="row.deliverable" /></template
          ></el-table-column>
          <el-table-column width="60">
            <template #default="{ $index }"><el-button link type="danger" @click="form.phases.splice($index, 1)">删</el-button></template>
          </el-table-column>
        </el-table>
        <el-button link type="primary" style="margin: 8px 0" @click="addPhase">+ 添加阶段</el-button>
        <el-divider content-position="left">任务分解</el-divider>
        <el-table :data="form.tasks" border size="small">
          <el-table-column label="任务名"
            ><template #default="{ row }"><el-input v-model="row.name" /></template
          ></el-table-column>
          <el-table-column label="阶段" width="130">
            <template #default="{ row }">
              <el-select v-model="row.phaseId" style="width: 100%">
                <el-option v-for="ph in form.phases" :key="ph.id" :label="ph.name" :value="ph.id" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="责任人" width="100"
            ><template #default="{ row }"><el-input v-model="row.assigneeName" /></template
          ></el-table-column>
          <el-table-column label="起止" min-width="200">
            <template #default="{ row }">
              <el-input v-model="row.planStartDate" placeholder="开始" style="width: 46%" />
              <el-input v-model="row.planEndDate" placeholder="结束" style="width: 46%; margin-left: 4%" />
            </template>
          </el-table-column>
          <el-table-column width="60">
            <template #default="{ $index }"><el-button link type="danger" @click="form.tasks.splice($index, 1)">删</el-button></template>
          </el-table-column>
        </el-table>
        <el-button link type="primary" style="margin-top: 8px" @click="addTask">+ 添加任务</el-button>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存草稿</el-button>
        <el-button v-if="editingPlan && editingPlan.status !== 'active'" type="success" @click="saveAndActivate">计划生效</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getPage, add, update, activate } from '@/api/poms/phase2/plan';

function newPhase(idx = 1) {
  return { id: `phase-new-${Date.now()}-${idx}`, name: `阶段${idx}`, startDate: '', endDate: '', deliverable: '' };
}

export default {
  props: {
    projectId: { type: String, required: true },
    canEdit: { type: Boolean, default: false },
  },
  emits: ['changed'],
  data() {
    return {
      loading: false,
      plans: [],
      dialogVisible: false,
      editingPlan: null,
      form: this.emptyForm(),
    };
  },
  watch: {
    projectId: {
      immediate: true,
      handler() {
        this.load();
      },
    },
  },
  methods: {
    emptyForm() {
      const ph = newPhase(1);
      return {
        version: 'v1.0',
        planStartDate: '',
        planEndDate: '',
        phases: [ph],
        tasks: [{ name: '任务1', phaseId: ph.id, assigneeName: '', planStartDate: '', planEndDate: '', workload: 5, preTask: '' }],
      };
    },
    load() {
      this.loading = true;
      getPage(1, 100, { projectId: this.projectId })
        .then(res => {
          this.plans = res.data.data.records || [];
        })
        .finally(() => {
          this.loading = false;
        });
    },
    startEdit(row) {
      this.editingPlan = row;
      if (row) {
        this.form = {
          version: row.version,
          planStartDate: row.planStartDate,
          planEndDate: row.planEndDate,
          phases: [...(row.phases || [])],
          tasks: [...(row.tasks || [])],
        };
      } else {
        this.form = this.emptyForm();
      }
      this.dialogVisible = true;
    },
    resetForm() {
      this.editingPlan = null;
      this.form = this.emptyForm();
    },
    addPhase() {
      this.form.phases.push(newPhase(this.form.phases.length + 1));
    },
    addTask() {
      const ph = this.form.phases[0];
      this.form.tasks.push({
        name: `任务${this.form.tasks.length + 1}`,
        phaseId: ph?.id || '',
        assigneeName: '',
        planStartDate: '',
        planEndDate: '',
        workload: 5,
        preTask: '',
      });
    },
    save() {
      const payload = { ...this.form, projectId: this.projectId, status: 'draft' };
      const req = this.editingPlan ? update({ ...payload, id: this.editingPlan.id }) : add(payload);
      req.then(res => {
        this.editingPlan = res.data.data;
        this.$message.success('计划已保存');
        this.dialogVisible = false;
        this.load();
        this.$emit('changed');
      });
    },
    saveAndActivate() {
      const payload = { ...this.form, projectId: this.projectId, status: 'draft' };
      update({ ...payload, id: this.editingPlan.id })
        .then(() => {
          return activate(this.editingPlan.id);
        })
        .then(() => {
          this.$message.success('计划已生效，任务已写入任务管理');
          this.dialogVisible = false;
          this.load();
          this.$emit('changed');
        });
    },
    activate(row) {
      activate(row.id).then(() => {
        this.$message.success('计划已生效，任务已写入任务管理');
        this.load();
        this.$emit('changed');
      });
    },
    goGantt() {
      this.$router.push({ path: '/poms/phase2/gantt', query: { projectId: this.projectId } });
    },
    goPlanPage() {
      this.$router.push({ path: '/poms/phase2/plan', query: { projectId: this.projectId } });
    },
  },
};
</script>

<style scoped>
.plan-tab-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
</style>
