import { createCrudApi, generateResume, getDemoData, getTemplateOptions } from './phase4Store';

const api = createCrudApi('resumes');

export const getPage = api.getPage;
export const getList = api.getList;
export const getDetail = api.getDetail;

export const getEligibleMembers = () => {
  const data = getDemoData();
  const fromCandidates = (data.candidates || [])
    .filter(item => ['offer', 'hired'].includes(item.status))
    .map(item => ({ ...item, memberType: 'candidate', memberId: item.id, position: item.position }));
  const fromTalents = (data.talents || []).map(item => ({
    ...item,
    memberType: 'talent',
    memberId: item.id,
    position: item.title,
    status: '',
  }));
  const map = new Map();
  [...fromCandidates, ...fromTalents].forEach(item => {
    if (!map.has(item.memberId)) map.set(item.memberId, item);
  });
  return Promise.resolve({ data: { code: 200, success: true, data: [...map.values()] } });
};

export const generate = (memberId, templateId) => {
  const item = generateResume(memberId, templateId);
  return Promise.resolve({ data: { code: 200, success: true, data: item } });
};

export const getResumeTemplateOptions = () => {
  return Promise.resolve({ data: { code: 200, success: true, data: getTemplateOptions('resume') } });
};
