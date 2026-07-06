/**
 * 项目列表/空间 Mock 适配层 — 伪装 PMIS 接口签名
 */
import { loadStore, saveStore, createProjectFromContract, attachContractsToProject } from '../phase1/mockStore';
import { ensurePhase2, getProjectDetailAggregated, getTaskStats, passMilestone, submitAcceptance, updateProjectRoles } from './phase2Store';

function mockResponse(data) {
  return Promise.resolve({ data: { code: 200, success: true, data } });
}

function mapProjectToListRow(p) {
  const statusMap = {
    pending_proposal: 1,
    ongoing: 5,
    pending_acceptance: 5,
    completed: 10,
    terminated: 6,
  };
  const contractAmount = (p.contracts || []).reduce((sum, item) => sum + (Number(item.contractAmount) || 0), 0);
  return {
    id: p.id,
    code: p.code,
    projectName: p.projectName,
    customName: p.customerName,
    customerName: p.customerName,
    contractCode: p.contractCode,
    contractId: p.contractId,
    contractIds: p.contractIds || [],
    contracts: p.contracts || [],
    cooperationType: p.cooperationType,
    partnerCompany: p.partnerCompany,
    serviceType: p.serviceType,
    projectManagerId: p.projectManagerId,
    projectManagerName: p.projectManagerName,
    projectAmount: contractAmount || p.budget,
    budget: p.budget,
    deliveryDate: p.planEndDate,
    planStartDate: p.planStartDate,
    planEndDate: p.planEndDate,
    status: statusMap[p.status] || 5,
    pomsStatus: p.status,
    projectOwnType: p.cooperationType === 'joint' ? 'joint' : 'self',
    priority: 5,
    createTime: p.createTime,
  };
}

export function getPage(current = 1, size = 10, query = {}) {
  ensurePhase2();
  const s = loadStore();
  let list = [...s.projects].map(mapProjectToListRow);
  if (query.status) {
    list = list.filter(i => String(i.status) === String(query.status));
  }
  if (query.pomsStatus) {
    list = list.filter(i => i.pomsStatus === query.pomsStatus);
  }
  if (query.code) list = list.filter(i => (i.code || '').includes(query.code));
  if (query.projectName) list = list.filter(i => (i.projectName || '').includes(query.projectName));
  if (query.customName) list = list.filter(i => (i.customName || '').includes(query.customName));
  if (query.projectManagerName) list = list.filter(i => (i.projectManagerName || '').includes(query.projectManagerName));
  const start = (current - 1) * size;
  return mockResponse({
    records: list.slice(start, start + size),
    total: list.length,
    current,
    size,
  });
}

export function getDetail(id) {
  ensurePhase2();
  const detail = getProjectDetailAggregated(id);
  if (!detail) return mockResponse(null);
  const row = mapProjectToListRow(detail);
  return mockResponse({
    ...row,
    ...detail,
    content: detail.description,
    milestones: detail.milestones,
  });
}

export function getTaskStatsApi(projectId) {
  return mockResponse(getTaskStats(projectId));
}

export function finishMilestone(data) {
  return passMilestone(data.id || data.milestoneId, data.opinion);
}

export function finish(projectId) {
  const s = loadStore();
  const p = s.projects.find(x => x.id === projectId);
  const phase2 = ensurePhase2();
  const finalPassed = (phase2.acceptances || []).some(a => a.projectId === projectId && !a.revoked && a.acceptanceType === 'final' && a.conclusion === 'passed');
  if (!finalPassed) {
    return Promise.reject(new Error('项目未通过最终验收，不能确认完成'));
  }
  if (p) {
    p.status = 'completed';
    saveStore();
  }
  return mockResponse(true);
}

export function updateProject(id, data) {
  const s = loadStore();
  const p = s.projects.find(x => x.id === id);
  if (p) {
    Object.assign(p, data);
    saveStore();
  }
  return mockResponse(p);
}

export function saveProjectAttachments(projectId, attachments) {
  const s = loadStore();
  const p = s.projects.find(x => x.id === projectId);
  if (p) {
    p.attachments = attachments;
    saveStore();
  }
  return mockResponse(true);
}

export function saveProjectRoles(projectId, roles) {
  return updateProjectRoles(projectId, roles);
}

export function listEnabled() {
  return mockResponse([]);
}

export function remove(id) {
  const s = loadStore();
  s.projects = s.projects.filter(p => p.id !== id);
  saveStore();
  return mockResponse(true);
}

export function initFromContract(contractId, formData) {
  return createProjectFromContract(contractId, formData);
}

export function attachContracts(projectId, contractIds) {
  return attachContractsToProject(projectId, contractIds);
}

export function submitProjectAcceptance(row) {
  return submitAcceptance(row);
}

export { getProjectDetailAggregated };
