<template>
  <basic-container>
    <el-tabs v-model="tabType" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="简历模板" name="resume" />
      <el-tab-pane label="投标模板" name="bid" />
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
      <template #code="{ row }">
        <el-link type="primary" @click="openView(row)">{{ row.code }}</el-link>
      </template>
      <template #menu="{ row, size }">
        <el-button type="primary" link :size="size" @click="openView(row)">查看</el-button>
        <el-button type="primary" link :size="size" @click="openEdit(row)">编辑</el-button>
        <el-button type="danger" link :size="size" @click="rowDel(row)">删除</el-button>
      </template>
      <template #type="{ row }">
        <el-tag :type="TEMPLATE_TYPE_TAG[row.type]" size="small">{{ labelOf(TEMPLATE_TYPE, row.type) }}</el-tag>
      </template>
      <template #templateFiles-form>
        <bid-file-panel v-model="form.templateFiles" :limit="1" accept=".doc,.docx,.pdf" upload-label="上传模板文件" hint-text="支持 Word、PDF，单文件不超过 5MB" />
      </template>
    </avue-crud>

    <template-view-drawer v-model="viewVisible" :detail="viewDetail" :loading="viewLoading" @edit="editFromView" @closed="viewDetail = null" />
  </basic-container>
</template>

<script>
import BidFilePanel from '@/views/poms/phase1/components/BidFilePanel.vue';
import TemplateViewDrawer from '../components/TemplateViewDrawer.vue';
import { Option } from '../option/template';
import { TEMPLATE_TYPE, TEMPLATE_TYPE_TAG, TEMPLATE_STATUS, labelOf } from '../option/dict';
import { getPage, getDetail, add, update, remove } from '@/api/poms/phase4/template';

export default {
  components: { BidFilePanel, TemplateViewDrawer },
  data() {
    return {
      form: {},
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
      TEMPLATE_TYPE,
      TEMPLATE_TYPE_TAG,
      TEMPLATE_STATUS,
      labelOf,
    };
  },
  mounted() {
    const { templateId } = this.$route.query;
    if (templateId) this.openViewById(String(templateId));
  },
  methods: {
    openViewById(id) {
      getDetail(id).then(res => {
        if (res.data.data) this.openView(res.data.data);
      });
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
    openEdit(row) {
      const index = this.data.findIndex(item => item.id === row.id);
      getDetail(row.id).then(res => {
        const data = res.data.data;
        this.form = {
          ...data,
          templateFiles: data.templateFile ? [data.templateFile] : [],
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
          const data = res.data.data;
          this.form = {
            ...data,
            templateFiles: data.templateFile ? [data.templateFile] : [],
          };
          this.$nextTick(() => done());
        });
        return;
      }
      if (type === 'add') {
        this.form = {
          type: this.tabType || 'resume',
          status: 'active',
          templateFiles: [],
        };
      }
      done();
    },
    rowSave(row, done, loading) {
      add(row)
        .then(() => {
          this.onLoad(this.page);
          this.$message.success('模板已保存');
          done();
        })
        .finally(() => loading());
    },
    rowUpdate(row, index, done, loading) {
      update(row)
        .then(() => {
          this.onLoad(this.page);
          this.$message.success('模板已更新');
          done();
        })
        .finally(() => loading());
    },
    rowDel(row) {
      this.$confirm('确定删除该模板？')
        .then(() => remove(row.id))
        .then(() => {
          this.onLoad(this.page);
          this.$message.success('删除成功');
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
      if (this.tabType) q.type = this.tabType;
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
