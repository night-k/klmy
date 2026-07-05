<template>
  <basic-container>
    <el-card shadow="never" class="search-card">
      <div class="search-box">
        <el-input v-model="keyword" placeholder="输入关键字搜索文档名称、标签、正文索引…" clearable size="large" @keyup.enter="doSearch">
          <template #append>
            <el-button type="primary" @click="doSearch">搜索</el-button>
          </template>
        </el-input>
      </div>
      <el-form :inline="true" class="adv-form">
        <el-form-item label="文档类型">
          <el-select v-model="filters.docType" clearable placeholder="全部" style="width: 140px">
            <el-option v-for="d in DOC_TYPE" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="filters.tag" clearable placeholder="标签名" style="width: 140px" />
        </el-form-item>
        <el-form-item label="匹配模式">
          <el-radio-group v-model="filters.mode">
            <el-radio-button label="or">或</el-radio-button>
            <el-radio-button label="and">且</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div v-loading="loading" class="result-list">
      <el-empty v-if="!loading && !results.length" description="输入关键字开始检索" />
      <div v-for="item in results" :key="item.id" class="result-item" @click="openDetail(item)">
        <div class="result-head">
          <span class="result-title" v-html="highlight(item.name)" />
          <el-tag size="small" :type="DOC_TYPE_TAG[item.docType]">{{ labelOf(DOC_TYPE, item.docType) }}</el-tag>
        </div>
        <div v-if="item.hitSnippet" class="result-snippet" v-html="highlight(item.hitSnippet)" />
        <div class="result-meta">
          <span>{{ item.projectName || '无关联项目' }}</span>
          <span>{{ item.uploaderName }} · {{ item.uploadTime }}</span>
          <span>
            <el-tag v-for="t in (item.tags || []).slice(0, 4)" :key="t" size="small" type="info" style="margin-left: 4px">{{ t }}</el-tag>
          </span>
        </div>
      </div>
    </div>

    <el-pagination
      v-if="total > 0"
      v-model:current-page="page.currentPage"
      v-model:page-size="page.pageSize"
      :total="total"
      layout="total, prev, pager, next"
      style="margin-top: 16px; justify-content: flex-end"
      @current-change="doSearch"
    />

    <document-view-drawer v-model="drawerVisible" :detail="viewDetail" @closed="viewDetail = {}" />
  </basic-container>
</template>

<script>
import DocumentViewDrawer from '../components/DocumentViewDrawer.vue';
import { DOC_TYPE, DOC_TYPE_TAG, labelOf } from '../option/dict';
import { search } from '@/api/poms/phase3/search';
import { getDetail } from '@/api/poms/phase3/document';

export default {
  components: { DocumentViewDrawer },
  data() {
    return {
      keyword: '',
      filters: { docType: '', tag: '', mode: 'or' },
      results: [],
      loading: false,
      total: 0,
      page: { currentPage: 1, pageSize: 10 },
      DOC_TYPE,
      DOC_TYPE_TAG,
      labelOf,
      drawerVisible: false,
      viewDetail: {},
    };
  },
  mounted() {
    if (this.$route.query.q) {
      this.keyword = String(this.$route.query.q);
      this.doSearch();
    }
    if (this.$route.query.tag) {
      this.filters.tag = String(this.$route.query.tag);
      this.doSearch();
    }
  },
  methods: {
    doSearch() {
      if (!this.keyword && !this.filters.docType && !this.filters.tag) {
        this.results = [];
        this.total = 0;
        return;
      }
      this.loading = true;
      search({
        keyword: this.keyword,
        docType: this.filters.docType,
        tag: this.filters.tag,
        current: this.page.currentPage,
        size: this.page.pageSize,
      })
        .then(res => {
          const d = res.data.data;
          this.results = d.records;
          this.total = d.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    resetFilters() {
      this.filters = { docType: '', tag: '', mode: 'or' };
      this.doSearch();
    },
    highlight(text) {
      if (!text || !this.keyword) return text || '';
      const kw = this.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return String(text).replace(new RegExp(kw, 'gi'), m => `<mark>${m}</mark>`);
    },
    openDetail(item) {
      getDetail(item.id).then(res => {
        this.viewDetail = res.data.data || item;
        this.drawerVisible = true;
      });
    },
  },
};
</script>

<style scoped>
.search-card {
  margin-bottom: 16px;
}
.search-box {
  max-width: 720px;
  margin-bottom: 12px;
}
.adv-form {
  margin-top: 8px;
}
.result-item {
  padding: 14px 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: border-color 0.2s;
  &:hover {
    border-color: #409eff;
    background: #f5faff;
  }
}
.result-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.result-title {
  font-weight: 600;
  color: #303133;
  flex: 1;
}
.result-snippet {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  line-height: 1.5;
}
.result-meta {
  font-size: 12px;
  color: #909399;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
:deep(mark) {
  background: #ffe58f;
  padding: 0 2px;
}
</style>
