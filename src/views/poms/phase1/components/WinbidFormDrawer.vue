<template>
  <el-drawer v-model="visible" :title="form.id ? '编辑中标信息' : '登记中标信息'" size="720px" append-to-body destroy-on-close class="winbid-form-drawer" @closed="handleClosed">
    <el-form ref="formRef" :model="form" label-width="120px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="投标编号">
            <el-input v-model="form.tenderCode" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目名称">
            <el-input v-model="form.projectName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="通知书编号" required>
            <el-input v-model.trim="form.noticeNo" placeholder="请输入通知书编号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="中标金额" required>
            <el-input-number v-model="form.winAmount" :min="0" :precision="2" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="中标日期" required>
            <el-date-picker v-model="form.winDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="服务期">
            <el-input v-model.trim="form.servicePeriod" placeholder="例如：12个月" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="履约保证金">
            <el-input-number v-model="form.performanceBond" :min="0" :precision="2" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="中标服务费">
            <el-input-number v-model="form.serviceFee" :min="0" :precision="2" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="中标通知书">
            <bid-file-panel
              v-model="form.noticeFiles"
              upload-label="将中标通知书拖到此处"
              hint-text="支持 PDF、Word、图片，单文件不超过 5MB"
              empty-text="暂无中标通知书"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="winbid-form-drawer__footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">保存中标信息</el-button>
    </div>
  </el-drawer>
</template>

<script>
import BidFilePanel from './BidFilePanel.vue';

export default {
  name: 'WinbidFormDrawer',
  components: { BidFilePanel },
  emits: ['save'],
  data() {
    return {
      visible: false,
      saving: false,
      form: { noticeFiles: [] },
    };
  },
  methods: {
    open(payload) {
      this.form = {
        noticeFiles: [],
        performanceBond: 0,
        serviceFee: 0,
        ...payload,
        noticeFiles: payload?.noticeFiles ? [...payload.noticeFiles] : [],
      };
      this.visible = true;
    },
    handleSave() {
      if (!this.form.noticeNo || !this.form.winAmount || !this.form.winDate) {
        this.$message.warning('请填写通知书编号、中标金额和中标日期');
        return;
      }
      this.saving = true;
      this.$emit('save', { ...this.form, noticeFiles: this.form.noticeFiles || [] }, {
        done: () => {
          this.saving = false;
          this.visible = false;
        },
        loading: () => {
          this.saving = false;
        },
      });
    },
    handleClosed() {
      this.saving = false;
      this.form = { noticeFiles: [] };
    },
  },
};
</script>

<style scoped lang="scss">
.winbid-form-drawer__footer {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  margin-top: 8px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>

<style lang="scss">
.winbid-form-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 20px 0;
  }
  .el-drawer__body {
    padding: 12px 20px 20px;
  }
}
</style>
