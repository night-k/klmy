import { PLAN_STATUS } from './dict';

export const Option = () => ({
  border: true,
  index: true,
  addBtn: false,
  editBtn: false,
  delBtn: false,
  viewBtn: false,
  searchSpan: 6,
  searchMenuSpan: 6,
  overHidden: true,
  menuWidth: 260,
  column: [
    { label: '项目编号', prop: 'projectCode', search: true, minWidth: 140 },
    { label: '项目名称', prop: 'projectName', search: true, minWidth: 180 },
    { label: '计划版本', prop: 'version', minWidth: 100, slot: true },
    { label: '计划周期', prop: 'planRange', minWidth: 200, slot: true },
    { label: '任务数', prop: 'taskCount', width: 80, align: 'center', slot: true },
    {
      label: '状态',
      prop: 'status',
      type: 'select',
      search: true,
      dicData: PLAN_STATUS,
      minWidth: 90,
      slot: true,
    },
    { label: '创建时间', prop: 'createTime', minWidth: 160 },
  ],
});
