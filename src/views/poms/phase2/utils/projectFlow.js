export function isProposalApproved(project) {
  if (!project) return false;
  return project.proposal?.auditStatus === 'approved' || ['ongoing', 'pending_acceptance', 'completed'].includes(project.pomsStatus);
}

export function isPlanActive(project) {
  return project?.plan?.status === 'active';
}

export function canUsePlan(project) {
  return isProposalApproved(project);
}

export function canAccept(project) {
  return ['pending_acceptance', 'ongoing'].includes(project?.pomsStatus);
}

/** 12 步演示流程（叙事用） */
export const FLOW_STEPS = [
  { key: 'contract', title: '合同已签', desc: 'Phase1 合同', icon: '合', path: '/poms/phase1/contract', needsProject: false },
  { key: 'init', title: '项目立项', desc: '合同转化立项', icon: '项', path: '/poms/phase2/projectList' },
  { key: 'attributes', title: '项目属性', desc: '合作类型与服务类型', icon: '属', path: '/poms/phase2/projectSpace', query: { tab: 'basic' }, moduleKey: 'attributes' },
  { key: 'proposal', title: '开题报告', desc: '全局列表', icon: '开', path: '/poms/phase2/proposal', moduleKey: 'proposal' },
  { key: 'plan', title: '项目计划', desc: '全局列表', icon: '计', path: '/poms/phase2/plan', moduleKey: 'plan' },
  { key: 'gantt', title: '甘特图', desc: '独立甘特页', icon: '甘', path: '/poms/phase2/gantt', moduleKey: 'plan' },
  { key: 'dispatch', title: '任务派发', desc: '任务列表', icon: '派', path: '/poms/phase2/task', query: { status: 'pending_dispatch' }, moduleKey: 'task' },
  { key: 'execution', title: '任务执行', desc: '任务列表', icon: '执', path: '/poms/phase2/task', query: { status: 'in_progress' }, moduleKey: 'task' },
  { key: 'deliverable', title: '成果物', desc: '任务详情内上传', icon: '果', path: '/poms/phase2/task', query: { status: 'in_progress' }, moduleKey: 'deliverable' },
  { key: 'review', title: '成果审核', desc: '任务详情内审核', icon: '审', path: '/poms/phase2/task', query: { status: 'pending_review' }, moduleKey: 'review' },
  { key: 'milestone', title: '里程碑验收', desc: '项目空间', icon: '里', path: '/poms/phase2/projectSpace', query: { tab: 'milestone' }, moduleKey: 'milestone' },
  { key: 'acceptance', title: '项目验收', desc: '项目空间 Tab', icon: '验', path: '/poms/phase2/projectSpace', query: { tab: 'acceptance' }, moduleKey: 'acceptance' },
];

/** 菜单 / 快捷入口：3 个业务模块 */
const MODULE_MENU_KEYS = ['proposal', 'plan', 'task'];

export const MODULE_LINKS = FLOW_STEPS.filter(s => MODULE_MENU_KEYS.includes(s.key)).map(s => ({ key: s.key, path: s.path, title: s.title, desc: s.desc, icon: s.icon, query: s.query }));

const GUARD_MESSAGES = {
  attributes: () => null,
  proposal: () => null,
  plan: project => (!canUsePlan(project) ? '需先完成开题报告审核通过后方可制定项目计划' : null),
  task: project => (!isPlanActive(project) ? '需先制定并生效项目计划后方可管理任务' : null),
  deliverable: project => (!isPlanActive(project) ? '需先计划生效后方可上传成果物' : null),
  review: project => (!isPlanActive(project) ? '需先计划生效后方可进行成果审核' : null),
  milestone: project => {
    if (!isPlanActive(project)) return '需先计划生效后方可进行里程碑验收';
    return null;
  },
  acceptance: project => (!canAccept(project) && project?.pomsStatus !== 'completed' ? '项目需进入待验收阶段后方可发起验收' : null),
};

export function getGuardMessage(moduleKey, project) {
  if (!project?.id || !moduleKey) return null;
  const fn = GUARD_MESSAGES[moduleKey];
  return fn ? fn(project) : null;
}

export function getStepByKey(key) {
  return FLOW_STEPS.find(s => s.key === key) || null;
}

export function buildStepRoute(step, projectId, extraQuery = {}) {
  if (!step) return { path: '/poms/phase2/index' };
  const query = { ...(step.query || {}), ...extraQuery };
  if (step.needsProject !== false && projectId) {
    query.projectId = projectId;
  }
  return { path: step.path, query };
}

export function getAdjacentSteps(flowKey) {
  const index = FLOW_STEPS.findIndex(s => s.key === flowKey);
  if (index < 0) return { prev: null, next: null, current: null, index: -1 };
  return {
    prev: index > 0 ? FLOW_STEPS[index - 1] : null,
    next: index < FLOW_STEPS.length - 1 ? FLOW_STEPS[index + 1] : null,
    current: FLOW_STEPS[index],
    index,
  };
}

export function canAccessStep(step, project) {
  if (!step) return false;
  if (step.needsProject === false) return true;
  if (!project?.id) return false;
  if (!step.moduleKey) return true;
  return !getGuardMessage(step.moduleKey, project);
}

export function resolveFlowIndex(project) {
  if (!project?.id) return 1;

  const status = project.pomsStatus;
  const tasks = project.tasks || [];
  const milestones = project.milestones || [];
  const proposal = project.proposal;
  const deliverables = project.deliverables || [];

  if (status === 'completed' || project.acceptance) return 11;
  if (status === 'pending_acceptance') return 11;

  const allMilestonesPassed = milestones.length > 0 && milestones.every(m => m.status === 'passed');
  const allTasksDone = tasks.length > 0 && tasks.every(t => t.status === 'completed');

  if (allTasksDone && milestones.length && !allMilestonesPassed) return 10;

  if (tasks.some(t => t.status === 'pending_review')) return 9;

  if (tasks.some(t => t.status === 'in_progress') && deliverables.length === 0) return 8;

  if (tasks.some(t => ['dispatched', 'in_progress'].includes(t.status))) return 7;

  if (tasks.some(t => t.status === 'pending_dispatch') && isPlanActive(project)) return 6;

  if (isPlanActive(project)) return 5;

  if (isProposalApproved(project)) return 4;

  if (proposal?.auditStatus === 'draft' || proposal?.auditStatus === 'submitted') return 3;
  if (proposal) return 3;

  if (status === 'pending_proposal') return 2;

  return 1;
}
