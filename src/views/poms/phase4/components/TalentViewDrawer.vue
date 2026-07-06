<template>
  <el-drawer v-model="visible" :title="null" size="860px" append-to-body destroy-on-close class="talent-view-drawer" @closed="$emit('closed')">
    <div v-if="detail" v-loading="loading" class="talent-view">
      <div class="talent-view__hero">
        <div class="talent-view__hero-main">
          <div class="talent-view__avatar">{{ detail.name ? detail.name.slice(0, 1) : '-' }}</div>
          <div>
            <div class="talent-view__code">{{ detail.code }}</div>
            <h2 class="talent-view__title">{{ detail.name }}</h2>
            <div class="talent-view__tags">
              <el-tag type="success" effect="dark" round>{{ detail.title }}</el-tag>
              <el-tag type="primary" effect="plain" round>{{ detail.deptName || '待分配部门' }}</el-tag>
              <el-tag effect="plain" round>{{ detail.experienceYears }} 年经验</el-tag>
            </div>
          </div>
        </div>
        <div class="talent-view__hero-stats">
          <div class="talent-view__stat">
            <div class="talent-view__stat-value">{{ detail.resumeHits || 0 }}</div>
            <div class="talent-view__stat-label">简历命中</div>
          </div>
          <div class="talent-view__stat">
            <div class="talent-view__stat-value">{{ detail.certCount || 0 }}</div>
            <div class="talent-view__stat-label">持证数</div>
          </div>
        </div>
      </div>

      <el-card shadow="never" class="talent-view__section">
        <template #header><span class="talent-view__section-title">基本信息</span></template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学历">{{ detail.education || '-' }}</el-descriptions-item>
          <el-descriptions-item label="手机">{{ detail.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ detail.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="入档时间">{{ detail.createTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="简介" :span="2">{{ detail.summary || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-tabs v-model="activeTab" class="talent-view__tabs">
        <el-tab-pane name="cert">
          <template #label>
            <span>资质证书 <el-badge v-if="detail.certCount" :value="detail.certCount" class="talent-view__tab-badge" /></span>
          </template>
          <el-table :data="detail.certificateBindings || []" border size="small" class="talent-view__table">
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
          <div v-if="!(detail.certificateBindings || []).length" class="talent-view__empty">暂无证书，可在编辑档案时添加</div>
        </el-tab-pane>

        <el-tab-pane label="技能项目" name="skill">
          <div class="talent-view__block">
            <div class="talent-view__block-title">技能标签</div>
            <div class="talent-view__tags">
              <el-tag v-for="tag in detail.skills || []" :key="tag" effect="plain">{{ tag }}</el-tag>
              <span v-if="!(detail.skills || []).length" class="talent-view__muted">暂无</span>
            </div>
          </div>
          <div class="talent-view__block">
            <div class="talent-view__block-title">项目经历</div>
            <div v-if="(detail.projectCases || []).length" class="talent-view__project-cases">{{ projectCasesDisplay }}</div>
            <span v-else class="talent-view__muted">暂无</span>
          </div>
        </el-tab-pane>
      </el-tabs>

      <el-card v-if="resume" shadow="never" class="talent-view__section">
        <template #header><span class="talent-view__section-title">投标简历</span></template>
        <div>{{ resume.fileName }}</div>
        <div class="talent-view__muted">{{ resume.templateName }} · 匹配 {{ resume.matchRate }}% · {{ resume.generatedAt }}</div>
      </el-card>

      <div class="talent-view__actions">
        <el-button type="primary" plain @click="$emit('edit', detail)">编辑档案</el-button>
        <el-button type="success" plain @click="$emit('generate-resume', detail)">生成投标简历</el-button>
        <el-button type="warning" plain :disabled="!detail.resumeGenerated" @click="$emit('add-bid', detail)">加入投标包</el-button>
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
import { CERT_TYPE, CERT_STATUS_TAG, labelOf } from '../option/dict';
import { previewBidFile } from '@/views/poms/phase1/utils/mockFile';
import { projectCasesToText } from '../utils/projectCases';

export default {
  name: 'TalentViewDrawer',
  props: {
    modelValue: { type: Boolean, default: false },
    detail: { type: Object, default: null },
    resume: { type: Object, default: null },
    loading: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'closed', 'edit', 'generate-resume', 'add-bid'],
  data() {
    return {
      activeTab: 'cert',
      certDetailVisible: false,
      certDetail: null,
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
.talent-view {
  padding: 0 4px 24px;
}
.talent-view__hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f0f9eb 0%, #f5f7fa 100%);
}
.talent-view__hero-main {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.talent-view__avatar {
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
.talent-view__code {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}
.talent-view__title {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 600;
}
.talent-view__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.talent-view__hero-stats {
  display: flex;
  gap: 20px;
  flex-shrink: 0;
}
.talent-view__stat {
  text-align: center;
  min-width: 64px;
}
.talent-view__stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2c7be5;
  line-height: 1.2;
}
.talent-view__stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
.talent-view__section {
  margin-bottom: 16px;
  border-radius: 8px;
  :deep(.el-card__header) {
    padding: 12px 16px;
    background: var(--el-fill-color-light);
  }
}
.talent-view__section-title {
  font-weight: 600;
}
.talent-view__tabs {
  margin-bottom: 16px;
}
.talent-view__tab-badge {
  margin-left: 6px;
}
.talent-view__table {
  width: 100%;
}
.talent-view__block {
  margin-bottom: 16px;
}
.talent-view__block-title {
  font-weight: 600;
  margin-bottom: 8px;
}
.talent-view__muted {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.talent-view__project-cases {
  white-space: pre-line;
  line-height: 1.8;
  color: var(--el-text-color-regular);
  font-size: 14px;
}
.talent-view__empty {
  padding: 20px;
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.talent-view__actions {
  position: sticky;
  bottom: 0;
  padding: 16px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}
</style>

<style lang="scss">
.talent-view-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 20px 0;
  }
  .el-drawer__body {
    padding: 12px 20px 20px;
  }
}
</style>
