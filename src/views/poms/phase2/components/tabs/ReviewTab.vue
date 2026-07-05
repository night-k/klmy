<template>
  <div class="review-tab">
    <el-table :data="pendingTasks" border>
      <el-table-column prop="code" label="任务编号" width="180" />
      <el-table-column prop="taskName" label="任务名称" min-width="160" />
      <el-table-column prop="assigneeName" label="责任人" width="90" />
      <el-table-column label="成果物" min-width="160">
        <template #default="{ row }">
          <span v-for="d in deliverablesFor(row.id)" :key="d.id" class="del-tag">{{ d.name }} ({{ d.version }})</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="success" @click="approve(row)">通过</el-button>
          <el-button link type="danger" @click="reject(row)">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!pendingTasks.length" description="暂无待审核任务" />
    <el-divider content-position="left">整改单</el-divider>
    <el-table :data="rectifications" border size="small">
      <el-table-column prop="code" label="整改单号" width="150" />
      <el-table-column prop="description" label="问题描述" min-width="180" show-overflow-tooltip />
      <el-table-column prop="assigneeName" label="责任人" width="90" />
      <el-table-column prop="deadline" label="截止" width="110" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="RECTIFICATION_STATUS_TAG[row.status]">{{ labelOf(RECTIFICATION_STATUS, row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="170">
        <template #default="{ row }">
          <el-button v-if="row.status === 'pending'" link type="primary" @click="startRectify(row)">开始整改</el-button>
          <el-button v-if="row.status === 'rectifying'" link type="warning" @click="submitRectify(row)">提交复核</el-button>
          <el-button v-if="row.status === 'reviewing'" link type="success" @click="verify(row, true)">复核通过</el-button>
          <el-button v-if="row.status === 'reviewing'" link type="danger" @click="verify(row, false)">退回返工</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getPage as getTasks } from '@/api/poms/phase2/task';
import { getPage as getDeliverables } from '@/api/poms/phase2/deliverable';
import { approveReview, rejectReview } from '@/api/poms/phase2/review';
import { getRectificationPage, verifyRectification, startRectification, submitRectification } from '@/api/poms/phase2/acceptance';
import { RECTIFICATION_STATUS, RECTIFICATION_STATUS_TAG, labelOf } from '../../option/dict';

export default {
  props: { projectId: { type: String, required: true } },
  emits: ['changed'],
  data() {
    return {
      RECTIFICATION_STATUS,
      RECTIFICATION_STATUS_TAG,
      pendingTasks: [],
      deliverables: [],
      rectifications: [],
    };
  },
  watch: {
    projectId: {
      immediate: true,
      handler() {
        this.load();
      },
    },
  },
  methods: {
    labelOf,
    load() {
      getTasks(1, 100, { projectId: this.projectId, status: 'pending_review' }).then(res => {
        this.pendingTasks = res.data.data.records;
      });
      getDeliverables(1, 100, { projectId: this.projectId }).then(res => {
        this.deliverables = res.data.data.records;
      });
      getRectificationPage(1, 100, { projectId: this.projectId }).then(res => {
        this.rectifications = res.data.data.records;
      });
    },
    deliverablesFor(taskId) {
      return this.deliverables.filter(d => d.taskId === taskId);
    },
    approve(row) {
      this.$confirm('确认审核通过？任务将标记为已完成。', '成果审核', { type: 'success' })
        .then(() => {
          approveReview(row.id).then(() => {
            this.$message.success('审核通过，任务已完成');
            this.load();
            this.$emit('changed');
          });
        })
        .catch(() => {});
    },
    reject(row) {
      this.$prompt('请输入驳回意见', '成果审核驳回', {
        inputType: 'textarea',
        inputValidator: v => (v && v.trim() ? true : '请填写驳回意见'),
      })
        .then(({ value }) => {
          rejectReview(row.id, value.trim()).then(() => {
            this.$message.warning('已驳回并生成整改单（截止日期 = 今天 +3 天）');
            this.load();
            this.$emit('changed');
          });
        })
        .catch(() => {});
    },
    startRectify(row) {
      startRectification(row.id).then(() => {
        this.$message.info('整改已开始，完成后请点击"提交复核"');
        this.load();
      });
    },
    submitRectify(row) {
      this.$prompt('请描述整改情况', '提交复核', {
        inputType: 'textarea',
        inputValidator: v => (v && v.trim() ? true : '请填写整改说明'),
      })
        .then(({ value }) => {
          submitRectification(row.id, value.trim()).then(() => {
            this.$message.success('已提交质负复核');
            this.load();
          });
        })
        .catch(() => {});
    },
    verify(row, passed) {
      if (passed) {
        verifyRectification(row.id, true).then(() => {
          this.$message.success('整改已复核通过，请重新提交任务审核');
          this.load();
          this.$emit('changed');
        });
      } else {
        this.$prompt('请填写退回原因', '退回返工', {
          inputType: 'textarea',
          inputValidator: v => (v && v.trim() ? true : '请填写退回原因'),
        })
          .then(({ value }) => {
            verifyRectification(row.id, false, value.trim()).then(() => {
              this.$message.warning('整改已退回执行人');
              this.load();
            });
          })
          .catch(() => {});
      }
    },
  },
};
</script>

<style scoped>
.del-tag {
  display: inline-block;
  margin-right: 8px;
  font-size: 12px;
  color: #606266;
}
</style>
