import { createCrudApi, registerCandidate, promoteCandidate, rejectCandidate, generateResume, addToBidPackage } from './phase4Store';
import { textToProjectCases } from '@/views/poms/phase4/utils/projectCases';

const api = createCrudApi('candidates');

export const getPage = api.getPage;
export const getList = api.getList;
export const getDetail = api.getDetail;
export const remove = api.remove;

function splitText(val) {
  if (!val) return [];
  return String(val)
    .split(/[,，]/)
    .map(v => v.trim())
    .filter(Boolean);
}

function normalizePatch(row = {}) {
  const patch = { ...row };
  if (patch.skillsText) {
    patch.skills = splitText(patch.skillsText);
    delete patch.skillsText;
  }
  if (patch.projectCasesText !== undefined) {
    patch.projectCases = textToProjectCases(patch.projectCasesText);
    delete patch.projectCasesText;
  }
  return patch;
}

export const add = row => {
  const patch = normalizePatch(row);
  const item = registerCandidate(patch);
  return Promise.resolve({ data: { code: 200, success: true, data: item } });
};

export const update = row => {
  return api.update(normalizePatch(row));
};

export const promote = id => {
  const item = promoteCandidate(id);
  return Promise.resolve({ data: { code: 200, success: true, data: item } });
};

export const reject = (id, reason) => {
  const item = rejectCandidate(id, reason);
  return Promise.resolve({ data: { code: 200, success: true, data: item } });
};

export const generateCandidateResume = (id, templateId) => {
  const item = generateResume(id, templateId);
  return Promise.resolve({ data: { code: 200, success: true, data: item } });
};

export const addToBid = (id, packageId) => {
  const item = addToBidPackage(id, packageId);
  return Promise.resolve({ data: { code: 200, success: true, data: item } });
};
