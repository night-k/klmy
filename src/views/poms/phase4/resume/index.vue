<template>
  <basic-container>
    <el-tabs v-model="tabType" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="候选人" name="candidate" />
      <el-tab-pane label="人才档案" name="talent" />
    </el-tabs>
    <avue-crud
      ref="crud"
      v-model:page="page"
      v-model:search="search"
      :option="option"
      :table-loading="loading"
      :data="data"
      @search-change="searchChange"
      @search-reset="searchReset"
      @current-change="currentChange"
      @size-change="sizeChange"
      @refresh-change="refreshChange"
      @on-load="onLoad"
    >
      <template #menuLeft>
        <el-button type="primary" @click="generateVisible = true">生成简历</el-button>
      </template>
      <template #candidateName="{ row }">
        <el-link type="primary" @click="openView(row)">{{ row.candidateName }}</el-link>
      </template>
      <template #menu="{ row, size }">
        <el-button type="primary" link :size="size" @click="openView(row)">查看</el-button>
      </template>
      <template #memberType="{ row }">
        <el-tag size="small" :type="row.memberType === 'talent' ? 'success' : 'primary'" effect="plain">
          {{ labelOf(RESUME_MEMBER_TYPE, row.memberType) }}
        </el-tag>
      </template>
    </avue-crud>

    <resume-view-drawer v-model="viewVisible" :detail="viewDetail" :loading="viewLoading" @go-bid="goBid" @closed="viewDetail = null" />

    <resume-generate-drawer v-model="generateVisible" :members="eligibleMembers" :templates="resumeTemplates" :submitting="generateLoading" @submit="handleGenerate" />
  </basic-container>
</template>

<script>
import ResumeViewDrawer from '../components/ResumeViewDrawer.vue';
import ResumeGenerateDrawer from '../components/ResumeGenerateDrawer.vue';
import { Option } from '../option/resume';
import { RESUME_MEMBER_TYPE, labelOf } from '../option/dict';
import { getPage, getDetail, getEligibleMembers, generate, getResumeTemplateOptions } from '@/api/poms/phase4/resume';

export default {
  components: { ResumeViewDrawer, ResumeGenerateDrawer },
  data() {
    return {
      search: {},
      query: {},
      loading: false,
      page: { pageSize: 10, currentPage: 1, total: 0 },
      option: Option(this),
      data: [],
      tabType: '',
      viewVisible: false,
      viewDetail: null,
      viewLoading: false,
      generateVisible: false,
      generateLoading: false,
      eligibleMembers: [],
      resumeTemplates: [],
      RESUME_MEMBER_TYPE,
      labelOf,
    };
  },
  mounted() {
    getEligibleMembers().then(res => {
      this.eligibleMembers = res.data.data || [];
    });
    getResumeTemplateOptions().then(res => {
      this.resumeTemplates = res.data.data || [];
    });
  },
  methods: {
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
    goBid() {
      this.$router.push('/poms/phase4/bid');
    },
    handleGenerate({ memberId, templateId }) {
      this.generateLoading = true;
      generate(memberId, templateId)
        .then(() => {
          this.generateVisible = false;
          this.onLoad(this.page);
          this.$message.success('简历已生成');
          this.$confirm('是否前往投标包？', '提示').then(() => this.$router.push('/poms/phase4/bid'));
        })
        .finally(() => {
          this.generateLoading = false;
        });
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
      if (this.tabType) q.memberType = this.tabType;
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
