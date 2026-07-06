import { RESUME_MEMBER_TYPE } from './dict';

export const Option = () => ({
  border: true,
  index: true,
  viewBtn: false,
  editBtn: false,
  delBtn: false,
  addBtn: false,
  dialogWidth: '70%',
  searchSpan: 6,
  searchMenuSpan: 6,
  searchLabelWidth: 100,
  overHidden: true,
  column: [
    { label: '姓名', prop: 'candidateName', search: true, minWidth: 110 },
    { label: '来源', prop: 'memberType', type: 'select', dicData: RESUME_MEMBER_TYPE, minWidth: 100 },
    { label: '模板', prop: 'templateName', minWidth: 150 },
    { label: '匹配度', prop: 'matchRate', minWidth: 90 },
    { label: '文件名', prop: 'fileName', minWidth: 180 },
    { label: '生成时间', prop: 'generatedAt', minWidth: 160 },
  ],
});
