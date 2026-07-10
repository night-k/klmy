<template>
  <el-drawer v-model="visible" title="修改中标结果" size="420px" append-to-body destroy-on-close class="tender-result-drawer" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="中标结果" prop="result">
        <el-select v-model="form.result" placeholder="请选择" style="width: 100%">
          <el-option v-for="item in TENDER_RESULT" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-alert v-if="form.result === 'won'" type="info" :closable="false" show-icon title="标记为中标后，请通过「登记中标」填写中标金额、日期及通知书编号。" />
    </el-form>
    <div class="tender-result-drawer__footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
    </div>
  </el-drawer>
</template>

<script>
import { TENDER_RESULT } from '../option/dict';

export default {
  name: 'TenderResultDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    detail: { type: Object, default: null },
  },
  emits: ['update:modelValue', 'submit'],
  data() {
    return {
      TENDER_RESULT,
      submitting: false,
      form: { result: 'pending' },
      rules: {
        result: [{ required: true, message: '请选择中标结果', trigger: 'change' }],
      },
    };
  },
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
  },
  watch: {
    modelValue(val) {
      if (val && this.detail) this.fillForm();
    },
  },
  methods: {
    fillForm() {
      this.form = { result: this.detail.result || 'pending' };
    },
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return;
        this.submitting = true;
        const payload = { result: this.form.result };
        if (this.form.result !== 'won') {
          payload.winAmount = null;
          payload.winDate = null;
          payload.winNoticeNo = '';
          payload.winbidId = '';
        } else if (this.detail?.result !== 'won') {
          payload.winAmount = null;
          payload.winDate = null;
          payload.winNoticeNo = '';
          payload.winbidId = '';
        }
        this.$emit('submit', payload);
        this.submitting = false;
        this.visible = false;
      });
    },
    handleClosed() {
      this.submitting = false;
    },
  },
};
</script>

<style scoped lang="scss">
.tender-result-drawer__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  margin-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>

<style lang="scss">
.tender-result-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 20px 0;
  }
  .el-drawer__body {
    padding: 12px 20px 20px;
  }
}
</style>
