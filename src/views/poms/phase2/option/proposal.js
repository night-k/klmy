import { PROPOSAL_STATUS } from './dict';

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
    { label: '项目编号', prop: 'projectCode', search: true, minWidth: 140 },
    { label: '项目名称', prop: 'projectName', search: true, minWidth: 180 },
    { label: '报告标题', prop: 'title', minWidth: 200 },
    { label: '审核状态', prop: 'auditStatus', type: 'select', dicData: PROPOSAL_STATUS, search: true, minWidth: 100 },
    { label: '提交时间', prop: 'submitTime', minWidth: 160 },
    { label: '创建时间', prop: 'createTime', minWidth: 160 },
  ],
});
