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
    { label: '验收编号', prop: 'code', minWidth: 140 },
    { label: '验收类型', prop: 'acceptanceType', minWidth: 100 },
    { label: '验收日期', prop: 'acceptanceDate', minWidth: 120 },
    { label: '结论', prop: 'conclusion', minWidth: 100 },
  ],
});
