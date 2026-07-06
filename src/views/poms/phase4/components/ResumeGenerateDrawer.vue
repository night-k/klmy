<template>
  <el-drawer v-model="visible" title="生成投标简历" size="520px" append-to-body destroy-on-close @closed="onClosed">
    <el-form label-width="90px">
      <el-form-item label="成员" required>
        <el-select v-model="selectedMemberId" placeholder="选择成员" filterable style="width: 100%">
          <el-option v-for="m in members" :key="m.memberId" :label="`${m.name} · ${m.position}`" :value="m.memberId" />
        </el-select>
      </el-form-item>
      <el-form-item label="简历模板" required>
        <el-select v-model="selectedTemplateId" placeholder="选择简历模板" filterable style="width: 100%">
          <el-option v-for="t in templates" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
        <div v-if="!templates.length" class="form-tip">
          暂无可用模板，请先到
          <el-link type="primary" @click="$router.push('/poms/phase4/template')">模板管理</el-link>
          上传
        </div>
      </el-form-item>
    </el-form>
    <div class="drawer-form-actions">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">生成</el-button>
    </div>
  </el-drawer>
</template>

<script>
export default {
  name: 'ResumeGenerateDrawer',
  props: {
    modelValue: { type: Boolean, default: false },
    members: { type: Array, default: () => [] },
    templates: { type: Array, default: () => [] },
    submitting: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'submit', 'closed'],
  data() {
    return { selectedMemberId: '', selectedTemplateId: '' };
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
      if (val && this.templates.length && !this.selectedTemplateId) {
        this.selectedTemplateId = this.templates[0].value;
      }
    },
  },
  methods: {
    onClosed() {
      this.selectedMemberId = '';
      this.selectedTemplateId = '';
      this.$emit('closed');
    },
    handleSubmit() {
      if (!this.selectedMemberId) {
        this.$message.warning('请选择成员');
        return;
      }
      if (!this.selectedTemplateId) {
        this.$message.warning('请选择简历模板');
        return;
      }
      this.$emit('submit', { memberId: this.selectedMemberId, templateId: this.selectedTemplateId });
    },
  },
};
</script>

<style scoped lang="scss">
.drawer-form-actions {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
}
.form-tip {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
