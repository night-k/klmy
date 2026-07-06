/** 人才主线演示流程 */
export const TALENT_FLOW_STEPS = [
  { key: 'email', title: '招聘邮箱', desc: '接收简历', path: '/poms/phase4/candidate', query: { tab: 'mail' } },
  { key: 'candidate', title: '候选人池', desc: '初筛与面试', path: '/poms/phase4/candidate' },
  { key: 'talent', title: '人才档案', desc: '录用转档', path: '/poms/phase4/talent' },
  { key: 'resume', title: '简历生成', desc: '投标素材', path: '/poms/phase4/resume' },
  { key: 'bid', title: '投标包', desc: '组包投标', path: '/poms/phase4/bid' },
];

const PATH_FLOW_KEY = {
  '/poms/phase4/candidate': 'candidate',
  '/poms/phase4/talent': 'talent',
  '/poms/phase4/resume': 'resume',
  '/poms/phase4/bid': 'bid',
  '/poms/phase4/index': 'email',
};

export function getStepByKey(key) {
  return TALENT_FLOW_STEPS.find(s => s.key === key) || null;
}

export function resolveFlowKeyFromPath(path = '') {
  if (path.includes('/candidate') && path.includes('tab=mail')) return 'email';
  return PATH_FLOW_KEY[path.split('?')[0]] || 'email';
}

export function buildStepRoute(step, extraQuery = {}) {
  if (!step) return { path: '/poms/phase4/index' };
  return { path: step.path, query: { ...(step.query || {}), ...extraQuery } };
}

export function getAdjacentSteps(flowKey) {
  const index = TALENT_FLOW_STEPS.findIndex(s => s.key === flowKey);
  if (index < 0) return { prev: null, next: null, current: null, index: -1 };
  return {
    prev: index > 0 ? TALENT_FLOW_STEPS[index - 1] : null,
    next: index < TALENT_FLOW_STEPS.length - 1 ? TALENT_FLOW_STEPS[index + 1] : null,
    current: TALENT_FLOW_STEPS[index],
    index,
  };
}

export function resolveFlowIndex(stats = {}) {
  if (stats.readyPackages > 0) return 4;
  if (stats.resumes > 0) return 3;
  if (stats.hired > 0) return 2;
  if (stats.candidates > 0) return 1;
  return 0;
}
