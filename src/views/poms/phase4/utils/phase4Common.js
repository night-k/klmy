import {
  addToBidPackage,
  createCandidateFromEmail,
  generateResume,
  getDemoData,
  getStats,
  promoteCandidate,
  registerCandidate,
  rejectCandidate,
  removeFromBidPackage,
  resetDemoData,
  updateBidPackage,
} from '@/api/poms/phase4/phase4Store';

export const PHASE4_PAGES = [
  { key: 'dashboard', label: '主线首页', path: '/poms/phase4/index' },
  { key: 'candidate', label: '候选人池', path: '/poms/phase4/candidate' },
  { key: 'talent', label: '人才档案', path: '/poms/phase4/talent' },
  { key: 'resume', label: '简历生成', path: '/poms/phase4/resume' },
  { key: 'bid', label: '投标包', path: '/poms/phase4/bid' },
];

export function candidateStatusLabel(status) {
  const map = {
    new: '待初筛',
    interview: '面试中',
    offer: '待录用',
    hired: '已录用',
    rejected: '已淘汰',
  };
  return map[status] || status || '-';
}

export function candidateStatusType(status) {
  const map = {
    new: 'info',
    interview: 'warning',
    offer: 'primary',
    hired: 'success',
    rejected: 'danger',
  };
  return map[status] || 'info';
}

export function sourceLabel(source) {
  const map = {
    招聘邮箱: '招聘邮箱',
    内推: '内推',
    校园招聘: '校园招聘',
    猎头推荐: '猎头推荐',
    手工登记: '手工登记',
  };
  return map[source] || source || '-';
}

export function bidStatusLabel(status) {
  return status === 'ready' ? '可投标' : '组包中';
}

export function bidStatusType(status) {
  return status === 'ready' ? 'success' : 'warning';
}

export function bidProgress(pkg) {
  const total = Number(pkg.requiredRoles) || 0;
  const current = (pkg.candidateIds || []).length;
  if (!total) return 0;
  return Math.min(100, Math.round((current / total) * 100));
}

export function candidateStepPercent(status) {
  const map = { new: 20, interview: 45, offer: 70, hired: 100, rejected: 100 };
  return map[status] || 0;
}

export function candidateStepLabel(status) {
  const map = {
    new: '待初筛',
    interview: '面试阶段',
    offer: '录用阶段',
    hired: '人才档案已生成',
    rejected: '已淘汰',
  };
  return map[status] || '-';
}

export function candidateNextStep(candidate) {
  if (!candidate) return '-';
  const map = {
    new: '安排面试',
    interview: '发放录用函',
    offer: '确认录用并转人才档案',
    hired: '生成投标简历',
    rejected: '暂无下一步',
  };
  return map[candidate.status] || '-';
}

export function timelineType(action) {
  if (['录用完成', '发放 Offer', '确认录用'].includes(action)) return 'success';
  if (['初筛淘汰', '已淘汰'].includes(action)) return 'danger';
  if (['初面', '复试', '终面通过', '安排面试'].includes(action)) return 'warning';
  return 'primary';
}

export function packageMembers(pkg, candidates = [], talents = []) {
  const names = [];
  (pkg.candidateIds || []).forEach(id => {
    const candidate = candidates.find(item => item.id === id);
    const talent = talents.find(item => item.id === id);
    names.push(candidate?.name || talent?.name || id);
  });
  return names;
}

export function findMemberName(id, candidates = [], talents = []) {
  const candidate = candidates.find(item => item.id === id);
  const talent = talents.find(item => item.id === id);
  return candidate?.name || talent?.name || id;
}

export function phase4PageLinks(currentPath = '') {
  return PHASE4_PAGES.filter(item => item.path !== currentPath);
}

export {
  addToBidPackage,
  createCandidateFromEmail,
  generateResume,
  getDemoData,
  getStats,
  promoteCandidate,
  registerCandidate,
  rejectCandidate,
  removeFromBidPackage,
  resetDemoData,
  updateBidPackage,
};

export * from './talentFlow';
