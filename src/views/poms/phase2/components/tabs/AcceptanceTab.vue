<template>
  <div class="acceptance-tab">
    <el-alert v-if="blockers.length && !editing" type="info" show-icon :closable="false" style="margin-bottom: 12px">
      <template #title>验收前置条件：{{ blockers.join('；') }}</template>
    </el-alert>

    <el-empty v-if="!activeAcceptance && !editing" :description="emptyDesc">
      <el-button type="primary" :disabled="!canSubmit || !canOperate" @click="startNew">发起项目验收</el-button>
    </el-empty>

    <el-form v-else-if="editing" :model="form" label-width="100px">
      <el-form-item label="验收类型">
        <el-select v-model="form.acceptanceType" style="width: 100%" @change="onTypeChange">
          <el-option v-for="o in ACCEPTANCE_TYPE" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
      </el-form-item>
      <el-alert v-if="formBlockers.length" type="warning" show-icon :closable="false" style="margin-bottom: 12px">
        {{ formBlockers.join('；') }}
      </el-alert>
      <el-form-item label="验收日期">
        <el-date-picker v-model="form.acceptanceDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
      </el-form-item>
      <el-form-item label="验收结论">
        <el-radio-group v-model="form.conclusion">
          <el-radio v-for="o in ACCEPTANCE_CONCLUSION" :key="o.value" :value="o.value">{{ o.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="验收意见"><el-input v-model="form.opinion" type="textarea" :rows="3" /></el-form-item>
      <el-form-item label="验收附件">
        <el-upload v-model:file-list="fileList" action="#" :auto-upload="false" multiple>
          <el-button type="primary" plain size="small">上传验收报告</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="submitting" :disabled="!!formBlockers.length || !canOperate" @click="submit">提交验收</el-button>
        <el-button @click="editing = false">取消</el-button>
      </el-form-item>
    </el-form>

    <template v-else>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="验收编号">{{ activeAcceptance.code }}</el-descriptions-item>
        <el-descriptions-item label="验收类型">{{ labelOf(ACCEPTANCE_TYPE, activeAcceptance.acceptanceType) }}</el-descriptions-item>
        <el-descriptions-item label="验收日期">{{ activeAcceptance.acceptanceDate }}</el-descriptions-item>
        <el-descriptions-item label="结论">
          <el-tag size="small" :type="ACCEPTANCE_CONCLUSION_TAG[activeAcceptance.conclusion]">
            {{ labelOf(ACCEPTANCE_CONCLUSION, activeAcceptance.conclusion) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="意见" :span="2">{{ activeAcceptance.opinion || '-' }}</el-descriptions-item>
        <el-descriptions-item label="附件" :span="2">
          <el-tag v-for="file in activeAcceptance.files || []" :key="file.name" size="small" style="margin-right: 6px">{{ file.name }}</el-tag>
          <span v-if="!(activeAcceptance.files || []).length">-</span>
        </el-descriptions-item>
      </el-descriptions>
      <div class="acceptance-actions">
        <el-button v-if="activeAcceptance.conclusion === 'passed' && activeAcceptance.acceptanceType === 'final'" type="primary" plain @click="startReinspect"> 申请复验 </el-button>
        <el-button type="warning" plain @click="revokeLatest">撤销本次验收</el-button>
      </div>
    </template>

    <el-divider content-position="left">验收整改</el-divider>
    <el-alert v-if="openRectifications.length" type="warning" show-icon :closable="false" style="margin-bottom: 12px" title="当前仍有未关闭整改项，完成整改并复核后再发起复验" />
    <el-table :data="acceptanceRectifications" border size="small" empty-text="暂无验收整改">
      <el-table-column prop="code" label="整改单号" width="150" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="RECTIFICATION_STATUS_TAG[row.status]">
            {{ labelOf(RECTIFICATION_STATUS, row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="assigneeName" label="责任人" width="100" />
      <el-table-column prop="deadline" label="期限" width="110" />
      <el-table-column prop="requirement" label="整改要求" min-width="180" show-overflow-tooltip />
    </el-table>

    <el-divider content-position="left">验收历史</el-divider>
    <el-table :data="history" border size="small" empty-text="暂无验收记录">
      <el-table-column prop="code" label="编号" width="140" />
      <el-table-column label="类型" width="100">
        <template #default="{ row }">{{ labelOf(ACCEPTANCE_TYPE, row.acceptanceType) }}</template>
      </el-table-column>
      <el-table-column prop="acceptanceDate" label="日期" width="110" />
      <el-table-column label="结论" width="110">
        <template #default="{ row }">
          <el-tag v-if="row.revoked" size="small" type="info">已撤销</el-tag>
          <el-tag v-else size="small" :type="ACCEPTANCE_CONCLUSION_TAG[row.conclusion]">
            {{ labelOf(ACCEPTANCE_CONCLUSION, row.conclusion) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="opinion" label="意见" min-width="160" show-overflow-tooltip />
      <el-table-column prop="createTime" label="记录时间" width="160" />
    </el-table>
  </div>
</template>

<script>
import { ACCEPTANCE_CONCLUSION, ACCEPTANCE_CONCLUSION_TAG, ACCEPTANCE_TYPE, RECTIFICATION_STATUS, RECTIFICATION_STATUS_TAG, labelOf } from '../../option/dict';
import { getAcceptanceHistory, submitAcceptance, revokeAcceptance } from '@/api/poms/phase2/acceptance';

export default {
  props: {
    projectId: { type: String, required: true },
    canSubmit: { type: Boolean, default: false },
    milestones: { type: Array, default: () => [] },
    tasks: { type: Array, default: () => [] },
    rectifications: { type: Array, default: () => [] },
    canOperate: { type: Boolean, default: true },
  },
  emits: ['changed'],
  data() {
    return {
      ACCEPTANCE_CONCLUSION,
      ACCEPTANCE_CONCLUSION_TAG,
      ACCEPTANCE_TYPE,
      RECTIFICATION_STATUS,
      RECTIFICATION_STATUS_TAG,
      activeAcceptance: null,
      history: [],
      editing: false,
      submitting: false,
      fileList: [],
      form: { acceptanceType: 'final', acceptanceDate: '', conclusion: 'passed', opinion: '' },
    };
  },
  computed: {
    blockers() {
      return this.getBlockers('final');
    },
    formBlockers() {
      return this.getBlockers(this.form.acceptanceType);
    },
    acceptanceRectifications() {
      return (this.rectifications || []).filter(r => r.source === 'acceptance' || r.acceptanceId);
    },
    openRectifications() {
      return this.acceptanceRectifications.filter(r => r.status !== 'closed');
    },
    emptyDesc() {
      if (this.blockers.length) return this.blockers.join('；');
      return '项目任务与里程碑完成后可发起验收';
    },
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
    getBlockers(type) {
      const tasks = this.tasks || [];
      const milestones = this.milestones || [];
      const reasons = [];
      if (!tasks.length) reasons.push('暂无任务');
      if (!milestones.length) reasons.push('暂无里程碑');
      if (type === 'interim') {
        const passedMs = milestones.filter(m => m.status === 'passed').length;
        if (!passedMs) reasons.push('需至少 1 个里程碑通过');
      } else {
        const undone = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length;
        if (undone) reasons.push(`${undone} 个任务未完成`);
        const unpassed = milestones.filter(m => m.status !== 'passed').length;
        if (unpassed) reasons.push(`${unpassed} 个里程碑未通过`);
      }
      return reasons;
    },
    load() {
      getAcceptanceHistory(this.projectId).then(res => {
        this.history = res.data.data || [];
        this.activeAcceptance = this.history.find(a => !a.revoked) || null;
      });
    },
    startNew() {
      this.form = {
        acceptanceType: 'final',
        acceptanceDate: new Date().toISOString().slice(0, 10),
        conclusion: 'passed',
        opinion: '',
      };
      this.fileList = [];
      this.editing = true;
    },
    startReinspect() {
      this.$confirm('将发起新的验收流程，历史验收记录保留。', '申请复验', { type: 'info' })
        .then(() => {
          this.form = {
            acceptanceType: 'final',
            acceptanceDate: new Date().toISOString().slice(0, 10),
            conclusion: 'passed',
            opinion: '复验申请',
          };
          this.fileList = [];
          this.editing = true;
        })
        .catch(() => {});
    },
    onTypeChange() {
      if (this.formBlockers.length) {
        this.$message.warning(this.formBlockers.join('；'));
      }
    },
    submit() {
      if (this.formBlockers.length) {
        this.$message.warning(this.formBlockers.join('；'));
        return;
      }
      if (this.form.acceptanceType === 'final' && this.openRectifications.length) {
        this.$message.warning('仍有验收整改未关闭，暂不能提交最终验收');
        return;
      }
      this.$confirm('确认提交验收？', '提交验收', { type: 'warning' })
        .then(() => {
          this.submitting = true;
          const files = (this.fileList || []).map(f => ({ name: f.name, url: f.url || '#' }));
          return submitAcceptance({ ...this.form, projectId: this.projectId, files });
        })
        .then(res => {
          this.activeAcceptance = res.data.data;
          this.editing = false;
          const msg =
            {
              passed: '验收通过',
              conditional: '有条件通过，请完成整改后复验',
              failed: '验收不通过，项目已回到进行中',
            }[this.form.conclusion] || '验收已提交';
          this.$message.success(msg);
          this.$emit('changed');
          this.load();
        })
        .catch(() => {})
        .finally(() => {
          this.submitting = false;
        });
    },
    revokeLatest() {
      if (!this.activeAcceptance) return;
      this.$prompt('请输入撤销原因', '撤销验收', {
        inputType: 'textarea',
        inputValidator: v => (v && v.trim() ? true : '请填写撤销原因'),
      })
        .then(({ value }) => {
          revokeAcceptance(this.activeAcceptance.id, value.trim()).then(() => {
            this.$message.warning('验收已撤销');
            this.$emit('changed');
            this.load();
          });
        })
        .catch(() => {});
    },
  },
};
</script>

<style scoped>
.acceptance-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
