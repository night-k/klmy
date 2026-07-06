<template>
  <basic-container class="poms-demo-home">
    <el-card shadow="never" class="flow-card">
      <template #header>
        <div class="card-header">
          <span>项目主线业务流程（11.2 立项 → 验收）</span>
          <div class="header-actions">
            <span v-if="isDemoEnv" class="demo-label">当前项目</span>
            <el-select v-if="isDemoEnv" v-model="demoProjectId" filterable style="width: 260px" @change="onDemoProjectChange">
              <el-option v-for="p in projects" :key="p.id" :label="`${p.code} · ${p.projectName}`" :value="String(p.id)" />
            </el-select>
            <el-button v-if="isDemoEnv" type="warning" plain size="small" @click="handleReset">重置数据</el-button>
          </div>
        </div>
      </template>
      <el-steps :active="flowActive" align-center finish-status="success" class="flow-steps">
        <el-step v-for="step in flowSteps" :key="step.key" :title="step.title" :description="step.desc" @click="goStep(step)" />
      </el-steps>
    </el-card>

    <div class="stat-row">
      <el-card v-for="item in statCards" :key="item.key" shadow="hover" class="stat-card" @click="go(item.path, item.flowKey)">
        <div class="stat-num">{{ stats[item.key] || 0 }}</div>
        <div class="stat-label">{{ item.label }}</div>
      </el-card>
    </div>

    <el-row :gutter="16">
      <el-col v-for="mod in modules" :key="mod.key" :span="8">
        <el-card shadow="hover" class="module-card" @click="go(mod.path, mod.key)">
          <div class="module-icon">{{ mod.icon }}</div>
          <h3>{{ mod.title }}</h3>
          <p>{{ mod.desc }}</p>
          <el-button type="primary" link>进入模块 →</el-button>
        </el-card>
      </el-col>
    </el-row>
  </basic-container>
</template>

<script>
import { getStats, resetDemoData } from '@/api/poms/phase1/mockStore';
import { getPhase2Stats, ensurePhase2, resetPhase2DemoData } from '@/api/poms/phase2/phase2Store';
import { getPage, getDetail } from '@/api/poms/phase2/projectAdapter';
import { FLOW_STEPS, MODULE_LINKS, buildStepRoute, resolveFlowIndex } from './utils/projectFlow';
import { isDemoEnv } from './utils/demoEnv';

export default {
  data() {
    return {
      isDemoEnv,
      stats: {},
      projects: [],
      demoProjectId: '',
      demoProjectDetail: null,
      flowSteps: FLOW_STEPS,
    };
  },
  computed: {
    flowActive() {
      return resolveFlowIndex(this.demoProjectDetail);
    },
    statCards() {
      return [
        { key: 'projects', label: '项目', path: '/poms/phase2/projectList', flowKey: 'init' },
        { key: 'proposals', label: '开题报告', path: '/poms/phase2/proposal', flowKey: 'proposal' },
        { key: 'plans', label: '项目计划', path: '/poms/phase2/plan', flowKey: 'plan' },
        { key: 'tasks', label: '任务', path: '/poms/phase2/task', flowKey: 'dispatch' },
        { key: 'pendingDispatch', label: '待派发', path: '/poms/phase2/task', flowKey: 'dispatch' },
        { key: 'gantt', label: '甘特图', path: '/poms/phase2/gantt', flowKey: 'gantt' },
        { key: 'deliverables', label: '成果物', path: '/poms/phase2/task', flowKey: 'deliverable' },
        { key: 'pendingReview', label: '待审核', path: '/poms/phase2/task', flowKey: 'review' },
        { key: 'acceptances', label: '验收', path: '/poms/phase2/projectSpace', flowKey: 'acceptance' },
      ];
    },
    modules() {
      return [
        { key: 'init', title: '项目列表', desc: '卡片/列表双视图，合同驱动立项', path: '/poms/phase2/projectList', icon: '项' },
        { key: 'attributes', title: '项目空间', desc: '属性补充、团队、里程碑概览', path: '/poms/phase2/projectSpace', icon: '空', query: { tab: 'basic' } },
        { key: 'team', title: '项目角色', desc: '项目经理、技术、质检与成员配置', path: '/poms/phase2/projectSpace', icon: '角', query: { tab: 'team' } },
        { key: 'milestone', title: '里程碑管理', desc: '关键里程碑、完成条件与阶段验收', path: '/poms/phase2/projectSpace', icon: '里', query: { tab: 'milestone' } },
        { key: 'acceptance', title: '项目验收', desc: '验收申请、意见、整改与最终归档', path: '/poms/phase2/projectSpace', icon: '验', query: { tab: 'acceptance' } },
        ...MODULE_LINKS,
        { key: 'expense', title: '项目费用', desc: '投标保证金、履约保证金、中标服务费', path: '/projectManage/projectList/projectExpense', icon: '费' },
        { key: 'risk', title: '风险管理', desc: '风险登记、等级、措施与跟踪', path: '/projectManage/risk/index', icon: '险' },
        { key: 'overdue', title: '逾期预警', desc: '超期任务识别、预警和处理记录', path: '/projectManage/projectOverdueAlert/index', icon: '预' },
        { key: 'quality', title: '质量统计', desc: '完成率、通过率、整改次数、验收通过率', path: '/projectManage/projectHealthMonitor/index', icon: '质' },
        { key: 'contract', title: '销售主线', desc: '返回销售管理', path: '/poms/phase1/index', icon: '销' },
      ];
    },
  },
  mounted() {
    this.refreshStats();
    this.loadProjects();
    // 从路由同步 demoProject（P2: demoProject 路由同步）
    if (this.$route.query.demoProjectId) {
      this.demoProjectId = String(this.$route.query.demoProjectId);
    }
  },
  methods: {
    refreshStats() {
      ensurePhase2();
      this.stats = { ...getStats(), ...getPhase2Stats() };
    },
    loadProjects() {
      getPage(1, 100, {}).then(res => {
        this.projects = res.data.data.records || [];
        // 默认选第一个或路由指定的项目；若旧值无效则回退
        if (!this.demoProjectId || !this.projects.find(p => String(p.id) === this.demoProjectId)) {
          this.demoProjectId = this.projects[0] ? String(this.projects[0].id) : '';
        }
        if (this.demoProjectId) this.loadDemoProject(this.demoProjectId);
      });
    },
    loadDemoProject(id) {
      if (!id) {
        this.demoProjectDetail = null;
        return;
      }
      getDetail(id).then(res => {
        this.demoProjectDetail = res.data.data || null;
      });
    },
    onDemoProjectChange(id) {
      // 同步到路由，避免切换后入口拿到旧值
      this.$router.replace({ query: { ...this.$route.query, demoProjectId: id } }).catch(() => {});
      this.loadDemoProject(id);
    },
    goStep(step) {
      if (step.key === 'contract') {
        this.$router.push({ path: step.path });
        return;
      }
      const route = buildStepRoute(step, step.needsProject === false ? '' : this.demoProjectId);
      this.$router.push(route);
    },
    go(path, flowKey) {
      const step = flowKey ? FLOW_STEPS.find(s => s.key === flowKey) : null;
      if (step) {
        this.goStep(step);
        return;
      }
      const mod = this.modules.find(m => m.path === path);
      const isPomsPhase2 = path.startsWith('/poms/phase2');
      const route = buildStepRoute({ path, query: mod?.query, needsProject: isPomsPhase2 }, this.demoProjectId);
      this.$router.push(route);
    },
    handleReset() {
      this.$confirm('此操作将清空所有演示数据（项目/任务/成果物等），是否继续？', '高危操作', {
        type: 'warning',
        confirmButtonText: '我已确认，重置',
        confirmButtonClass: 'el-button--danger',
      })
        .then(() => this.$prompt('请输入 RESET 以确认', '二次确认', { inputPattern: /^RESET$/ }))
        .then(({ value }) => {
          if (value !== 'RESET') return;
          resetDemoData();
          resetPhase2DemoData();
          this.refreshStats();
          this.loadProjects();
          this.$message.success('演示数据已重置');
        })
        .catch(() => {});
    },
  },
};
</script>

<style scoped lang="scss">
.flow-card {
  margin-bottom: 16px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.demo-label {
  font-size: 13px;
  color: #606266;
}
.flow-steps {
  cursor: pointer;
  :deep(.el-step__title) {
    font-size: 12px;
  }
  :deep(.el-step__description) {
    font-size: 11px;
  }
}
.stat-row {
  margin-bottom: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(128px, 1fr));
  gap: 16px;
}
.stat-card {
  cursor: pointer;
  text-align: center;
  padding: 8px 0;
  min-width: 0;
}
.stat-num {
  font-size: 28px;
  font-weight: 700;
  color: #409eff;
}
.stat-label {
  color: #909399;
  margin-top: 4px;
  font-size: 12px;
}
.module-card {
  cursor: pointer;
  margin-bottom: 16px;
  min-height: 160px;
}
.module-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #ecf5ff;
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-bottom: 8px;
}
</style>
