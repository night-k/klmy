<template>
  <div class="flow-step-nav">
    <span class="flow-step-label"> 流程步骤 {{ stepIndex + 1 }} / {{ totalSteps }}：{{ currentStep?.title }} </span>
    <div class="flow-step-actions">
      <el-button size="small" :disabled="!prevStep" @click="go(prevStep)">上一步</el-button>
      <el-tooltip :content="nextDisabledReason" :disabled="!nextDisabledReason">
        <span>
          <el-button size="small" type="primary" :disabled="!!nextDisabledReason" @click="go(nextStep)"> 下一步 </el-button>
        </span>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import { FLOW_STEPS, getAdjacentSteps, buildStepRoute, canAccessStep, getGuardMessage } from '../utils/projectFlow';

export default {
  name: 'FlowStepNav',
  props: {
    flowKey: { type: String, required: true },
    projectId: { type: String, default: '' },
    projectDetail: { type: Object, default: null },
  },
  computed: {
    totalSteps() {
      return FLOW_STEPS.length;
    },
    adjacent() {
      return getAdjacentSteps(this.flowKey);
    },
    stepIndex() {
      return this.adjacent.index;
    },
    currentStep() {
      return this.adjacent.current;
    },
    prevStep() {
      return this.adjacent.prev;
    },
    nextStep() {
      return this.adjacent.next;
    },
    nextDisabledReason() {
      if (!this.nextStep) return '';
      if (this.nextStep.needsProject !== false && !this.projectId) {
        return '请先选择项目';
      }
      if (this.projectDetail && !canAccessStep(this.nextStep, this.projectDetail)) {
        return getGuardMessage(this.nextStep.moduleKey, this.projectDetail) || '请先完成当前步骤';
      }
      return '';
    },
  },
  methods: {
    go(step) {
      if (!step) return;
      const route = buildStepRoute(step, this.projectId);
      this.$router.push(route);
    },
  },
};
</script>

<style scoped lang="scss">
.flow-step-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 12px;
  background: #f5f7fa;
  border-radius: 6px;
}
.flow-step-label {
  font-size: 13px;
  color: #606266;
}
.flow-step-actions {
  display: flex;
  gap: 8px;
}
</style>
