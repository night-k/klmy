<template>
  <basic-container class="poms-demo-home">
    <el-card shadow="never" class="flow-card">
      <template #header>
        <div class="card-header">
          <div class="card-header-title">
            <span>销售主线业务流程</span>
            <span class="flow-hint">中标登记已合并至「招投标」页；立项在 Phase2 项目列表</span>
          </div>
          <div class="card-header-actions">
            <el-button type="success" plain size="small" @click="goProject">项目主线</el-button>
            <el-button type="warning" plain size="small" @click="goTalent">人才主线</el-button>
            <el-button type="warning" plain size="small" @click="handleReset">重置演示数据</el-button>
          </div>
        </div>
      </template>
      <el-steps :active="flowActive" align-center finish-status="success" class="flow-steps">
        <el-step v-for="step in flowSteps" :key="step.key" :title="step.title" :description="step.desc" @click="goStep(step)" />
      </el-steps>
    </el-card>

    <div class="stat-row">
      <el-card v-for="item in statCards" :key="item.key" shadow="hover" class="stat-card" @click="goLink(item)">
        <div class="stat-num">{{ stats[item.key] || 0 }}</div>
        <div class="stat-label">{{ item.label }}</div>
      </el-card>
    </div>

    <el-row :gutter="16">
      <el-col v-for="mod in modules" :key="mod.key" :span="8">
        <el-card shadow="hover" class="module-card" @click="goLink(mod)">
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
import { FLOW_STEPS, STAT_CARDS, MODULE_LINKS, buildStepRoute, resolveFlowActive } from './utils/salesFlow';

export default {
  data() {
    return {
      stats: {},
      flowSteps: FLOW_STEPS,
      statCards: STAT_CARDS,
      modules: MODULE_LINKS,
    };
  },
  computed: {
    flowActive() {
      return resolveFlowActive(this.stats);
    },
  },
  mounted() {
    this.refreshStats();
  },
  methods: {
    refreshStats() {
      this.stats = getStats();
    },
    goStep(step) {
      this.$router.push(buildStepRoute(step));
    },
    goLink(item) {
      this.$router.push(buildStepRoute(item));
    },
    goProject() {
      this.$router.push('/poms/phase2/index');
    },
    goTalent() {
      this.$router.push('/poms/phase4/index');
    },
    handleReset() {
      this.$confirm('确定重置为初始演示数据？', '提示', { type: 'warning' }).then(() => {
        resetDemoData();
        this.refreshStats();
        this.$message.success('演示数据已重置');
      });
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
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.card-header-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.flow-hint {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}

.card-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
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
  text-align: center;
  cursor: pointer;
  padding: 8px 0;
  min-width: 0;

  .stat-num {
    font-size: 28px;
    font-weight: 700;
    color: #1565c0;
  }

  .stat-label {
    margin-top: 4px;
    color: #666;
    font-size: 12px;
  }
}

.module-card {
  margin-bottom: 16px;
  cursor: pointer;
  min-height: 160px;

  .module-icon {
    width: 40px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    background: #e3f2fd;
    color: #1565c0;
    border-radius: 8px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 16px;
  }

  p {
    margin: 0 0 12px;
    color: #888;
    font-size: 13px;
    min-height: 40px;
  }
}
</style>
