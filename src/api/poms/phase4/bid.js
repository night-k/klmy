import { createCrudApi, updateBidPackage, removeFromBidPackage, addToBidPackage, addBidPackage, getDemoData, getTemplateOptions } from './phase4Store';

const api = createCrudApi('bidPackages');

export const getPage = api.getPage;
export const getList = api.getList;
export const getBidTemplateOptions = () => {
  return Promise.resolve({ data: { code: 200, success: true, data: getTemplateOptions('bid') } });
};

export const update = row => {
  const options = getTemplateOptions('bid');
  const tpl = options.find(item => item.value === row.templateId);
  const patch = { ...row, templateName: tpl?.label || row.templateName };
  return api.update(patch);
};
export const remove = api.remove;

export const getDetail = id => {
  return api.getDetail(id).then(res => {
    const pkg = res.data.data;
    if (!pkg) return res;
    const data = getDemoData();
    const memberNames = (pkg.candidateIds || []).map(mid => {
      const c = data.candidates.find(item => item.id === mid);
      const t = data.talents.find(item => item.id === mid);
      return c?.name || t?.name || mid;
    });
    return Promise.resolve({ data: { code: 200, success: true, data: { ...pkg, memberNames } } });
  });
};

export const add = row => {
  const item = addBidPackage(row);
  return Promise.resolve({ data: { code: 200, success: true, data: item } });
};

export const markReady = id => {
  const item = updateBidPackage(id, { status: 'ready' });
  return Promise.resolve({ data: { code: 200, success: true, data: item } });
};

export const addMember = (packageId, memberId) => {
  const item = addToBidPackage(memberId, packageId);
  return Promise.resolve({ data: { code: 200, success: true, data: item } });
};

export const removeMember = (packageId, memberId) => {
  const item = removeFromBidPackage(memberId, packageId);
  return Promise.resolve({ data: { code: 200, success: true, data: item } });
};

export const getEligibleMembers = () => {
  const data = getDemoData();
  const fromCandidates = (data.candidates || [])
    .filter(item => item.resumeGenerated && !['rejected'].includes(item.status))
    .map(item => ({ ...item, memberType: 'candidate', position: item.position }));
  const fromTalents = (data.talents || []).filter(item => item.resumeGenerated).map(item => ({ ...item, memberType: 'talent', position: item.title }));
  const map = new Map();
  [...fromCandidates, ...fromTalents].forEach(item => {
    if (!map.has(item.id)) map.set(item.id, item);
  });
  return Promise.resolve({ data: { code: 200, success: true, data: [...map.values()] } });
};
