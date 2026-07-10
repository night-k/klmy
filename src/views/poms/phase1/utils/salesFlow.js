/** 销售主线 6 步流程（与 Phase1 路由及 Phase2 立项衔接一致） */
export const FLOW_STEPS = [
  { key: 'customer', title: '客户建档', desc: '客户主数据', path: '/poms/phase1/customer', icon: '客' },
  { key: 'opportunity', title: '商机登记', desc: '线索跟进', path: '/poms/phase1/opportunity', icon: '商' },
  { key: 'tender', title: '招投标', desc: '投标 / 开标 / 中标登记', path: '/poms/phase1/tender', icon: '投' },
  { key: 'contract', title: '合同管理', desc: '审批与签订', path: '/poms/phase1/contract', icon: '合' },
  { key: 'projectInit', title: '项目立项', desc: 'Phase2 合同转化', path: '/poms/phase2/projectList', icon: '项', crossPhase: true },
  { key: 'payment', title: '回款管理', desc: '计划与实际', path: '/poms/phase1/payment', icon: '回' },
];

/** 首页统计卡片，字段与 mockStore.getStats 一致 */
export const STAT_CARDS = [
  { key: 'customers', label: '客户', path: '/poms/phase1/customer' },
  { key: 'opportunities', label: '商机', path: '/poms/phase1/opportunity' },
  { key: 'tenders', label: '投标', path: '/poms/phase1/tender' },
  { key: 'winbids', label: '中标', path: '/poms/phase1/tender', query: { tab: 'won' } },
  { key: 'contracts', label: '合同', path: '/poms/phase1/contract' },
  { key: 'projects', label: '项目', path: '/poms/phase2/projectList', crossPhase: true },
  { key: 'payments', label: '回款', path: '/poms/phase1/payment' },
];

/** Phase1 业务模块快捷入口（无独立 winbid / project-init 路由） */
export const MODULE_LINKS = [
  { key: 'customer', title: '客户管理', desc: '客户档案、联系人、历史关联', path: '/poms/phase1/customer', icon: '客' },
  { key: 'opportunity', title: '商机管理', desc: '商机登记、阶段推进、跟进记录', path: '/poms/phase1/opportunity', icon: '商' },
  { key: 'tender', title: '招投标管理', desc: '投标递交、开标结果、中标登记、生成合同', path: '/poms/phase1/tender', icon: '投' },
  { key: 'contract', title: '合同管理', desc: '审批、签订、付款计划、立项入口', path: '/poms/phase1/contract', icon: '合' },
  { key: 'payment', title: '回款管理', desc: '回款计划、实际登记、逾期预警', path: '/poms/phase1/payment', icon: '回' },
  { key: 'phase2', title: '项目主线', desc: '合同驱动立项、项目空间与交付', path: '/poms/phase2/index', icon: '项', crossPhase: true },
];

export function buildStepRoute(step) {
  if (!step?.path) return { path: '/poms/phase1/index' };
  const route = { path: step.path };
  if (step.query && Object.keys(step.query).length) {
    route.query = { ...step.query };
  }
  return route;
}

/** 按演示数据统计当前流程进度（连续有数据的最后一步） */
export function resolveFlowActive(stats = {}) {
  const gates = [
    (stats.customers || 0) > 0,
    (stats.opportunities || 0) > 0,
    (stats.tenders || 0) > 0 || (stats.winbids || 0) > 0,
    (stats.contracts || 0) > 0,
    (stats.projects || 0) > 0,
    (stats.payments || 0) > 0,
  ];
  let active = 0;
  for (let i = 0; i < gates.length; i += 1) {
    if (gates[i]) active = i + 1;
    else break;
  }
  return active;
}
