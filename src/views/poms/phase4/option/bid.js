import { BID_STATUS } from './dict';

export const Option = () => ({
  border: true,
  index: true,
  viewBtn: false,
  editBtn: true,
  delBtn: false,
  addBtn: true,
  dialogType: 'drawer',
  dialogWidth: 780,
  dialogClickModal: false,
  searchSpan: 6,
  searchMenuSpan: 6,
  searchLabelWidth: 100,
  labelWidth: 120,
  overHidden: true,
  column: [
    { label: '投标包编号', prop: 'code', addDisplay: false, editDisplay: false, search: true, minWidth: 150 },
    { label: '项目名称', prop: 'projectName', search: true, rules: [{ required: true, message: '必填', trigger: 'blur' }], minWidth: 190 },
    { label: '客户', prop: 'customerName', search: true, minWidth: 160 },
    { label: '投标模板', prop: 'templateId', type: 'select', hide: true, rules: [{ required: true, message: '请选择投标模板', trigger: 'change' }] },
    { label: '模板', prop: 'templateName', addDisplay: false, editDisplay: false, minWidth: 160 },
    { label: '需求人数', prop: 'requiredRoles', type: 'number', hide: true, value: 3 },
    { label: '状态', prop: 'status', type: 'select', dicData: BID_STATUS, addDisplay: false, editDisplay: false, minWidth: 100 },
    { label: '更新时间', prop: 'updatedAt', addDisplay: false, editDisplay: false, minWidth: 160 },
  ],
});
