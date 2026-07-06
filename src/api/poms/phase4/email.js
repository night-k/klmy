import { createCrudApi, createCandidateFromEmail } from './phase4Store';

const api = createCrudApi('recruitmentEmails');

export const getPage = api.getPage;
export const getList = api.getList;
export const getDetail = api.getDetail;

export const intake = emailId => {
  const item = createCandidateFromEmail(emailId);
  return Promise.resolve({ data: { code: 200, success: true, data: item } });
};
