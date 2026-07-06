<template>
  <div class="talent-cert-panel">
    <div class="talent-cert-panel__toolbar">
      <span class="talent-cert-panel__count"
        >已添加 <strong>{{ lines.length }}</strong> 个证书</span
      >
      <el-button type="primary" plain size="small" @click="openEditor('add')">添加证书</el-button>
    </div>

    <div v-if="editorVisible" class="talent-cert-panel__editor">
      <div class="talent-cert-panel__editor-title">{{ editorMode === 'edit' ? '编辑证书' : '添加证书' }}</div>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="证书名称" required label-width="90px">
            <el-select v-model="draft.certificateId" placeholder="请选择" filterable clearable style="width: 100%" @change="onCertChange">
              <el-option v-for="c in availableOptions" :key="c.id" :label="c.certName" :value="c.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="证书编号" required label-width="90px">
            <el-input v-model.trim="draft.certNo" placeholder="请输入证书编号" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="发证机关" required label-width="90px">
            <el-input v-model.trim="draft.issuingAuthority" placeholder="如：应急管理局" maxlength="100" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="发证日期" required label-width="90px">
            <el-date-picker v-model="draft.issueDate" type="date" value-format="YYYY-MM-DD" placeholder="年 / 月 / 日" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="有效期至" required label-width="90px">
            <el-date-picker v-model="draft.validTo" type="date" value-format="YYYY-MM-DD" placeholder="年 / 月 / 日" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="证书附件" label-width="90px">
            <el-upload :auto-upload="false" :limit="1" accept=".pdf,.jpg,.jpeg,.png" :file-list="draft.attachFileList" :on-change="onAttachChange" :on-remove="onAttachRemove">
              <el-button size="small">选择文件</el-button>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
      <div class="talent-cert-panel__editor-actions">
        <el-button size="small" @click="cancelEditor">取消</el-button>
        <el-button type="primary" size="small" @click="saveDraft">保存证书</el-button>
      </div>
    </div>

    <div v-if="lines.length" class="talent-cert-panel__list">
      <div v-for="(line, index) in lines" :key="line._key" class="talent-cert-panel__card">
        <div class="talent-cert-panel__card-icon">
          <el-icon><medal /></el-icon>
        </div>
        <div class="talent-cert-panel__card-body">
          <div class="talent-cert-panel__card-title">{{ line.certName || '-' }}</div>
          <div class="talent-cert-panel__card-meta">证书编号：{{ line.certNo || '-' }} | 发证机关：{{ line.issuingAuthority || '-' }}</div>
          <div class="talent-cert-panel__card-meta">有效期：{{ line.issueDate || '-' }} 至 {{ line.validTo || '-' }}</div>
        </div>
        <div class="talent-cert-panel__card-actions">
          <el-tag :type="CERT_STATUS_TAG[line.status] || 'info'" size="small" effect="light">{{ line.status || '正常' }}</el-tag>
          <el-button v-if="line.attach" link type="primary" @click="previewAttach(line)">预览附件</el-button>
          <el-button v-if="!readonly" link type="primary" @click="openEditor('edit', index)">编辑</el-button>
          <el-button v-if="!readonly" link type="danger" @click="removeLine(index)">删除</el-button>
        </div>
      </div>
    </div>
    <div v-else-if="!editorVisible" class="talent-cert-panel__empty">点击「添加证书」录入资质信息（证书选项来自证书管理规则 Mock）</div>
  </div>
</template>

<script>
import { Medal } from '@element-plus/icons-vue';
import { getCatalog } from '@/api/poms/phase4/certificate';
import { calcCertStatus } from '@/api/poms/phase4/phase4Store';
import { CERT_STATUS_TAG } from '../option/dict';
import { mockUploadBidFile, previewBidFile } from '@/views/poms/phase1/utils/mockFile';

function createEmptyDraft() {
  return {
    _key: '',
    certificateId: '',
    certName: '',
    certType: '',
    certNo: '',
    issuingAuthority: '',
    issueDate: '',
    validTo: '',
    status: '正常',
    attach: null,
    attachFileList: [],
  };
}

export default {
  name: 'TalentCertPanel',
  components: { Medal },
  props: {
    modelValue: { type: Array, default: () => [] },
    readonly: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      catalog: [],
      editorVisible: false,
      editorMode: 'add',
      editingIndex: -1,
      draft: createEmptyDraft(),
      CERT_STATUS_TAG,
    };
  },
  computed: {
    lines: {
      get() {
        return this.modelValue || [];
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
    availableOptions() {
      const selected = new Set(this.lines.map(item => item.certificateId).filter(Boolean));
      if (this.editorMode === 'edit' && this.draft.certificateId) {
        selected.delete(this.draft.certificateId);
      }
      return this.catalog.filter(item => !selected.has(item.id));
    },
  },
  mounted() {
    getCatalog().then(res => {
      this.catalog = res.data.data || [];
    });
  },
  methods: {
    onCertChange(id) {
      const item = this.catalog.find(c => c.id === id);
      this.draft.certName = item?.certName || '';
      this.draft.certType = item?.certType || '';
    },
    openEditor(mode, index = -1) {
      if (this.readonly) return;
      this.editorMode = mode;
      this.editingIndex = index;
      if (mode === 'edit' && index >= 0) {
        const source = this.lines[index];
        this.draft = {
          ...createEmptyDraft(),
          ...source,
          attachFileList: source.attach ? [{ name: source.attach.name, url: source.attach.dataUrl }] : [],
        };
      } else {
        this.draft = createEmptyDraft();
        this.draft._key = `tb-${Date.now()}`;
      }
      this.editorVisible = true;
    },
    cancelEditor() {
      this.editorVisible = false;
      this.draft = createEmptyDraft();
    },
    async onAttachChange(file) {
      if (!file?.raw) return;
      try {
        const uploaded = await mockUploadBidFile(file.raw);
        this.draft.attach = uploaded;
        this.draft.attachFileList = [{ name: uploaded.name, url: uploaded.dataUrl }];
      } catch (e) {
        this.$message.error(e.message || '附件上传失败');
      }
    },
    onAttachRemove() {
      this.draft.attach = null;
      this.draft.attachFileList = [];
    },
    saveDraft() {
      if (!this.draft.certificateId) {
        this.$message.warning('请选择证书名称');
        return;
      }
      if (!this.draft.certNo || !this.draft.issuingAuthority || !this.draft.issueDate || !this.draft.validTo) {
        this.$message.warning('请完整填写证书信息');
        return;
      }
      if (this.draft.issueDate > this.draft.validTo) {
        this.$message.warning('发证日期不能晚于有效期');
        return;
      }
      const item = {
        ...this.draft,
        status: calcCertStatus(this.draft.validTo),
      };
      const next = [...this.lines];
      if (this.editorMode === 'edit' && this.editingIndex >= 0) {
        next.splice(this.editingIndex, 1, item);
      } else {
        next.push(item);
      }
      this.lines = next;
      this.cancelEditor();
    },
    removeLine(index) {
      const next = [...this.lines];
      next.splice(index, 1);
      this.lines = next;
    },
    previewAttach(line) {
      if (line.attach) previewBidFile(line.attach);
    },
  },
};
</script>

<style scoped lang="scss">
.talent-cert-panel {
  width: 100%;
}
.talent-cert-panel__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.talent-cert-panel__count {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.talent-cert-panel__editor {
  padding: 16px;
  margin-bottom: 12px;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}
.talent-cert-panel__editor-title {
  margin-bottom: 12px;
  font-weight: 600;
}
.talent-cert-panel__editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.talent-cert-panel__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.talent-cert-panel__card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: #fff;
}
.talent-cert-panel__card-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef8e8;
  color: #62b63e;
  font-size: 20px;
  flex-shrink: 0;
}
.talent-cert-panel__card-body {
  flex: 1;
  min-width: 0;
}
.talent-cert-panel__card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}
.talent-cert-panel__card-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}
.talent-cert-panel__card-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 8px;
  flex-shrink: 0;
}
.talent-cert-panel__empty {
  padding: 24px;
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
}
</style>
