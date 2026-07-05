<template>
  <div class="poms-demo-layout">
    <header class="poms-demo-header">
      <div class="poms-demo-header__brand" @click="goFlowOverview">POMS 演示原型</div>
      <nav class="poms-demo-header__nav">
        <router-link to="/poms/phase1/index" class="nav-link" active-class="is-active">销售主线</router-link>
        <router-link to="/poms/phase2/index" class="nav-link" active-class="is-active">项目主线</router-link>
        <router-link to="/poms/phase3/index" class="nav-link" active-class="is-active">知识主线</router-link>

        <template v-if="isPhase2">
          <span class="nav-divider" />
          <router-link to="/poms/phase2/projectList" class="nav-link" active-class="is-active">项目列表</router-link>
          <router-link to="/poms/phase2/projectSpace" class="nav-link" active-class="is-active">项目空间</router-link>
          <router-link to="/poms/phase2/proposal" class="nav-link" active-class="is-active">开题报告</router-link>
          <router-link to="/poms/phase2/plan" class="nav-link" active-class="is-active">项目计划</router-link>
          <router-link to="/poms/phase2/gantt" class="nav-link" active-class="is-active">甘特图</router-link>
          <router-link to="/poms/phase2/task" class="nav-link" active-class="is-active">项目任务</router-link>
        </template>

        <template v-if="isPhase3">
          <span class="nav-divider" />
          <router-link to="/poms/phase3/document" class="nav-link" active-class="is-active">文档中心</router-link>
          <router-link to="/poms/phase3/tag" class="nav-link" active-class="is-active">标签管理</router-link>
          <router-link to="/poms/phase3/search" class="nav-link" active-class="is-active">全文搜索</router-link>
        </template>
      </nav>
      <el-button type="primary" plain size="small" @click="goFlowOverview">流程总览</el-button>
    </header>
    <main class="poms-demo-main">
      <div class="poms-demo-main-inner">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import '@/styles/poms-demo.scss';

export default {
  name: 'PomsDemoLayout',
  computed: {
    isPhase2() {
      return this.$route.path.startsWith('/poms/phase2');
    },
    isPhase3() {
      return this.$route.path.startsWith('/poms/phase3');
    },
  },
  methods: {
    goFlowOverview() {
      window.location.href = `${import.meta.env.BASE_URL}../index.html`;
    },
  },
};
</script>

<style scoped lang="scss">
.poms-demo-layout {
  position: fixed;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}
.poms-demo-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
  height: 52px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.poms-demo-header__brand {
  font-weight: 700;
  color: #303133;
  white-space: nowrap;
  cursor: pointer;
  &:hover { color: #409eff; }
}
.poms-demo-header__nav {
  display: flex;
  gap: 8px;
  flex: 1;
  overflow-x: auto;
  align-items: center;
}
.nav-divider {
  width: 1px;
  height: 20px;
  background: #dcdfe6;
  margin: 0 4px;
  flex-shrink: 0;
}
.nav-link {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 4px;
  color: #606266;
  text-decoration: none;
  font-size: 13px;
  &:hover { color: #409eff; background: #ecf5ff; }
  &.is-active { color: #409eff; background: #ecf5ff; font-weight: 600; }
}
.poms-demo-main {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
}
.poms-demo-main-inner {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}
</style>
