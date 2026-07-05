<template>
  <basic-container>
    <el-tabs v-model="tabDimension" @tab-change="onDimTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane v-for="d in TAG_DIMENSION" :key="d.value" :label="d.label" :name="d.value" />
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
      <template #dimension="{ row }">{{ labelOf(TAG_DIMENSION, row.dimension) }}</template>
      <template #system="{ row }">
        <el-tag size="small" :type="row.system ? 'info' : 'success'">{{ row.system ? '系统' : '自定义' }}</el-tag>
      </template>
      <template #menu="{ row, size }">
        <template v-if="!row.system">
          <el-button link type="primary" :size="size" @click="$refs.crud.rowEdit(row)">编辑</el-button>
          <el-button link type="danger" :size="size" @click="rowDel(row)">删除</el-button>
        </template>
        <el-button link type="primary" :size="size" @click="goDocs(row)">查看文档</el-button>
      </template>
    </avue-crud>
  </basic-container>
</template>

<script>
import { Option } from '../option/tag';
import { TAG_DIMENSION, labelOf } from '../option/dict';
import { getPage, add, update, remove } from '@/api/poms/phase3/tag';

export default {
  data() {
    return {
      form: {},
      search: {},
      query: {},
      loading: false,
      page: { pageSize: 10, currentPage: 1, total: 0 },
      option: Option(),
      data: [],
      tabDimension: '',
      TAG_DIMENSION,
      labelOf,
    };
  },
  methods: {
    onLoad(page) {
      this.loading = true;
      const params = { ...this.query };
      if (this.tabDimension) params.dimension = this.tabDimension;
      getPage(page.currentPage, page.pageSize, params)
        .then(res => {
          const d = res.data.data;
          this.page.total = d.total;
          this.data = d.records;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    onDimTabChange() {
      this.page.currentPage = 1;
      this.onLoad(this.page);
    },
    beforeOpen(done, type) {
      if (type === 'edit' && this.form.system) return;
      done();
    },
    rowSave(row, done, loading) {
      add(row)
        .then(() => {
          this.$message.success('标签已创建');
          this.onLoad(this.page);
          done();
        })
        .catch(() => loading());
    },
    rowUpdate(row, index, done, loading) {
      update(row)
        .then(() => {
          this.$message.success('已更新');
          this.onLoad(this.page);
          done();
        })
        .catch(() => loading());
    },
    rowDel(row) {
      if (row.system) return;
      this.$confirm('确定删除该标签？', '提示', { type: 'warning' }).then(() => {
        remove(row.id).then(() => {
          this.$message.success('已删除');
          this.onLoad(this.page);
        });
      });
    },
    searchChange(params, done) {
      this.query = { ...params };
      this.page.currentPage = 1;
      this.onLoad(this.page);
      done();
    },
    searchReset() {
      this.query = {};
      this.onLoad(this.page);
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
    goDocs(row) {
      this.$router.push({ path: '/poms/phase3/document', query: { tag: row.name } });
    },
  },
};
</script>
