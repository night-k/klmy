<template>
  <el-drawer v-model="visible" :title="null" size="860px" append-to-body destroy-on-close class="candidate-view-drawer" @closed="$emit('closed')">
    <div v-if="detail" v-loading="loading" class="candidate-view">
      <div class="candidate-view__hero">
        <div class="candidate-view__hero-main">
          <div class="candidate-view__avatar">{{ detail.name ? detail.name.slice(0, 1) : '-' }}</div>
          <div>
            <div class="candidate-view__code">{{ detail.code }}</div>
            <h2 class="candidate-view__title">{{ detail.name }}</h2>
            <div class="candidate-view__tags">
              <el-tag :type="CANDIDATE_STATUS_TAG[detail.status]" effect="dark" round>{{ labelOf(CANDIDATE_STATUS, detail.status) }}</el-tag>
              <el-tag type="primary" effect="plain" round>{{ detail.position }}</el-tag>
              <el-tag type="info" effect="plain" round>{{ detail.source }}</el-tag>
              <el-tag v-if="detail.resumeGenerated" type="success" effect="plain" round>已生成简历</el-tag>
            </div>
          </div>
        </div>
        <div class="candidate-view__hero-stats">
          <div class="candidate-view__stat">
            <div class="candidate-view__stat-value">{{ detail.interviewScore || '-' }}</div>
            <div class="candidate-view__stat-label">面试评分</div>
          </div>
          <div class="candidate-view__stat">
            <div class="candidate-view__stat-value">{{ detail.certCount || 0 }}</div>
            <div class="candidate-view__stat-label">持证数</div>
          </div>
        </div>
      </div>

      <el-alert v-if="detail.rejectReason" :title="detail.rejectReason" type="warning" show-icon :closable="false" style="margin-bottom: 16px" />

      <el-card shadow="never" class="candidate-view__section">
        <template #header><span class="candidate-view__section-title">基本信息</span></template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学历">{{ detail.education || '-' }}</el-descriptions-item>
          <el-descriptions-item label="工作年限">{{ detail.experienceYears || 0 }} 年</el-descriptions-item>
          <el-descriptions-item label="手机">{{ detail.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ detail.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="最近触达" :span="2">{{ detail.lastTouch || '-' }}</el-descriptions-item>
          <el-descriptions-item label="简介" :span="2">{{ detail.summary || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-tabs v-model="activeTab" class="candidate-view__tabs">
        <el-tab-pane name="cert">
          <template #label>
            <span>资质证书 <el-badge v-if="detail.certCount" :value="detail.certCount" class="candidate-view__tab-badge" /></span>
          </template>
          <el-table :data="detail.certificateBindings || []" border size="small" class="candidate-view__table">
            <el-table-column prop="certName" label="证书名称" min-width="160" show-overflow-tooltip />
            <el-table-column label="证书类型" min-width="110">
              <template #default="{ row }">{{ labelOf(CERT_TYPE, row.certType) }}</template>
            </el-table-column>
            <el-table-column prop="certNo" label="证书编号" min-width="140" show-overflow-tooltip />
            <el-table-column prop="issueDate" label="发证日期" min-width="110" />
            <el-table-column prop="validTo" label="有效期至" min-width="110" />
            <el-table-column label="状态" min-width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="CERT_STATUS_TAG[row.status] || 'info'" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="90" align="center">
              <template #default="{ row }">
                <el-button link type="primary" @click="openCertDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="!(detail.certificateBindings || []).length" class="candidate-view__empty">暂无证书，可在编辑时添加</div>
        </el-tab-pane>

        <el-tab-pane label="技能项目" name="skill">
          <div class="candidate-view__block">
            <div class="candidate-view__block-title">技能标签</div>
            <div class="candidate-view__tags">
              <el-tag v-for="tag in detail.skills || []" :key="tag" effect="plain">{{ tag }}</el-tag>
              <span v-if="!(detail.skills || []).length" class="candidate-view__muted">暂无</span>
            </div>
          </div>
          <div class="candidate-view__block">
            <div class="candidate-view__block-title">项目经历</div>
            <div v-if="(detail.projectCases || []).length" class="candidate-view__project-cases">{{ projectCasesDisplay }}</div>
            <span v-else class="candidate-view__muted">暂无</span>
          </div>
        </el-tab-pane>

        <el-tab-pane name="history">
          <template #label>
            <span>流转记录 <el-badge v-if="(detail.history || []).length" :value="(detail.history || []).length" class="candidate-view__tab-badge" /></span>
          </template>
          <el-timeline>
            <el-timeline-item v-for="item in detail.history || []" :key="`${item.time}-${item.action}`" :timestamp="item.time" placement="top">
              <strong>{{ item.action }}</strong>
              <div class="candidate-view__muted">{{ item.detail }}</div>
            </el-timeline-item>
          </el-timeline>
          <div v-if="!(detail.history || []).length" class="candidate-view__empty">暂无流转记录</div>
        </el-tab-pane>
      </el-tabs>

      <div class="candidate-view__actions">
        <el-button type="primary" plain @click="$emit('edit', detail)">编辑</el-button>
        <el-button type="primary" plain :disabled="!canPromote" @click="$emit('promote', detail)">{{ promoteLabel }}</el-button>
        <el-button type="danger" plain :disabled="!canReject" @click="$emit('reject', detail)">淘汰</el-button>
        <el-button type="success" plain :disabled="!canResume" @click="$emit('generate-resume', detail)">生成简历</el-button>
        <el-button type="warning" plain :disabled="!detail.resumeGenerated" @click="$emit('add-bid', detail)">加入投标包</el-button>
        <el-button v-if="detail.status === 'hired'" type="primary" link @click="$emit('go-talent', detail)">查看人才档案 →</el-button>
      </div>
    </div>

    <el-dialog v-model="certDetailVisible" title="证书详情" width="520px" append-to-body destroy-on-close>
      <el-descriptions v-if="certDetail" :column="1" border>
        <el-descriptions-item label="证书名称">{{ certDetail.certName }}</el-descriptions-item>
        <el-descriptions-item label="证书类型">{{ labelOf(CERT_TYPE, certDetail.certType) }}</el-descriptions-item>
        <el-descriptions-item label="证书编号">{{ certDetail.certNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="发证机关">{{ certDetail.issuingAuthority || '-' }}</el-descriptions-item>
        <el-descriptions-item label="发证日期">{{ certDetail.issueDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="有效期至">{{ certDetail.validTo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="CERT_STATUS_TAG[certDetail.status] || 'info'" size="small">{{ certDetail.status }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button v-if="certDetail?.attach" type="primary" plain @click="previewAttach">预览附件</el-button>
        <el-button @click="certDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </el-drawer>
</template>

<script>
import { CANDIDATE_STATUS, CANDIDATE_STATUS_TAG, CERT_TYPE, CERT_STATUS_TAG, labelOf } from '../option/dict';
import { previewBidFile } from '@/views/poms/phase1/utils/mockFile';
import { projectCasesToText } from '../utils/projectCases';

export default {
  name: 'CandidateViewDrawer',
  props: {
    modelValue: { type: Boolean, default: false },
    detail: { type: Object, default: null },
    loading: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'closed', 'edit', 'promote', 'reject', 'generate-resume', 'add-bid', 'go-talent'],
  data() {
    return {
      activeTab: 'cert',
      certDetailVisible: false,
      certDetail: null,
      CANDIDATE_STATUS,
      CANDIDATE_STATUS_TAG,
      CERT_TYPE,
      CERT_STATUS_TAG,
      labelOf,
    };
  },
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
    canPromote() {
      return ['new', 'interview', 'offer'].includes(this.detail?.status);
    },
    canReject() {
      return ['new', 'interview', 'offer'].includes(this.detail?.status);
    },
    canResume() {
      return ['offer', 'hired'].includes(this.detail?.status);
    },
    promoteLabel() {
      const map = { new: '推进到面试', interview: '推进到录用', offer: '确认录用' };
      return map[this.detail?.status] || '推进状态';
    },
    projectCasesDisplay() {
      return projectCasesToText(this.detail?.projectCases);
    },
  },
  watch: {
    modelValue(val) {
      if (val) this.activeTab = 'cert';
    },
  },
  methods: {
    openCertDetail(row) {
      this.certDetail = row;
      this.certDetailVisible = true;
    },
    previewAttach() {
      if (this.certDetail?.attach) previewBidFile(this.certDetail.attach);
    },
  },
};
</script>

<style scoped lang="scss">
.candidate-view {
  padding: 0 4px 24px;
}
.candidate-view__hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f0f9eb 0%, #f5f7fa 100%);
}
.candidate-view__hero-main {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.candidate-view__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #2c7be5;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 600;
  flex-shrink: 0;
}
.candidate-view__code {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}
.candidate-view__title {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 600;
}
.candidate-view__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.candidate-view__hero-stats {
  display: flex;
  gap: 20px;
  flex-shrink: 0;
}
.candidate-view__stat {
  text-align: center;
  min-width: 64px;
}
.candidate-view__stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2c7be5;
  line-height: 1.2;
}
.candidate-view__stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
.candidate-view__section {
  margin-bottom: 16px;
  border-radius: 8px;
  :deep(.el-card__header) {
    padding: 12px 16px;
    background: var(--el-fill-color-light);
  }
}
.candidate-view__section-title {
  font-weight: 600;
}
.candidate-view__tabs {
  margin-bottom: 16px;
}
.candidate-view__tab-badge {
  margin-left: 6px;
}
.candidate-view__table {
  width: 100%;
}
.candidate-view__block {
  margin-bottom: 16px;
}
.candidate-view__block-title {
  font-weight: 600;
  margin-bottom: 8px;
}
.candidate-view__muted {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  margin-top: 4px;
}
.candidate-view__empty {
  padding: 20px;
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.candidate-view__project-cases {
  white-space: pre-line;
  line-height: 1.8;
  color: var(--el-text-color-regular);
  font-size: 14px;
}
.candidate-view__actions {
  position: sticky;
  bottom: 0;
  padding: 16px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04);
}
</style>

<style lang="scss">
.candidate-view-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 20px 0;
  }
  .el-drawer__body {
    padding: 12px 20px 20px;
  }
}
</style>
