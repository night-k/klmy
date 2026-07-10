<template>
  <el-drawer v-model="visible" :title="drawerTitle" :size="size" append-to-body destroy-on-close class="poms-crud-form-drawer" @closed="handleClosed">
    <avue-form ref="formRef" v-model="form" :option="computedFormOption">
      <template v-for="(_, slotName) in $slots" #[slotName]="scope">
        <slot :name="slotName" v-bind="scope" :form="form" />
      </template>
    </avue-form>
    <div class="poms-crud-form-drawer__footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
    </div>
  </el-drawer>
</template>

<script>
function filterFormColumns(columns, mode) {
  const flag = mode === 'add' ? 'addDisplay' : 'editDisplay';
  return (columns || [])
    .filter(col => col[flag] !== false)
    .map(col => {
      const next = { ...col, hide: false };
      delete next.search;
      if (col.type === 'dynamic' && col.children?.column) {
        next.children = {
          ...col.children,
          column: col.children.column.map(c => ({ ...c })),
        };
      }
      return next;
    });
}

export default {
  name: 'CrudFormDrawer',
  props: {
    crudOption: { type: Object, required: true },
    size: { type: String, default: '780px' },
    addTitle: { type: String, default: '新增' },
    editTitle: { type: String, default: '编辑' },
  },
  emits: ['save'],
  data() {
    return {
      visible: false,
      saving: false,
      isEdit: false,
      form: {},
    };
  },
  computed: {
    drawerTitle() {
      return this.isEdit ? this.editTitle : this.addTitle;
    },
    computedFormOption() {
      const base = this.crudOption || {};
      return {
        submitBtn: false,
        emptyBtn: false,
        labelWidth: base.labelWidth || 120,
        gutter: base.gutter || 0,
        column: filterFormColumns(base.column, this.isEdit ? 'edit' : 'add'),
      };
    },
  },
  methods: {
    open(record = null) {
      this.isEdit = !!(record && record.id);
      this.form = record ? { ...record } : {};
      this.visible = true;
    },
    setForm(patch) {
      this.form = { ...this.form, ...patch };
    },
    getForm() {
      return this.form;
    },
    handleSave() {
      this.$refs.formRef.validate((valid, done) => {
        if (!valid) {
          if (typeof done === 'function') done();
          return;
        }
        this.saving = true;
        this.$emit('save', { ...this.form }, {
          done: () => {
            this.saving = false;
            this.visible = false;
            if (typeof done === 'function') done();
          },
          loading: () => {
            this.saving = false;
            if (typeof done === 'function') done();
          },
        });
      });
    },
    handleClosed() {
      this.saving = false;
      this.form = {};
      this.isEdit = false;
    },
  },
};
</script>

<style scoped lang="scss">
.poms-crud-form-drawer__footer {
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
.poms-crud-form-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 20px 0;
  }
  .el-drawer__body {
    padding: 12px 20px 20px;
  }
}
</style>
