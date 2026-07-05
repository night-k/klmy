<template>
  <basic-container>
    <el-tabs v-model="tabSource" @tab-change="onSourceTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="自动归档" name="auto" />
      <el-tab-pane label="手工上传" name="manual" />
    </el-tabs>
    <div class="table-toolbar">
      <el-button type="primary" @click="uploadVisible = true">手工上传</el-button>
      <el-button @click="syncNow">同步归档</el-button>
    </div>
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
      <template #code="{ row, size }">
        <el-button link type="primary" :size="size" @click="openDetail(row)">{{ row.code }}</el-button>
      </template>
      <template #docType="{ row }">
        <el-tag size="small" :type="DOC_TYPE_TAG[row.docType]">{{ labelOf(DOC_TYPE, row.docType) }}</el-tag>
      </template>
      <template #sourceType="{ row }">
        <el-tag size="small" :type="row.sourceType === 'auto' ? 'success' : 'info'">{{ labelOf(SOURCE_TYPE, row.sourceType) }}</el-tag>
      </template>
      <template #permissionScope="{ row }">
        {{ labelOf(PERMISSION_SCOPE, row.permissionScope) }}
      </template>
      <template #menu="{ row, size }">
        <el-button link type="primary" :size="size" @click="openDetail(row)">预览</el-button>
        <el-button link type="primary" :size="size" @click="goSearch(row.name)">检索相似</el-button>
      </template>
    </avue-crud>

    <document-view-drawer v-model="drawerVisible" :detail="viewDetail" :loading="viewLoading" @closed="viewDetail = {}" />

    <el-dialog v-model="uploadVisible" title="手工上传文档" width="560px" append-to-body destroy-on-close>
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="文档名称" required><el-input v-model="uploadForm.name" /></el-form-item>
        <el-form-item label="文档类型" required>
          <el-select v-model="uploadForm.docType" style="width: 100%">
            <el-option v-for="d in DOC_TYPE" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="文件格式" required>
          <el-select v-model="uploadForm.fileFormat" style="width: 100%">
            <el-option v-for="d in FILE_FORMAT" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限范围">
          <el-select v-model="uploadForm.permissionScope" style="width: 100%">
            <el-option v-for="d in PERMISSION_SCOPE" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="自定义标签">
          <el-input v-model="uploadForm.customTags" placeholder="逗号分隔，如：投标可复用,优秀范本" />
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="uploadForm.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUpload">上传</el-button>
      </template>
    </el-dialog>
  </basic-container>
</template>

<script>
import DocumentViewDrawer from '../components/DocumentViewDrawer.vue';
import { Option } from '../option/document';
import { DOC_TYPE, FILE_FORMAT, PERMISSION_SCOPE, SOURCE_TYPE, DOC_TYPE_TAG, labelOf } from '../option/dict';
import { getPage, getDetail, add } from '@/api/poms/phase3/document';
import { syncApprovedDeliverables } from '@/api/poms/phase3/phase3Store';
import listPageMixin from '../../phase2/utils/listPageMixin';

export default {
  components: { DocumentViewDrawer },
  mixins: [listPageMixin],
  data() {
    return {
      option: Option(),
      DOC_TYPE,
      FILE_FORMAT,
      PERMISSION_SCOPE,
      SOURCE_TYPE,
      DOC_TYPE_TAG,
      labelOf,
      tabSource: '',
      drawerVisible: false,
      viewDetail: {},
      viewLoading: false,
      uploadVisible: false,
      uploadForm: {
        name: '',
        docType: 'other',
        fileFormat: 'pdf',
        permissionScope: 'public',
        customTags: '',
        remark: '',
        version: 'v1.0',
        fileSize: '1.0 MB',
        allowDownload: true,
      },
    };
  },
  mounted() {
    syncApprovedDeliverables();
    if (this.$route.query.sourceType) {
      this.tabSource = String(this.$route.query.sourceType);
    }
    if (this.$route.query.tag) {
      this.query.tag = String(this.$route.query.tag);
    }
    if (this.$route.query.docType) {
      this.query.docType = String(this.$route.query.docType);
    }
  },
  methods: {
    onLoad(page) {
      this.loading = true;
      const params = { ...this.query };
      if (this.tabSource) params.sourceType = this.tabSource;
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
    onSourceTabChange() {
      this.page.currentPage = 1;
      this.onLoad(this.page);
    },
    syncNow() {
      syncApprovedDeliverables();
      this.$message.success('已同步 Phase2 审核通过的成果物');
      this.onLoad(this.page);
    },
    openDetail(row) {
      this.viewLoading = true;
      this.drawerVisible = true;
      getDetail(row.id)
        .then(res => {
          this.viewDetail = res.data.data || row;
        })
        .finally(() => {
          this.viewLoading = false;
        });
    },
    goSearch(name) {
      this.$router.push({ path: '/poms/phase3/search', query: { q: name } });
    },
    submitUpload() {
      if (!this.uploadForm.name) {
        this.$message.warning('请填写文档名称');
        return;
      }
      const tags = this.uploadForm.customTags
        ? this.uploadForm.customTags
            .split(/[,，]/)
            .map(s => s.trim())
            .filter(Boolean)
        : [];
      add({
        ...this.uploadForm,
        tags,
        contentIndex: `${this.uploadForm.name} ${this.uploadForm.remark || ''}`,
      }).then(() => {
        this.$message.success('上传成功');
        this.uploadVisible = false;
        this.uploadForm = { name: '', docType: 'other', fileFormat: 'pdf', permissionScope: 'public', customTags: '', remark: '', version: 'v1.0', fileSize: '1.0 MB', allowDownload: true };
        this.onLoad(this.page);
      });
    },
  },
};
</script>

<style scoped>
.table-toolbar {
  margin-bottom: 8px;
  display: flex;
  gap: 8px;
}
</style>
