<template>
  <div class="deliverable-tab">
    <el-button type="primary" style="margin-bottom: 12px" @click="openAdd">上传成果物</el-button>
    <el-table :data="displayList" border>
      <el-table-column prop="name" label="成果物名称" min-width="160">
        <template #default="{ row }">
          {{ row.name }}
          <el-tag v-if="row.isCurrent !== false" size="small" type="success" style="margin-left: 6px">当前</el-tag>
          <el-tag v-else size="small" type="info" style="margin-left: 6px">历史</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="version" label="版本" width="80" />
      <el-table-column label="审核状态" width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="auditTag(row.auditStatus)">
            {{ labelOf(DELIVERABLE_AUDIT_STATUS, row.auditStatus) || '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="uploaderName" label="上传人" width="90" />
      <el-table-column prop="uploadTime" label="上传时间" width="160" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.isCurrent !== false && row.auditStatus === 'draft'" link type="primary" @click="submitAudit(row)"> 提交审核 </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" title="上传成果物" width="480px" append-to-body>
      <el-form :model="form" label-width="90px">
        <el-form-item v-if="!taskId" label="关联任务">
          <el-select v-model="form.taskId" style="width: 100%">
            <el-option v-for="t in projectTasks" :key="t.id" :label="t.taskName" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="版本"><el-input v-model="form.version" /></el-form-item>
        <el-form-item label="附件">
          <el-upload v-model:file-list="fileList" action="#" :auto-upload="false" multiple>
            <el-button type="primary" plain>选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getPage, add, submitForReview } from '@/api/poms/phase2/deliverable';
import { getPage as getTasks } from '@/api/poms/phase2/task';
import { DELIVERABLE_AUDIT_STATUS, labelOf } from '../../option/dict';

export default {
  props: {
    projectId: { type: String, required: true },
    taskId: { type: String, default: '' },
  },
  data() {
    return {
      DELIVERABLE_AUDIT_STATUS,
      list: [],
      projectTasks: [],
      dialogVisible: false,
      fileList: [],
      saving: false,
      form: { taskId: '', name: '', version: 'v1.0' },
    };
  },
  computed: {
    displayList() {
      if (!this.taskId) return this.list;
      return this.list.filter(d => d.taskId === this.taskId);
    },
  },
  watch: {
    projectId: {
      immediate: true,
      handler() {
        this.load();
      },
    },
    taskId() {
      this.load();
    },
  },
  methods: {
    labelOf,
    auditTag(status) {
      if (status === 'approved') return 'success';
      if (status === 'rejected') return 'danger';
      return 'warning';
    },
    load() {
      const params = { projectId: this.projectId };
      if (this.taskId) params.taskId = this.taskId;
      getPage(1, 100, params).then(res => {
        this.list = res.data.data.records;
      });
      getTasks(1, 100, { projectId: this.projectId }).then(res => {
        this.projectTasks = res.data.data.records;
      });
    },
    openAdd() {
      this.openWithTask(this.taskId || this.projectTasks[0]?.id || '');
    },
    openWithTask(taskId) {
      this.form = { taskId: taskId || '', name: '', version: 'v1.0' };
      this.fileList = [];
      this.dialogVisible = true;
    },
    save() {
      if (!this.form.taskId || !this.form.name) {
        this.$message.warning('请填写任务与成果物名称');
        return;
      }
      const task = this.projectTasks.find(t => t.id === this.form.taskId);
      const files = (this.fileList || []).map(f => ({ name: f.name, url: f.url || '#' }));
      this.saving = true;
      add({
        ...this.form,
        projectId: this.projectId,
        fileType: 'report',
        auditStatus: 'draft',
        uploaderName: task?.assigneeName || '当前用户',
        uploadTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        files,
      })
        .then(() => {
          this.$message.success('成果物已上传（同名旧版本已归档）');
          this.dialogVisible = false;
          this.load();
        })
        .finally(() => {
          this.saving = false;
        });
    },
    submitAudit(row) {
      this.$confirm('确认提交该成果物审核？', '提交审核', { type: 'info' })
        .then(() => {
          submitForReview(row.id).then(() => {
            this.$message.success('已提交审核');
            this.load();
          });
        })
        .catch(() => {});
    },
  },
};
</script>
