<template>
  <basic-container class="poms-demo-home">
    <el-card shadow="never" class="flow-card">
      <template #header>
        <div class="card-header">
          <span>知识主线业务流程（11.3 成果 → 知识沉淀）</span>
          <div class="header-actions">
            <el-button type="warning" plain size="small" @click="handleReset">重置演示数据</el-button>
          </div>
        </div>
      </template>
      <el-steps :active="flowActive" align-center finish-status="success" class="flow-steps">
        <el-step v-for="step in flowSteps" :key="step.key" :title="step.title" :description="step.desc" @click="goStep(step)" />
      </el-steps>
    </el-card>

    <el-row :gutter="16" class="stat-row">
      <el-col v-for="item in statCards" :key="item.key" :span="4">
        <el-card shadow="hover" class="stat-card" @click="go(item.path, item.query)">
          <div class="stat-num">{{ stats[item.key] || 0 }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col v-for="mod in modules" :key="mod.path" :span="8">
        <el-card shadow="hover" class="module-card" @click="go(mod.path, mod.query)">
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
import { getPhase3Stats, resetPhase3DemoData, ensurePhase3, syncApprovedDeliverables } from '@/api/poms/phase3/phase3Store';
import { KNOWLEDGE_FLOW_STEPS } from './utils/knowledgeFlow';

export default {
  data() {
    return {
      stats: {},
      flowSteps: KNOWLEDGE_FLOW_STEPS,
      flowActive: 3,
      statCards: [
        { key: 'documents', label: '文档总数', path: '/poms/phase3/document' },
        { key: 'autoArchived', label: '自动归档', path: '/poms/phase3/document', query: { sourceType: 'auto' } },
        { key: 'manualUploaded', label: '手工上传', path: '/poms/phase3/document', query: { sourceType: 'manual' } },
        { key: 'tags', label: '标签', path: '/poms/phase3/tag' },
        { key: 'deliverableDocs', label: '成果物文档', path: '/poms/phase3/document', query: { docType: 'deliverable' } },
        { key: 'publicDocs', label: '公开文档', path: '/poms/phase3/document' },
      ],
      modules: [
        { title: '文档中心', desc: '业务关联归档、版本、权限、预览', path: '/poms/phase3/document', icon: '文' },
        { title: '标签管理', desc: '系统标签自动打标 + 自定义标签', path: '/poms/phase3/tag', icon: '签' },
        { title: '全文搜索', desc: '关键字检索、命中片段、标签组合', path: '/poms/phase3/search', icon: '搜' },
        { title: '成果审核', desc: 'Phase2 审核通过后自动归档', path: '/poms/phase2/task', icon: '审', query: { status: 'pending_review' } },
        { title: '项目任务', desc: '成果物上传入口', path: '/poms/phase2/task', icon: '任', query: { status: 'in_progress' } },
        { title: '销售/项目主线', desc: '返回 Phase1/2 演示', path: '/poms/phase2/index', icon: '返' },
      ],
    };
  },
  mounted() {
    this.initDemo();
  },
  activated() {
    this.initDemo();
  },
  methods: {
    initDemo() {
      ensurePhase3();
      syncApprovedDeliverables();
      this.refreshStats();
    },
    refreshStats() {
      this.stats = getPhase3Stats();
    },
    go(path, query = {}) {
      this.$router.push({ path, query });
    },
    goStep(step) {
      this.$router.push({ path: step.path, query: step.query || {} });
    },
    handleReset() {
      this.$confirm('确定重置 Phase3 知识演示数据？（不影响 Phase1/2）', '提示', { type: 'warning' }).then(() => {
        resetPhase3DemoData();
        syncApprovedDeliverables();
        this.initDemo();
        this.$message.success('知识演示数据已重置');
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
.header-actions {
  display: flex;
  gap: 8px;
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
}
.stat-card {
  cursor: pointer;
  text-align: center;
  padding: 8px 0;
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
