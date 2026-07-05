export const PROJECT_STATUS = [
  { label: '待开题', value: 'pending_proposal' },
  { label: '进行中', value: 'ongoing' },
  { label: '待验收', value: 'pending_acceptance' },
  { label: '已完成', value: 'completed' },
  { label: '已终止', value: 'terminated' },
];

export const COOPERATION_TYPE = [
  { label: '自营', value: 'self' },
  { label: '联营', value: 'joint' },
];

export const SERVICE_TYPE = [
  { label: '技术服务', value: 'tech_service' },
  { label: '勘察', value: 'survey' },
  { label: '设计', value: 'design' },
  { label: '咨询', value: 'consulting' },
  { label: '其他', value: 'other' },
];

export const ROLE_TYPE = [
  { label: '项目经理', value: 'pm' },
  { label: '技术负责人', value: 'tech' },
  { label: '质量负责人', value: 'qa' },
  { label: '项目成员', value: 'member' },
];

export const TASK_STATUS = [
  { label: '待派发', value: 'pending_dispatch' },
  { label: '已派发', value: 'dispatched' },
  { label: '进行中', value: 'in_progress' },
  { label: '待审核', value: 'pending_review' },
  { label: '已完成', value: 'completed' },
  { label: '已逾期', value: 'overdue' },
  { label: '已取消', value: 'cancelled' },
];

export const PROPOSAL_STATUS = [
  { label: '草稿', value: 'draft' },
  { label: '已提交', value: 'submitted' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
];

export const MILESTONE_STATUS = [
  { label: '未开始', value: 'not_started' },
  { label: '进行中', value: 'in_progress' },
  { label: '待验收', value: 'pending_acceptance' },
  { label: '已通过', value: 'passed' },
  { label: '已驳回', value: 'rejected' },
];

export const ACCEPTANCE_CONCLUSION = [
  { label: '通过', value: 'passed' },
  { label: '有条件通过', value: 'conditional' },
  { label: '不通过', value: 'failed' },
];

export const ACCEPTANCE_TYPE = [
  { label: '中间验收', value: 'interim' },
  { label: '最终验收', value: 'final' },
];

export const RECTIFICATION_STATUS = [
  { label: '待整改', value: 'pending' },
  { label: '整改中', value: 'rectifying' },
  { label: '待复核', value: 'reviewing' },
  { label: '已关闭', value: 'closed' },
  { label: '已退回', value: 'returned' },
];

export const DELIVERABLE_AUDIT_STATUS = [
  { label: '草稿', value: 'draft' },
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
];

export const ACCEPTANCE_CONCLUSION_TAG = {
  passed: 'success',
  conditional: 'warning',
  failed: 'danger',
};

export const RECTIFICATION_STATUS_TAG = {
  pending: 'danger',
  rectifying: 'primary',
  reviewing: 'warning',
  closed: 'success',
  returned: 'info',
};

export const PROJECT_STATUS_TAG = {
  pending_proposal: 'info',
  ongoing: 'primary',
  pending_acceptance: 'warning',
  completed: 'success',
  terminated: 'danger',
};

export const TASK_STATUS_TAG = {
  pending_dispatch: 'info',
  dispatched: '',
  in_progress: 'primary',
  pending_review: 'warning',
  completed: 'success',
  overdue: 'danger',
  cancelled: 'info',
};

export const PLAN_STATUS = [
  { label: '草稿', value: 'draft' },
  { label: '已生效', value: 'active' },
  { label: '已归档', value: 'archived' },
];

export const MOCK_USERS = [
  { id: 'u001', name: '张明' },
  { id: 'u002', name: '李华' },
  { id: 'u003', name: '王磊' },
  { id: 'u004', name: '赵敏' },
  { id: 'u005', name: '陈强' },
  { id: 'u006', name: '刘洋' },
];

export function labelOf(dic, value) {
  const item = dic.find(d => d.value === value);
  return item ? item.label : value || '-';
}
