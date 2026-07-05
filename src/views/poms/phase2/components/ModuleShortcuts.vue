<template>
  <div class="module-shortcuts">
    <h4 class="shortcuts-title">业务模块（3 项，带项目筛选）</h4>
    <el-row :gutter="12">
      <el-col v-for="mod in MODULE_LINKS" :key="mod.key" :span="8">
        <el-card shadow="hover" class="shortcut-card" @click="go(mod)">
          <div class="shortcut-icon">{{ mod.icon }}</div>
          <div class="shortcut-body">
            <strong>{{ mod.title }}</strong>
            <p>{{ mod.desc }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { MODULE_LINKS, buildStepRoute } from '../utils/projectFlow';

export default {
  name: 'ModuleShortcuts',
  props: {
    projectId: { type: String, required: true },
  },
  data() {
    return { MODULE_LINKS };
  },
  methods: {
    go(mod) {
      this.$router.push(buildStepRoute(mod, this.projectId));
    },
  },
};
</script>

<style scoped lang="scss">
.module-shortcuts {
  margin-top: 0;
}
.shortcuts-title {
  margin: 0 0 12px;
  font-size: 15px;
  color: #303133;
}
.shortcut-card {
  cursor: pointer;
  margin-bottom: 12px;
  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
  }
}
.shortcut-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #ecf5ff;
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}
.shortcut-body {
  strong {
    display: block;
    font-size: 14px;
  }
  p {
    margin: 4px 0 0;
    font-size: 12px;
    color: #909399;
  }
}
</style>
