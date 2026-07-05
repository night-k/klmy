<template>
  <div class="milestone-panel">
    <el-timeline>
      <el-timeline-item v-for="m in milestones" :key="m.id" :type="m.status === 'passed' ? 'success' : 'primary'">
        <div class="ms-item">
          <strong>{{ m.name }}</strong>
          <el-tag size="small" style="margin-left: 8px">{{ labelOf(MILESTONE_STATUS, m.status) }}</el-tag>
          <p>计划：{{ m.planDate }} / 实际：{{ m.actualDate || '-' }}</p>
          <div v-if="showActions" class="ms-actions">
            <el-button v-if="m.status === 'pending_acceptance' || m.status === 'in_progress'" size="small" type="success" @click="$emit('pass', m)"> 验收通过 </el-button>
            <el-button v-if="m.status === 'passed'" size="small" type="warning" plain @click="$emit('revoke', m)"> 撤销通过 </el-button>
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>
    <el-empty v-if="!milestones.length" description="开题报告审核通过后将自动生成里程碑">
      <el-button type="primary" link @click="$emit('go-proposal')">去填写开题报告</el-button>
    </el-empty>
  </div>
</template>

<script>
import { MILESTONE_STATUS, labelOf } from '../option/dict';

export default {
  name: 'MilestonePanel',
  props: {
    milestones: { type: Array, default: () => [] },
    showActions: { type: Boolean, default: true },
  },
  emits: ['pass', 'revoke', 'go-proposal'],
  data() {
    return { MILESTONE_STATUS };
  },
  methods: { labelOf },
};
</script>

<style scoped>
.ms-item p {
  margin: 4px 0 8px;
  color: #909399;
  font-size: 13px;
}
.ms-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
