<template>
  <basic-container class="poms-demo-home">
    <el-card shadow="never" class="flow-card">
      <template #header>
        <div class="card-header">
          <span class="page-title">POMS 石油服务运营管理系统 · 主线流程总览</span>
          <div class="header-actions">
            <el-button type="success" plain @click="goProject">进入项目主线</el-button>
            <el-button type="primary" @click="goKnowledge">进入知识主线</el-button>
          </div>
        </div>
      </template>
      <p class="page-desc">销售 → 项目 → 成果质量 → 知识沉淀 → 人才投标，五条主线入口如下。</p>
      <el-steps :active="4" align-center finish-status="success" class="flow-steps">
        <el-step v-for="step in flowSteps" :key="step.key" :title="step.title" :description="step.desc" @click="go(step.path)" />
      </el-steps>
    </el-card>

    <el-row :gutter="16">
      <el-col v-for="mod in modules" :key="mod.path" :span="8">
        <el-card shadow="hover" class="module-card" @click="go(mod.path)">
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
export default {
  name: 'PomsOverview',
  data() {
    return {
      flowSteps: [
        { key: 'phase1', title: '销售主线', desc: '商机→合同', path: '/poms/phase1/index' },
        { key: 'phase2', title: '项目主线', desc: '立项→验收', path: '/poms/phase2/index' },
        { key: 'phase3', title: '知识主线', desc: '归档→检索', path: '/poms/phase3/index' },
        { key: 'phase4', title: '人才主线', desc: '招聘→投标', path: '/poms/phase4/index' },
        { key: 'system', title: '返回系统', desc: '工作台', path: '/wel/index' },
      ],
      modules: [
        { title: '销售主线 Phase1', desc: '客户 → 商机 → 投标 → 合同 → 回款', path: '/poms/phase1/index', icon: '销' },
        { title: '项目主线 Phase2', desc: '立项 → 开题 → 计划 → 任务 → 验收', path: '/poms/phase2/index', icon: '项' },
        { title: '知识主线 Phase3', desc: '成果归档 → 文档中心 → 标签 → 检索复用', path: '/poms/phase3/index', icon: '知' },
        { title: '人才主线 Phase4', desc: '候选人 → 档案 → 简历 → 投标包', path: '/poms/phase4/index', icon: '才' },
      ],
    };
  },
  methods: {
    go(path) {
      this.$router.push(path);
    },
    goProject() {
      this.$router.push('/poms/phase2/index');
    },
    goKnowledge() {
      this.$router.push('/poms/phase3/index');
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
.page-title {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}
.page-desc {
  margin: 0 0 16px;
  color: #606266;
  font-size: 14px;
}
.header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.flow-steps {
  cursor: pointer;
  :deep(.el-step__title) {
    font-size: 13px;
  }
  :deep(.el-step__description) {
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
    border-radius: 8px;
    background: #ecf5ff;
    color: #409eff;
    display: flex;
    align-items: center;
    justify-content: center;
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
