import { TASK_STATUS, MOCK_USERS } from './dict';

export const Option = () => ({
  border: true,
  index: true,
  selection: true,
  addBtn: false,
  editBtn: false,
  delBtn: false,
  viewBtn: false,
  dialogWidth: '80%',
  menuWidth: 280,
  searchSpan: 6,
  searchMenuSpan: 6,
  searchLabelWidth: 90,
  overHidden: true,
  column: [
    { label: '任务编号', prop: 'code', search: true, minWidth: 180, slot: true },
    { label: '项目编号', prop: 'projectCode', search: true, minWidth: 140 },
    { label: '项目名称', prop: 'projectName', search: true, minWidth: 160 },
    { label: '任务名称', prop: 'taskName', minWidth: 160 },
    { label: '所属阶段', prop: 'phaseName', minWidth: 110 },
    { label: '责任人', prop: 'assigneeName', minWidth: 90 },
    { label: '计划起止', prop: 'planRange', minWidth: 180 },
    { label: '工作量', prop: 'workload', width: 80 },
    { label: '成果物', prop: 'deliverableCount', width: 80 },
    { label: '状态', prop: 'status', type: 'select', dicData: TASK_STATUS, minWidth: 100 },
  ],
  group: [
    {
      label: '任务信息',
      prop: 'base',
      column: [
        { label: '任务名称', prop: 'taskName', span: 12, rules: [{ required: true, message: '请输入任务名称' }] },
        { label: '所属阶段', prop: 'phaseName', span: 12 },
        { label: '责任人', prop: 'assigneeId', type: 'select', span: 12, dicData: MOCK_USERS.map(u => ({ label: u.name, value: u.id })) },
        { label: '计划开始', prop: 'planStartDate', type: 'date', span: 12, valueFormat: 'YYYY-MM-DD' },
        { label: '计划结束', prop: 'planEndDate', type: 'date', span: 12, valueFormat: 'YYYY-MM-DD' },
        { label: '工作量(人·天)', prop: 'workload', type: 'number', span: 12 },
        { label: '任务说明', prop: 'description', type: 'textarea', span: 24, minRows: 3 },
      ],
    },
  ],
});
