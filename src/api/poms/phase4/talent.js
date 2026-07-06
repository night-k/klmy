import { createCrudApi, generateResume, addToBidPackage, enrichTalentDetail } from './phase4Store';
import { textToProjectCases } from '@/views/poms/phase4/utils/projectCases';

const api = createCrudApi('talents');

export const getPage = (current, size, params = {}) => {
  return api.getPage(current, size, params).then(res => {
    const d = res.data.data;
    d.records = (d.records || []).map(item => enrichTalentDetail(item));
    return res;
  });
};
export const getList = getPage;
export const getDetail = id => api.getDetail(id);
export const update = row => {
  const patch = { ...row };
  if (patch.skillsText) {
    patch.skills = String(patch.skillsText)
      .split(/[,，]/)
      .map(v => v.trim())
      .filter(Boolean);
    delete patch.skillsText;
  }
  if (patch.projectCasesText !== undefined) {
    patch.projectCases = textToProjectCases(patch.projectCasesText);
    delete patch.projectCasesText;
  }
  return api.update(patch);
};
export const remove = api.remove;

export const generateTalentResume = (id, templateId) => {
  const item = generateResume(id, templateId);
  return Promise.resolve({ data: { code: 200, success: true, data: item } });
};

export const addToBid = (id, packageId) => {
  const item = addToBidPackage(id, packageId);
  return Promise.resolve({ data: { code: 200, success: true, data: item } });
};
