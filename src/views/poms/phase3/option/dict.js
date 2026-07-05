export const DOC_TYPE = [
  { label: '投标文件', value: 'tender' },
  { label: '合同文件', value: 'contract' },
  { label: '开题报告', value: 'proposal' },
  { label: '成果物', value: 'deliverable' },
  { label: '验收报告', value: 'acceptance' },
  { label: '中标通知书', value: 'winbid' },
  { label: '其他', value: 'other' },
];

export const FILE_FORMAT = [
  { label: 'PDF', value: 'pdf' },
  { label: 'Word', value: 'word' },
  { label: 'Excel', value: 'excel' },
  { label: 'PPT', value: 'ppt' },
  { label: '图片', value: 'image' },
  { label: '其他', value: 'other' },
];

export const PERMISSION_SCOPE = [
  { label: '公开', value: 'public' },
  { label: '项目内', value: 'project' },
  { label: '指定人员', value: 'assigned' },
  { label: '私有', value: 'private' },
];

export const SOURCE_TYPE = [
  { label: '自动归档', value: 'auto' },
  { label: '手工上传', value: 'manual' },
];

export const TAG_DIMENSION = [
  { label: '项目名称', value: 'project' },
  { label: '客户名称', value: 'customer' },
  { label: '年份', value: 'year' },
  { label: '文件类型', value: 'docType' },
  { label: '自定义', value: 'custom' },
];

export const DOC_TYPE_TAG = {
  tender: '',
  contract: 'success',
  proposal: 'warning',
  deliverable: 'primary',
  acceptance: 'success',
  winbid: 'info',
  other: 'info',
};

export function labelOf(dic, value) {
  const item = dic.find(d => d.value === value);
  return item ? item.label : value || '-';
}
