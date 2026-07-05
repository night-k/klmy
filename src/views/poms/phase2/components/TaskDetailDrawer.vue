<template>
  <el-drawer v-model="visible" :title="`任务详情 · ${task.taskName || ''}`" size="820px" append-to-body destroy-on-close @closed="$emit('closed')">
    <div v-if="taskId" v-loading="loading" class="task-detail-drawer">
      <el-collapse v-model="activePanels">
        <el-collapse-item title="基本信息" name="base">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="任务编号">{{ task.code }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag size="small" :type="TASK_STATUS_TAG[task.status]">{{ labelOf(TASK_STATUS, task.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="项目名称">{{ task.projectName }}</el-descriptions-item>
            <el-descriptions-item label="所属阶段">{{ task.phaseName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="责任人">{{ task.assigneeName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="工作量">{{ task.workload || 0 }} 人·天</el-descriptions-item>
            <el-descriptions-item label="计划周期">{{ task.planStartDate }} ~ {{ task.planEndDate }}</el-descriptions-item>
            <el-descriptions-item label="实际周期">{{ task.actualStartDate || '-' }} ~ {{ task.actualEndDate || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>

        <el-collapse-item title="任务说明" name="desc">
          <p class="task-desc">{{ task.description || '暂无说明' }}</p>
        </el-collapse-item>

        <el-collapse-item title="成果物上传" name="deliverable">
          <deliverable-tab ref="deliverableTab" :project-id="task.projectId" :task-id="taskId" />
        </el-collapse-item>

        <el-collapse-item v-if="canReview" title="成果审核（技术负责人）" name="review">
          <review-tab :project-id="task.projectId" @changed="load" />
        </el-collapse-item>

        <el-collapse-item title="整改单" name="rect">
          <el-table :data="rectifications" border size="small">
            <el-table-column prop="code" label="整改单号" width="150" />
            <el-table-column prop="description" label="问题描述" min-width="160" show-overflow-tooltip />
            <el-table-column prop="requirement" label="整改意见" min-width="160" show-overflow-tooltip />
            <el-table-column prop="deadline" label="截止" width="110" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag size="small" :type="RECTIFICATION_STATUS_TAG[row.status]">{{ labelOf(RECTIFICATION_STATUS, row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button v-if="row.status === 'pending'" link type="primary" @click="startRectify(row)">开始整改</el-button>
                <el-button v-if="row.status === 'rectifying'" link type="warning" @click="submitRectify(row)">提交复核</el-button>
                <el-button v-if="row.status === 'reviewing'" link type="success" @click="verifyRect(row, true)">复核通过</el-button>
                <el-button v-if="row.status === 'reviewing'" link type="danger" @click="verifyRect(row, false)">退回返工</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!rectifications.length" description="暂无整改单" />
        </el-collapse-item>

        <el-collapse-item title="变更记录" name="changelog">
          <el-table :data="changeLogs" border size="small">
            <el-table-column prop="time" label="时间" width="160" />
            <el-table-column label="变更" min-width="220">
              <template #default="{ row }">
                <span v-if="row.action === 'dispatch'">
                  派发：{{ row.before?.assigneeName || '-' }} → {{ row.after?.assigneeName || '-' }}； 工期 {{ row.after?.planStartDate }} ~ {{ row.after?.planEndDate }}
                </span>
                <span v-else>{{ row.action }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="note" label="说明" min-width="120" show-overflow-tooltip />
          </el-table>
          <el-empty v-if="!changeLogs.length" description="暂无变更记录" />
        </el-collapse-item>

        <el-collapse-item title="审核记录" name="history">
          <el-timeline>
            <el-timeline-item v-for="r in reviews" :key="r.id" :type="r.conclusion === 'approved' ? 'success' : 'danger'">
              {{ r.conclusion === 'approved' ? '通过' : '驳回' }} — {{ r.opinion || '无意见' }}
              <div class="review-time">{{ r.reviewTime }}</div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-if="!reviews.length" description="暂无审核记录" />
        </el-collapse-item>
      </el-collapse>

      <div class="drawer-actions">
        <el-button v-if="task.status === 'dispatched'" type="primary" :loading="submitting" @click="doStart">开始执行</el-button>
        <el-button v-if="task.status === 'in_progress'" type="warning" :loading="submitting" @click="doSubmit">提交审核</el-button>
        <el-button v-if="['dispatched', 'in_progress'].includes(task.status)" type="danger" plain :loading="submitting" @click="doCancel"> 取消任务 </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import { TASK_STATUS, TASK_STATUS_TAG, RECTIFICATION_STATUS, RECTIFICATION_STATUS_TAG, labelOf } from '../option/dict';
import { getTaskDetail } from '@/api/poms/phase2/task';
import { start, submitReview, cancel } from '@/api/poms/phase2/task';
import { verifyRectification, startRectification, submitRectification } from '@/api/poms/phase2/acceptance';
import DeliverableTab from './tabs/DeliverableTab.vue';
import ReviewTab from './tabs/ReviewTab.vue';

export default {
  components: { DeliverableTab, ReviewTab },
  props: {
    modelValue: Boolean,
    taskId: { type: String, default: '' },
    initialPanel: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'closed', 'changed'],
  data() {
    return {
      TASK_STATUS,
      TASK_STATUS_TAG,
      RECTIFICATION_STATUS,
      RECTIFICATION_STATUS_TAG,
      labelOf,
      loading: false,
      submitting: false,
      task: {},
      reviews: [],
      rectifications: [],
      changeLogs: [],
      activePanels: ['base', 'desc', 'deliverable'],
    };
  },
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(v) {
        this.$emit('update:modelValue', v);
      },
    },
    canReview() {
      return this.task.status === 'pending_review';
    },
  },
  watch: {
    taskId: {
      immediate: true,
      handler(id) {
        if (id && this.visible) this.load();
      },
    },
    visible(val) {
      if (val && this.taskId) this.load();
    },
  },
  methods: {
    load() {
      if (!this.taskId) return;
      this.loading = true;
      getTaskDetail(this.taskId)
        .then(res => {
          const d = res.data.data || {};
          this.task = d.task || {};
          this.reviews = d.reviews || [];
          this.rectifications = d.rectifications || [];
          this.changeLogs = d.changeLogs || [];
          if (this.initialPanel === 'review' && this.task.status === 'pending_review') {
            this.activePanels = ['review', 'deliverable'];
          } else if (this.initialPanel === 'deliverable') {
            this.activePanels = ['deliverable'];
          } else {
            this.activePanels = ['base', 'desc', 'deliverable'];
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    doStart() {
      this.$confirm('确认开始执行？任务进入"进行中"后由责任人推进。', '开始执行', { type: 'info' })
        .then(() => {
          this.submitting = true;
          return start(this.taskId);
        })
        .then(() => {
          this.$message.success('任务已开始');
          this.load();
          this.$emit('changed');
        })
        .catch(() => {})
        .finally(() => {
          this.submitting = false;
        });
    },
    doSubmit() {
      this.$confirm('确认提交审核？提交后由技术负责人审核成果物。', '提交审核', { type: 'warning' })
        .then(() => {
          this.submitting = true;
          return submitReview(this.taskId);
        })
        .then(() => {
          this.$message.success('已提交审核');
          this.load();
          this.$emit('changed');
        })
        .catch(() => {})
        .finally(() => {
          this.submitting = false;
        });
    },
    doCancel() {
      this.$prompt('请输入取消原因', '取消任务', {
        inputType: 'textarea',
        inputValidator: v => (v && v.trim() ? true : '请填写取消原因'),
      })
        .then(({ value }) => {
          this.submitting = true;
          return cancel(this.taskId, value.trim());
        })
        .then(() => {
          this.$message.warning('任务已取消');
          this.load();
          this.$emit('changed');
        })
        .catch(() => {})
        .finally(() => {
          this.submitting = false;
        });
    },
    startRectify(row) {
      startRectification(row.id).then(() => {
        this.$message.info('整改已开始');
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
    verifyRect(row, passed) {
      if (passed) {
        verifyRectification(row.id, true).then(() => {
          this.$message.success('整改已复核通过，请重新提交任务审核');
          this.load();
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
.task-desc {
  margin: 0;
  line-height: 1.7;
  color: #4b5563;
  white-space: pre-wrap;
}
.review-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
.drawer-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}
</style>
