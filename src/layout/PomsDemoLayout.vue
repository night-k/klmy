<template>
  <div class="poms-demo-layout">
    <header class="poms-demo-header">
      <div class="poms-demo-header__brand" @click="goFlowOverview">POMS 演示原型</div>
      <nav class="poms-demo-header__nav">
        <router-link to="/poms/phase1/index" class="nav-link" active-class="is-active">销售主线</router-link>
        <router-link to="/poms/phase2/index" class="nav-link" active-class="is-active">项目主线</router-link>
        <router-link to="/poms/phase3/index" class="nav-link" active-class="is-active">知识主线</router-link>
        <router-link to="/poms/phase4/index" class="nav-link" active-class="is-active">人才主线</router-link>

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

        <template v-if="isPhase4">
          <span class="nav-divider" />
          <router-link to="/poms/phase4/candidate" class="nav-link" active-class="is-active">候选人池</router-link>
          <router-link to="/poms/phase4/talent" class="nav-link" active-class="is-active">人才档案</router-link>
          <router-link to="/poms/phase4/resume" class="nav-link" active-class="is-active">简历生成</router-link>
          <router-link to="/poms/phase4/bid" class="nav-link" active-class="is-active">投标包</router-link>
          <router-link to="/poms/phase4/template" class="nav-link" active-class="is-active">模板管理</router-link>
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
    isPhase4() {
      return this.$route.path.startsWith('/poms/phase4');
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
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}
.poms-demo-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
  height: 52px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
  z-index: 100;
}
.poms-demo-header__brand {
  font-weight: 700;
  font-size: 15px;
  color: #1890ff;
  cursor: pointer;
  white-space: nowrap;
}
.poms-demo-header__nav {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  min-width: 0;
}
.nav-link {
  padding: 6px 10px;
  font-size: 13px;
  color: #606266;
  text-decoration: none;
  border-radius: 4px;
  white-space: nowrap;
  &:hover { color: #1890ff; background: #ecf5ff; }
  &.is-active { color: #1890ff; font-weight: 600; background: #ecf5ff; }
}
.nav-divider {
  width: 1px;
  height: 16px;
  background: #dcdfe6;
  margin: 0 6px;
  flex-shrink: 0;
}
.poms-demo-main {
  flex: 1;
  overflow: auto;
}
.poms-demo-main-inner {
  min-height: 100%;
}
</style>
