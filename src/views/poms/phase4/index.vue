<template>
  <basic-container class="poms-demo-home">
    <el-card shadow="never" class="flow-card">
      <template #header>
        <div class="card-header">
          <span>人才主线业务流程（招聘 → 投标）</span>
          <div class="card-header-actions">
            <el-button type="success" plain size="small" @click="go('/poms/phase1/tender')">销售招投标</el-button>
            <el-button type="warning" plain size="small" @click="handleReset">重置演示数据</el-button>
          </div>
        </div>
      </template>
      <el-steps :active="flowActive" align-center finish-status="success" class="flow-steps">
        <el-step v-for="step in flowSteps" :key="step.path" :title="step.title" :description="step.desc" @click="go(step.path)" />
      </el-steps>
    </el-card>

    <el-row :gutter="16" class="stat-row">
      <el-col v-for="item in statCards" :key="item.key" :span="4">
        <el-card shadow="hover" class="stat-card" @click="go(item.path)">
          <div class="stat-num">{{ stats[item.key] || 0 }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </el-card>
      </el-col>
    </el-row>

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
import { getStats, resetDemoData } from '@/api/poms/phase4/phase4Store';

export default {
  data() {
    return {
      stats: {},
      flowSteps: [
        { title: '候选人池', desc: '招聘入库', path: '/poms/phase4/candidate' },
        { title: '人才档案', desc: '录用转档', path: '/poms/phase4/talent' },
        { title: '简历生成', desc: '投标素材', path: '/poms/phase4/resume' },
        { title: '投标包', desc: '组包投标', path: '/poms/phase4/bid' },
        { title: '模板管理', desc: '简历/投标模板', path: '/poms/phase4/template' },
        { title: '销售招投标', desc: 'Phase1', path: '/poms/phase1/tender' },
      ],
      statCards: [
        { key: 'emails', label: '招聘邮件', path: '/poms/phase4/candidate' },
        { key: 'candidates', label: '候选人', path: '/poms/phase4/candidate' },
        { key: 'hired', label: '人才档案', path: '/poms/phase4/talent' },
        { key: 'resumes', label: '简历', path: '/poms/phase4/resume' },
        { key: 'bidPackages', label: '投标包', path: '/poms/phase4/bid' },
        { key: 'readyPackages', label: '可投标', path: '/poms/phase4/bid' },
        { key: 'templates', label: '模板', path: '/poms/phase4/template' },
      ],
      modules: [
        { title: '候选人池', desc: '招聘邮箱、面试推进、录用转档', path: '/poms/phase4/candidate', icon: '候' },
        { title: '人才档案', desc: '技能、证书、项目经历沉淀', path: '/poms/phase4/talent', icon: '才' },
        { title: '简历生成', desc: '按模板生成投标可用简历', path: '/poms/phase4/resume', icon: '简' },
        { title: '投标包', desc: '组装人选与简历形成投标包', path: '/poms/phase4/bid', icon: '投' },
        { title: '模板管理', desc: '维护简历模板与投标书模板', path: '/poms/phase4/template', icon: '模' },
      ],
    };
  },
  computed: {
    flowActive() {
      if (this.stats.readyPackages > 0) return 4;
      if (this.stats.resumes > 0) return 3;
      if (this.stats.hired > 0) return 2;
      return 1;
    },
  },
  mounted() {
    this.refreshStats();
  },
  activated() {
    this.refreshStats();
  },
  methods: {
    refreshStats() {
      this.stats = getStats();
    },
    go(path) {
      this.$router.push(path);
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
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.card-header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.flow-steps {
  cursor: pointer;
  :deep(.el-step__title) {
    font-size: 13px;
  }
}
.stat-row {
  margin-bottom: 16px;
}
.stat-card {
  text-align: center;
  cursor: pointer;
  margin-bottom: 16px;
  .stat-num {
    font-size: 28px;
    font-weight: 700;
    color: #2c7be5;
  }
  .stat-label {
    margin-top: 4px;
    color: #6b7280;
    font-size: 13px;
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
    background: #ecf5ff;
    color: #409eff;
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
