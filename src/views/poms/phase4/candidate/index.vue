<template>
  <basic-container>
    <el-tabs v-model="tabStatus" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="待初筛" name="new" />
      <el-tab-pane label="面试中" name="interview" />
      <el-tab-pane label="待录用" name="offer" />
      <el-tab-pane label="已录用" name="hired" />
      <el-tab-pane label="已淘汰" name="rejected" />
    </el-tabs>
    <avue-crud
      ref="crud"
      v-model:page="page"
      v-model:search="search"
      v-model="form"
      :option="option"
      :table-loading="loading"
      :data="data"
      :before-open="beforeOpen"
      @row-save="rowSave"
      @row-update="rowUpdate"
      @row-del="rowDel"
      @search-change="searchChange"
      @search-reset="searchReset"
      @current-change="currentChange"
      @size-change="sizeChange"
      @refresh-change="refreshChange"
      @on-load="onLoad"
    >
      <template #menuLeft>
        <el-button type="primary" @click="openEmailDialog">招聘邮箱</el-button>
      </template>
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
        <el-button type="danger" link :size="size" @click="rowDel(row)">删除</el-button>
      </template>
      <template #status="{ row }">
        <el-tag :type="CANDIDATE_STATUS_TAG[row.status]" effect="dark" size="small">
          {{ labelOf(CANDIDATE_STATUS, row.status) }}
        </el-tag>
      </template>
      <template #resumeGenerated="{ row }">
        <el-tag v-if="row.resumeGenerated" type="success" size="small">已生成</el-tag>
        <span v-else>-</span>
      </template>
      <template #certificateBindings-form>
        <talent-cert-panel v-model="form.certificateBindings" />
      </template>
    </avue-crud>

    <candidate-view-drawer
      v-model="viewVisible"
      :detail="viewDetail"
      :loading="viewLoading"
      @edit="editFromView"
      @promote="handlePromote"
      @reject="handleReject"
      @generate-resume="handleGenerateResume"
      @add-bid="handleAddBid"
      @go-talent="goTalent"
      @closed="viewDetail = null"
    />

    <email-intake-drawer v-model="emailVisible" :emails="emails" :loading="emailLoading" @intake="handleEmailIntake" @view-candidate="viewFromEmail" />
  </basic-container>
</template>

<script>
import CandidateViewDrawer from '../components/CandidateViewDrawer.vue';
import EmailIntakeDrawer from '../components/EmailIntakeDrawer.vue';
import TalentCertPanel from '../components/TalentCertPanel.vue';
import { Option } from '../option/candidate';
import { CANDIDATE_STATUS, CANDIDATE_STATUS_TAG, EDUCATION_LEVEL, labelOf } from '../option/dict';
import { getPage, getDetail, add, update, remove, promote, reject, generateCandidateResume, addToBid } from '@/api/poms/phase4/candidate';
import { getResumeTemplateOptions } from '@/api/poms/phase4/resume';
import { pickResumeTemplate } from '../utils/pickTemplate';
import { projectCasesToText } from '../utils/projectCases';
import { getPage as getEmailPage, intake } from '@/api/poms/phase4/email';

export default {
  components: { CandidateViewDrawer, EmailIntakeDrawer, TalentCertPanel },
  data() {
    return {
      form: {},
      search: {},
      query: {},
      loading: false,
      page: { pageSize: 10, currentPage: 1, total: 0 },
      option: Option(this),
      data: [],
      tabStatus: '',
      viewVisible: false,
      viewDetail: null,
      viewLoading: false,
      emailVisible: false,
      emails: [],
      emailLoading: false,
      resumeTemplates: [],
      CANDIDATE_STATUS,
      CANDIDATE_STATUS_TAG,
      labelOf,
    };
  },
  mounted() {
    getResumeTemplateOptions().then(res => {
      this.resumeTemplates = res.data.data || [];
    });
    const col = this.findObject(this.option.column, 'education');
    if (col) col.dicData = EDUCATION_LEVEL;
    const { candidateId } = this.$route.query;
    if (candidateId) this.openViewById(String(candidateId));
  },
  methods: {
    formFromDetail(data) {
      return {
        ...data,
        skillsText: (data.skills || []).join(', '),
        projectCasesText: projectCasesToText(data.projectCases),
        certificateBindings: data.certificateBindings || [],
      };
    },
    openView(row) {
      this.viewLoading = true;
      this.viewVisible = true;
      getDetail(row.id)
        .then(res => {
          this.viewDetail = { ...res.data.data };
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
    openEdit(row) {
      const index = this.data.findIndex(item => item.id === row.id);
      getDetail(row.id).then(res => {
        this.form = this.formFromDetail(res.data.data);
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
      const open = () => {
        this.$nextTick(() => done());
      };
      if (type === 'edit') {
        getDetail(this.form.id).then(res => {
          this.form = this.formFromDetail(res.data.data);
          open();
        });
        return;
      }
      if (type === 'add') {
        this.form = {
          source: '手工登记',
          education: '本科',
          experienceYears: 0,
          certificateBindings: [],
        };
      }
      open();
    },
    rowSave(row, done, loading) {
      add(row)
        .then(() => {
          this.onLoad(this.page);
          this.$message.success('登记成功');
          done();
        })
        .finally(() => loading());
    },
    rowUpdate(row, index, done, loading) {
      update(row)
        .then(() => {
          this.onLoad(this.page);
          this.$message.success('更新成功');
          done();
        })
        .finally(() => loading());
    },
    rowDel(row) {
      this.$confirm('确定删除？')
        .then(() => remove(row.id))
        .then(() => {
          this.onLoad(this.page);
          this.$message.success('删除成功');
        });
    },
    handlePromote(detail) {
      promote(detail.id).then(res => {
        getDetail(detail.id).then(r => {
          this.viewDetail = { ...r.data.data };
        });
        this.onLoad(this.page);
        this.$message.success('流程已推进');
        if (res.data.data?.status === 'hired') {
          this.$confirm('已同步人才档案，是否前往查看？', '录用成功', { type: 'success' }).then(() => this.$router.push({ path: '/poms/phase4/talent', query: { talentId: detail.id } }));
        }
      });
    },
    handleReject(detail) {
      this.$prompt('请输入淘汰原因', '淘汰候选人', { inputValue: '不符合当前岗位需求' }).then(({ value }) => {
        reject(detail.id, value).then(res => {
          this.viewDetail = { ...res.data.data };
          this.onLoad(this.page);
          this.$message.success('已淘汰');
        });
      });
    },
    handleGenerateResume(detail) {
      pickResumeTemplate(this.resumeTemplates)
        .then(templateId => {
          generateCandidateResume(detail.id, templateId).then(() => {
            getDetail(detail.id).then(res => {
              this.viewDetail = { ...res.data.data };
            });
            this.onLoad(this.page);
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
    goTalent(detail) {
      this.$router.push({ path: '/poms/phase4/talent', query: { talentId: detail.id } });
    },
    openEmailDialog() {
      this.emailVisible = true;
      this.emailLoading = true;
      getEmailPage(1, 100, {})
        .then(res => {
          this.emails = res.data.data.records || [];
        })
        .finally(() => {
          this.emailLoading = false;
        });
    },
    handleEmailIntake(mail) {
      intake(mail.id).then(res => {
        this.$message.success(`已登记：${res.data.data?.name}`);
        this.openEmailDialog();
        this.onLoad(this.page);
        if (res.data.data) this.openView(res.data.data);
      });
    },
    viewFromEmail(mail) {
      if (mail.candidateId) {
        this.emailVisible = false;
        this.openViewById(mail.candidateId);
      }
    },
    searchReset() {
      this.query = {};
      this.onLoad(this.page);
    },
    onTabChange() {
      this.page.currentPage = 1;
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
      const q = { ...this.query };
      if (this.tabStatus) q.status = this.tabStatus;
      getPage(page.currentPage, page.pageSize, q)
        .then(res => {
          const d = res.data.data;
          this.page.total = d.total;
          this.data = d.records;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
