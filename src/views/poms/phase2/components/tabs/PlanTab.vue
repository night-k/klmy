<template>
  <div class="plan-tab">
    <div class="plan-tab-toolbar">
      <el-button type="primary" :disabled="!canEdit" @click="startEdit(null)">新增计划</el-button>
      <el-button @click="goGantt">查看甘特图</el-button>
      <el-button link type="primary" @click="goPlanPage">管理全部计划 →</el-button>
    </div>

    <el-table v-loading="loading" :data="plans" border size="small" style="margin-top: 12px">
      <el-table-column prop="version" label="版本" width="90">
        <template #default="{ row }">
          <el-link type="primary" @click="openView(row)">{{ row.version }}</el-link>
        </template>
      </el-table-column>
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
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openView(row)">查看</el-button>
          <el-button link type="primary" @click="startEdit(row)">编辑</el-button>
          <el-button v-if="row.status !== 'active'" link type="success" @click="activate(row)">生效</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && !plans.length" description="开题报告通过后可制定项目计划" />

    <plan-edit-drawer ref="editRef" @success="onEditSuccess" />
    <plan-view-drawer v-model="viewVisible" :detail="viewDetail" @edit="editFromView" @activate="activate" @closed="viewDetail = null" />
  </div>
</template>

<script>
import PlanEditDrawer from '../../plan/components/plan-edit-dialog.vue';
import PlanViewDrawer from '../PlanViewDrawer.vue';
import { getPage, getDetail, activate } from '@/api/poms/phase2/plan';

export default {
  components: { PlanEditDrawer, PlanViewDrawer },
  props: {
    projectId: { type: String, required: true },
    canEdit: { type: Boolean, default: false },
  },
  emits: ['changed'],
  data() {
    return {
      loading: false,
      plans: [],
      viewVisible: false,
      viewDetail: null,
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
    openView(row) {
      getDetail(row.id).then(res => {
        this.viewDetail = { ...res.data.data };
        this.viewVisible = true;
      });
    },
    startEdit(row) {
      if (row) {
        getDetail(row.id).then(res => {
          this.$refs.editRef?.open(res.data.data);
        });
      } else {
        this.$refs.editRef?.open(null, this.projectId);
      }
    },
    editFromView(detail) {
      this.viewVisible = false;
      this.startEdit(detail);
    },
    onEditSuccess() {
      this.load();
      this.$emit('changed');
    },
    activate(row) {
      activate(row.id).then(() => {
        this.$message.success('计划已生效，任务已写入任务管理，里程碑已同步');
        this.load();
        this.$emit('changed');
        if (this.viewVisible && this.viewDetail?.id === row.id) {
          getDetail(row.id).then(res => {
            this.viewDetail = { ...res.data.data };
          });
        }
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
