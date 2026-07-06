export const CANDIDATE_STATUS = [
  { label: '待初筛', value: 'new' },
  { label: '面试中', value: 'interview' },
  { label: '待录用', value: 'offer' },
  { label: '已录用', value: 'hired' },
  { label: '已淘汰', value: 'rejected' },
];

export const CANDIDATE_SOURCE = [
  { label: '招聘邮箱', value: '招聘邮箱' },
  { label: '内推', value: '内推' },
  { label: '校园招聘', value: '校园招聘' },
  { label: '猎头推荐', value: '猎头推荐' },
  { label: '手工登记', value: '手工登记' },
];

export const BID_STATUS = [
  { label: '组包中', value: 'draft' },
  { label: '可投标', value: 'ready' },
];

export const RESUME_MEMBER_TYPE = [
  { label: '候选人', value: 'candidate' },
  { label: '人才档案', value: 'talent' },
];

export const CANDIDATE_STATUS_TAG = {
  new: 'info',
  interview: 'warning',
  offer: 'primary',
  hired: 'success',
  rejected: 'danger',
};

export const BID_STATUS_TAG = {
  draft: 'warning',
  ready: 'success',
};

export const TEMPLATE_TYPE = [
  { label: '简历模板', value: 'resume' },
  { label: '投标模板', value: 'bid' },
];

export const TEMPLATE_STATUS = [
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' },
];

export const TEMPLATE_TYPE_TAG = {
  resume: 'primary',
  bid: 'warning',
};

export const CERT_TYPE = [
  { label: '安全/特种', value: '10' },
  { label: '职业资格', value: '20' },
  { label: '语言类', value: '30' },
  { label: '行业认证', value: '40' },
];

export const EDUCATION_LEVEL = [
  { label: '大专', value: '大专' },
  { label: '本科', value: '本科' },
  { label: '硕士', value: '硕士' },
  { label: '博士', value: '博士' },
];

export const CERT_STATUS_TAG = {
  正常: 'success',
  即将过期: 'warning',
  已过期: 'danger',
};

export function labelOf(dic, value) {
  const item = (dic || []).find(d => d.value === value);
  return item ? item.label : value || '-';
}
