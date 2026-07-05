<template>
  <basic-container class="poms-demo-home">
    <el-card shadow="never" class="flow-card">
      <template #header>
        <div class="card-header">
          <span>销售主线业务流程</span>
          <div class="card-header-actions">
            <el-button type="success" plain size="small" @click="goProject">项目主线</el-button>
            <el-button type="warning" plain size="small" @click="handleReset">重置演示数据</el-button>
          </div>
        </div>
      </template>
      <el-steps :active="6" align-center finish-status="success" class="flow-steps">
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
import { getStats, resetDemoData } from '@/api/poms/phase1/mockStore';

export default {
  data() {
    return {
      stats: {},
      flowSteps: [
        { title: '客户建档', desc: '主数据', path: '/poms/phase1/customer' },
        { title: '商机登记', desc: '销售线索', path: '/poms/phase1/opportunity' },
        { title: '招投标', desc: '投标跟踪', path: '/poms/phase1/tender' },
        { title: '中标管理', desc: '通知书归档', path: '/poms/phase1/winbid' },
        { title: '合同管理', desc: '签约执行', path: '/poms/phase1/contract' },
        { title: '项目立项', desc: '合同转化', path: '/poms/phase1/project-init' },
        { title: '回款管理', desc: '计划与实际', path: '/poms/phase1/payment' },
      ],
      statCards: [
        { key: 'customers', label: '客户', path: '/poms/phase1/customer' },
        { key: 'opportunities', label: '商机', path: '/poms/phase1/opportunity' },
        { key: 'tenders', label: '投标', path: '/poms/phase1/tender' },
        { key: 'winbids', label: '中标', path: '/poms/phase1/winbid' },
        { key: 'contracts', label: '合同', path: '/poms/phase1/contract' },
        { key: 'projects', label: '项目', path: '/poms/phase1/project-init' },
      ],
      modules: [
        { title: '客户管理', desc: '客户档案、联系人、历史关联', path: '/poms/phase1/customer', icon: '客' },
        { title: '商机管理', desc: '阶段推进、跟进记录、赢单分析', path: '/poms/phase1/opportunity', icon: '商' },
        { title: '招投标', desc: '招标文件、投标递交、开标结果', path: '/poms/phase1/tender', icon: '投' },
        { title: '中标管理', desc: '中标通知书、生成合同', path: '/poms/phase1/winbid', icon: '中' },
        { title: '合同管理', desc: '服务合同、付款计划、立项入口', path: '/poms/phase1/contract', icon: '合' },
        { title: '项目立项', desc: '合同驱动立项、联营/自营', path: '/poms/phase1/project-init', icon: '项' },
        { title: '回款管理', desc: '回款计划、实际登记、逾期预警', path: '/poms/phase1/payment', icon: '回' },
      ],
    };
  },
  mounted() {
    this.refreshStats();
  },
  methods: {
    refreshStats() {
      this.stats = getStats();
    },
    go(path) {
      if (path === '/poms/phase1/project-init') {
        this.goProject();
        return;
      }
      this.$router.push(path);
    },
    goProject() {
      this.$router.push('/poms/phase2/index');
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
}

.card-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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
  .stat-num {
    font-size: 28px;
    font-weight: 700;
    color: #1565c0;
  }
  .stat-label {
    margin-top: 4px;
    color: #666;
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
