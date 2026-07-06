<template>
  <basic-container>
    <el-row :gutter="12" class="talent-stat-row">
      <el-col :span="6">
        <div class="talent-stat-card">
          <div class="talent-stat-card__title">人才总数</div>
          <div class="talent-stat-card__value">{{ stats.hired || 0 }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="talent-stat-card">
          <div class="talent-stat-card__title">已生成简历</div>
          <div class="talent-stat-card__value">{{ resumeReadyCount }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="talent-stat-card">
          <div class="talent-stat-card__title">持证人才</div>
          <div class="talent-stat-card__value">{{ stats.certHolders || 0 }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="talent-stat-card">
          <div class="talent-stat-card__title">证书即将过期</div>
          <div class="talent-stat-card__value talent-stat-card__value--warn">{{ stats.certExpiring || 0 }}</div>
        </div>
      </el-col>
    </el-row>

    <avue-crud
      ref="crud"
      v-model:page="page"
      v-model:search="search"
      v-model="form"
      :option="option"
      :table-loading="loading"
      :data="data"
      :before-open="beforeOpen"
      @row-update="rowUpdate"
      @search-change="searchChange"
      @search-reset="searchReset"
      @current-change="currentChange"
      @size-change="sizeChange"
      @refresh-change="refreshChange"
      @on-load="onLoad"
    >
      <template #code="{ row }">
        <el-link type="primary" @click="openView(row)">{{ row.code }}</el-link>
      </template>
      <template #certCount="{ row }">
        <el-badge v-if="row.certExpiringCount" :value="row.certExpiringCount" type="warning">
          <span>{{ row.certCount || 0 }}</span>
        </el-badge>
        <span v-else>{{ row.certCount || 0 }}</span>
      </template>
      <template #menu="{ row, size }">
        <el-button type="primary" link :size="size" @click="openView(row)">查看</el-button>
        <el-button type="primary" link :size="size" @click="openEdit(row)">编辑</el-button>
      </template>
      <template #certificateBindings-form>
        <talent-cert-panel v-model="form.certificateBindings" />
      </template>
    </avue-crud>

    <talent-view-drawer
      v-model="viewVisible"
      :detail="viewDetail"
      :resume="viewResume"
      :loading="viewLoading"
      @edit="editFromView"
      @generate-resume="handleGenerateResume"
      @add-bid="handleAddBid"
      @closed="onViewClosed"
    />
  </basic-container>
</template>

<script>
import TalentViewDrawer from '../components/TalentViewDrawer.vue';
import TalentCertPanel from '../components/TalentCertPanel.vue';
import { Option } from '../option/talent';
import { EDUCATION_LEVEL } from '../option/dict';
import { getPage, getDetail, update, generateTalentResume, addToBid } from '@/api/poms/phase4/talent';
import { getResumeTemplateOptions } from '@/api/poms/phase4/resume';
import { getPage as getResumePage } from '@/api/poms/phase4/resume';
import { getStats } from '@/api/poms/phase4/phase4Store';
import { pickResumeTemplate } from '../utils/pickTemplate';
import { projectCasesToText } from '../utils/projectCases';

export default {
  components: { TalentViewDrawer, TalentCertPanel },
  data() {
    return {
      form: {},
      search: {},
      query: {},
      loading: false,
      page: { pageSize: 10, currentPage: 1, total: 0 },
      option: Option(this),
      data: [],
      viewVisible: false,
      viewDetail: null,
      viewResume: null,
      viewLoading: false,
      resumeTemplates: [],
      stats: {},
      resumeReadyCount: 0,
    };
  },
  mounted() {
    getResumeTemplateOptions().then(res => {
      this.resumeTemplates = res.data.data || [];
    });
    this.loadStats();
    const col = this.findObject(this.option.column, 'education');
    if (col) col.dicData = EDUCATION_LEVEL;
    const { talentId } = this.$route.query;
    if (talentId) this.openViewById(String(talentId));
  },
  methods: {
    loadStats() {
      this.stats = getStats();
      this.resumeReadyCount = (this.data || []).filter(item => item.resumeGenerated).length;
    },
    openView(row) {
      this.viewLoading = true;
      this.viewVisible = true;
      this.viewResume = null;
      getDetail(row.id)
        .then(res => {
          this.viewDetail = { ...res.data.data };
          return getResumePage(1, 1, { memberId: row.id });
        })
        .then(res => {
          this.viewResume = res.data.data.records?.[0] || null;
        })
        .finally(() => {
          this.viewLoading = false;
        });
    },
    openViewById(id) {
      getDetail(id).then(res => {
        if (res.data.data) this.openView(res.data.data);
      });
    },
    onViewClosed() {
      this.viewDetail = null;
      this.viewResume = null;
    },
    openEdit(row) {
      const index = this.data.findIndex(item => item.id === row.id);
      getDetail(row.id).then(res => {
        const data = res.data.data;
        this.form = {
          ...data,
          skillsText: (data.skills || []).join(', '),
          projectCasesText: projectCasesToText(data.projectCases),
          certificateBindings: data.certificateBindings || [],
        };
        this.$nextTick(() => {
          this.$refs.crud.rowEdit(this.form, index >= 0 ? index : 0);
        });
      });
    },
    editFromView(detail) {
      this.viewVisible = false;
      this.openEdit(detail);
    },
    beforeOpen(done, type) {
      if (type === 'edit') {
        getDetail(this.form.id).then(res => {
          const row = res.data.data;
          this.form = {
            ...row,
            skillsText: (row.skills || []).join(', '),
            projectCasesText: projectCasesToText(row.projectCases),
            certificateBindings: row.certificateBindings || [],
          };
          this.$nextTick(() => done());
        });
        return;
      }
      done();
    },
    rowUpdate(row, index, done, loading) {
      update(row)
        .then(() => {
          this.onLoad(this.page);
          this.loadStats();
          this.$message.success('档案已更新');
          done();
        })
        .finally(() => loading());
    },
    handleGenerateResume(detail) {
      pickResumeTemplate(this.resumeTemplates)
        .then(templateId => {
          generateTalentResume(detail.id, templateId).then(() => {
            this.openView(detail);
            this.onLoad(this.page);
            this.loadStats();
            this.$message.success('简历已生成');
          });
        })
        .catch(err => {
          if (err === 'no-template') {
            this.$confirm('暂无简历模板，是否前往模板管理上传？', '提示').then(() => {
              this.$router.push('/poms/phase4/template');
            });
          }
        });
    },
    handleAddBid(detail) {
      addToBid(detail.id).then(res => {
        this.$message.success(`已加入投标包：${res.data.data?.code || ''}`);
        this.$router.push({ path: '/poms/phase4/bid', query: { packageId: res.data.data?.id } });
      });
    },
    searchReset() {
      this.query = {};
      this.onLoad(this.page);
    },
    searchChange(params, done) {
      this.query = params;
      this.page.currentPage = 1;
      this.onLoad(this.page);
      done();
    },
    currentChange(p) {
      this.page.currentPage = p;
    },
    sizeChange(s) {
      this.page.pageSize = s;
    },
    refreshChange() {
      this.onLoad(this.page);
    },
    onLoad(page) {
      this.loading = true;
      getPage(page.currentPage, page.pageSize, this.query)
        .then(res => {
          const d = res.data.data;
          this.page.total = d.total;
          this.data = d.records;
          this.resumeReadyCount = this.data.filter(item => item.resumeGenerated).length;
          this.loadStats();
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.talent-stat-row {
  margin-bottom: 12px;
}
.talent-stat-card {
  height: 88px;
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: #fff;
  box-sizing: border-box;
}
.talent-stat-card__title {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 10px;
}
.talent-stat-card__value {
  font-size: 28px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1;
}
.talent-stat-card__value--warn {
  color: #e6a23c;
}
</style>
