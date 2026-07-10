export const CUSTOMER_TYPE = [
  { label: '国企', value: 'state' },
  { label: '民营', value: 'private' },
  { label: '政府机关', value: 'government' },
  { label: '事业单位', value: 'institution' },
  { label: '外企', value: 'foreign' },
];

export const CUSTOMER_LEVEL = [
  { label: '战略客户', value: 'strategic' },
  { label: '重点客户', value: 'key' },
  { label: '一般客户', value: 'normal' },
];

export const INDUSTRY = [
  { label: '石油', value: 'oil' },
  { label: '能源', value: 'energy' },
  { label: '化工', value: 'chemical' },
  { label: '政府', value: 'gov' },
  { label: '其他', value: 'other' },
];

export const CUSTOMER_STATUS = [
  { label: '正常', value: 'normal' },
  { label: '暂停', value: 'paused' },
  { label: '流失', value: 'lost' },
];

export const OPP_SOURCE = [
  { label: '老客户复购', value: 'repeat' },
  { label: '客户介绍', value: 'referral' },
  { label: '招标平台', value: 'tender_platform' },
  { label: '主动开发', value: 'active' },
  { label: '合作伙伴', value: 'partner' },
];

export const OPP_STAGE = [
  { label: '已登记', value: 'registered' },
  { label: '信息补充', value: 'supplement' },
  { label: '转招投标', value: 'tender' },
];

export const OPP_STATUS = [
  { label: '已登记', value: 'ongoing' },
  { label: '已挂起', value: 'suspended' },
];

export const PROJECT_TYPE = [
  { label: '技术服务', value: 'tech_service' },
  { label: '勘察', value: 'survey' },
  { label: '设计', value: 'design' },
  { label: '咨询', value: 'consulting' },
  { label: '其他', value: 'other' },
];

export const TENDER_METHOD = [
  { label: '公开招标', value: 'public' },
  { label: '邀请招标', value: 'invite' },
  { label: '竞争性谈判', value: 'negotiate' },
  { label: '单一来源', value: 'single' },
];

export const TENDER_RESULT = [
  { label: '待开标', value: 'pending' },
  { label: '中标', value: 'won' },
  { label: '未中标', value: 'lost' },
  { label: '流标', value: 'abort' },
];

export const CONTRACT_STATUS = [
  { label: '草稿', value: 'draft' },
  { label: '审批中', value: 'approving' },
  { label: '已签', value: 'signed' },
  { label: '执行中', value: 'executing' },
  { label: '已完成', value: 'completed' },
  { label: '已终止', value: 'terminated' },
];

export const CONTRACT_TYPE = [
  { label: '技术服务', value: 'tech_service' },
  { label: '勘察', value: 'survey' },
  { label: '设计', value: 'design' },
  { label: '咨询', value: 'consulting' },
  { label: '联营分包', value: 'joint' },
];

export const WIN_CONTRACT_STATUS = [
  { label: '待起草', value: 'pending' },
  { label: '已生成合同', value: 'generated' },
];

export const PAYMENT_NODE = [
  { label: '预付款', value: 'prepay' },
  { label: '进度款', value: 'progress' },
  { label: '验收款', value: 'acceptance' },
  { label: '质保金', value: 'warranty' },
];

export const PAYMENT_METHOD = [
  { label: '银行转账', value: 'bank_transfer' },
  { label: '承兑汇票', value: 'acceptance_bill' },
  { label: '现金', value: 'cash' },
];

export const PAYMENT_STATUS = [
  { label: '未到期', value: 'not_due' },
  { label: '待回款', value: 'pending' },
  { label: '已回款', value: 'received' },
  { label: '逾期', value: 'overdue' },
];

export const INVOICE_STATUS = [
  { label: '未开票', value: 'not_invoiced' },
  { label: '已开票', value: 'invoiced' },
];

export const COOPERATION_TYPE = [
  { label: '自营', value: 'self' },
  { label: '联营', value: 'joint' },
];

export const PROJECT_STATUS = [
  { label: '待开题', value: 'pending_proposal' },
  { label: '进行中', value: 'ongoing' },
  { label: '待验收', value: 'pending_acceptance' },
  { label: '已完成', value: 'completed' },
  { label: '已终止', value: 'terminated' },
];

export const labelOf = (dic, value) => dic.find(d => d.value === value)?.label || value || '-';

export const tagType = (status, map) => map[status] || 'info';

export const OPP_STATUS_TAG = { ongoing: 'primary', won: 'success', lost: 'danger', suspended: 'warning' };
export const TENDER_RESULT_TAG = { pending: 'info', won: 'success', lost: 'danger', abort: 'warning' };
export const CONTRACT_STATUS_TAG = { draft: 'info', approving: 'warning', signed: 'success', executing: 'primary', completed: 'success', terminated: 'danger' };
export const PAYMENT_STATUS_TAG = { not_due: 'info', pending: 'warning', received: 'success', overdue: 'danger' };
