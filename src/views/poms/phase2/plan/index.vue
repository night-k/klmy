<template>
  <basic-container>
    <vxe-grid ref="gridRef" v-bind="gridOptions" @form-submit="handleSearch" @form-reset="handleReset">
      <template #status="{ row }">
        <el-tag v-if="row.status === 'active'" type="primary">已生效</el-tag>
        <el-tag v-else type="warning">草稿</el-tag>
      </template>
      <template #planRange="{ row }">{{ row.planStartDate }} ~ {{ row.planEndDate }}</template>
      <template #taskCount="{ row }">{{ (row.tasks || []).length }}</template>
      <template #operation="{ row }">
        <vxe-button type="text" status="primary" @click.stop="handleEdit(row)">编辑</vxe-button>
        <vxe-button v-if="row.status !== 'active'" type="text" status="success" @click.stop="handleActivate(row)">计划生效</vxe-button>
        <vxe-button v-if="row.status === 'active'" type="text" status="warning" @click.stop="handleArchive(row)">作废</vxe-button>
      </template>
      <template #action-buttons>
        <el-button type="primary" @click="handleAdd">新增计划</el-button>
      </template>
    </vxe-grid>

    <plan-edit-dialog ref="dialogRef" @success="handleDialogSuccess" />
  </basic-container>
</template>

<script>
import { reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import PlanEditDialog from './components/plan-edit-dialog.vue';
import { getPage, activate, archive } from '@/api/poms/phase2/plan';

export default {
  components: { PlanEditDialog },
  setup() {
    const gridRef = ref();
    const dialogRef = ref();

    const gridOptions = reactive({
      border: true,
      height: 'auto',
      showOverflow: true,
      rowConfig: { keyField: 'id', isHover: true },
      columnConfig: { resizable: true },
      pagerConfig: {
        currentPage: 1,
        pageSize: 10,
        pageSizes: [10, 20, 50],
        layouts: ['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total'],
        total: 0,
      },
      proxyConfig: {
        ajax: {
          query: async ({ page, form }) => {
            try {
              const params = { ...form };
              if (params.status && Array.isArray(params.status)) {
                params.status = params.status.join(',');
              }
              const res = await getPage(page.currentPage, page.pageSize, params);
              const d = res.data.data;
              return { page: { total: d.total }, result: d.records };
            } catch (e) {
              return { page: { total: 0 }, result: [] };
            }
          },
        },
      },
      formConfig: {
        titleWidth: 80,
        titleAlign: 'right',
        data: { projectName: '', status: '' },
        items: [
          {
            field: 'projectName',
            title: '项目名称',
            span: 6,
            itemRender: { name: '$input', props: { placeholder: '项目名称', clearable: true } },
          },
          {
            field: 'status',
            title: '状态',
            span: 6,
            itemRender: {
              name: 'VxeSelect',
              props: { placeholder: '状态', clearable: true },
              options: [
                { label: '草稿', value: 'draft' },
                { label: '已生效', value: 'active' },
              ],
            },
          },
          {
            span: 12,
            align: 'center',
            itemRender: {
              name: '$buttons',
              children: [{ props: { type: 'submit', content: '查询', status: 'primary' } }, { props: { type: 'reset', content: '重置' } }],
            },
          },
          { field: 'actionButtons', span: 24, align: 'left', slots: { default: 'action-buttons' } },
        ],
      },
      columns: [
        { field: 'projectCode', title: '项目编号', minWidth: 140 },
        { field: 'projectName', title: '项目名称', minWidth: 160 },
        { field: 'version', title: '计划版本', width: 100 },
        { field: 'planRange', title: '计划周期', minWidth: 200, slots: { default: 'planRange' } },
        { field: 'taskCount', title: '任务数', width: 80, align: 'center', slots: { default: 'taskCount' } },
        { field: 'status', title: '状态', width: 100, align: 'center', slots: { default: 'status' } },
        { field: 'createTime', title: '创建时间', minWidth: 160 },
        { title: '操作', width: 160, fixed: 'right', align: 'center', slots: { default: 'operation' } },
      ],
    });

    const refreshGrid = () => gridRef.value?.commitProxy('query');

    const handleSearch = () => refreshGrid();
    const handleReset = () => refreshGrid();
    const handleAdd = () => dialogRef.value?.open(null);
    const handleEdit = row => dialogRef.value?.open(row);
    const handleDialogSuccess = () => refreshGrid();

    const handleActivate = async row => {
      await ElMessageBox.confirm(`确定使计划【${row.projectName} · ${row.version}】生效？生效后任务将写入项目任务列表，旧 active 计划会自动归档。`, '计划生效');
      await activate(row.id);
      ElMessage.success('计划已生效，任务已写入任务管理');
      refreshGrid();
    };

    const handleArchive = async row => {
      let reason = '主动作废';
      try {
        const { value } = await ElMessageBox.prompt('请输入作废原因', '作废计划', {
          inputType: 'textarea',
          inputPlaceholder: '将关联的待派发任务一并取消',
          inputValidator: v => (v && v.trim() ? true : '请输入作废原因'),
        });
        reason = value.trim();
      } catch (e) {
        return;
      }
      await archive(row.id, reason);
      ElMessage.success(`计划已作废：${reason}`);
      refreshGrid();
    };

    return {
      gridRef,
      dialogRef,
      gridOptions,
      handleSearch,
      handleReset,
      handleAdd,
      handleEdit,
      handleDialogSuccess,
      handleActivate,
      handleArchive,
      refreshGrid,
    };
  },
};
</script>

<style scoped>
:deep(.vxe-grid) {
  background: #fff;
}
</style>
