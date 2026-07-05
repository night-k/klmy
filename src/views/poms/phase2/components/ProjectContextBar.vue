<template>
  <div class="project-context-bar">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/poms/phase2/index' }">Phase2</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/poms/phase2/projectList' }">项目列表</el-breadcrumb-item>
      <el-breadcrumb-item v-if="stepTitle">{{ stepTitle }}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="bar-actions">
      <span class="bar-label">当前项目</span>
      <el-select :model-value="projectId" filterable placeholder="选择项目" style="width: 280px" @update:model-value="onProjectChange">
        <el-option v-for="p in projects" :key="p.id" :label="`${p.code} · ${p.projectName}`" :value="String(p.id)" />
      </el-select>
      <el-button v-if="projectId" type="primary" plain @click="goSpace">进入项目空间</el-button>
    </div>
    <flow-step-nav v-if="flowKey" :flow-key="flowKey" :project-id="projectId" :project-detail="projectDetail" />
    <el-alert v-if="guardMessage" :title="guardMessage" type="warning" show-icon :closable="false" class="guard-alert" />
  </div>
</template>

<script>
import { getPage, getDetail } from '@/api/poms/phase2/projectAdapter';
import { getGuardMessage, getStepByKey } from '../utils/projectFlow';
import FlowStepNav from './FlowStepNav.vue';

export default {
  name: 'ProjectContextBar',
  components: { FlowStepNav },
  props: {
    projectId: { type: String, default: '' },
    moduleName: { type: String, default: '' },
    moduleKey: { type: String, default: '' },
    flowKey: { type: String, default: '' },
  },
  emits: ['update:projectId', 'project-loaded'],
  data() {
    return {
      projects: [],
      projectDetail: null,
    };
  },
  computed: {
    effectiveModuleKey() {
      if (this.moduleKey) return this.moduleKey;
      const step = getStepByKey(this.flowKey);
      return step?.moduleKey || '';
    },
    stepTitle() {
      return this.moduleName || getStepByKey(this.flowKey)?.title || '';
    },
    guardMessage() {
      if (!this.effectiveModuleKey || !this.projectDetail) return '';
      return getGuardMessage(this.effectiveModuleKey, this.projectDetail) || '';
    },
  },
  watch: {
    projectId: {
      immediate: true,
      handler(id) {
        if (id) this.loadDetail(id);
      },
    },
  },
  mounted() {
    this.loadProjects();
  },
  methods: {
    loadProjects() {
      getPage(1, 100, {}).then(res => {
        this.projects = res.data.data.records || [];
        if (!this.projectId && this.projects.length) {
          const fromQuery = this.$route.query.projectId;
          const id = fromQuery ? String(fromQuery) : String(this.projects[0].id);
          this.onProjectChange(id);
        }
      });
    },
    loadDetail(id) {
      getDetail(id).then(res => {
        this.projectDetail = res.data.data || null;
        this.$emit('project-loaded', this.projectDetail);
      });
    },
    onProjectChange(id) {
      const pid = String(id || '');
      this.$emit('update:projectId', pid);
      if (pid !== this.$route.query.projectId) {
        this.$router.replace({ query: { ...this.$route.query, projectId: pid || undefined } });
      }
      if (pid) this.loadDetail(pid);
    },
    goSpace() {
      this.$router.push({ path: '/poms/phase2/projectSpace', query: { projectId: this.projectId } });
    },
  },
};
</script>

<style scoped lang="scss">
.project-context-bar {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}
.bar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.bar-label {
  font-size: 14px;
  color: #606266;
}
.guard-alert {
  margin-top: 12px;
}
</style>
