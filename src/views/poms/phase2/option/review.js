import { TASK_STATUS } from './dict';

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
  column: [
    { label: '任务编号', prop: 'code', search: true, minWidth: 180 },
    { label: '项目编号', prop: 'projectCode', search: true, minWidth: 140 },
    { label: '项目名称', prop: 'projectName', search: true, minWidth: 160 },
    { label: '任务名称', prop: 'taskName', minWidth: 160 },
    { label: '责任人', prop: 'assigneeName', minWidth: 90 },
    { label: '状态', prop: 'status', type: 'select', dicData: TASK_STATUS.filter(s => s.value === 'pending_review'), minWidth: 100 },
  ],
});
