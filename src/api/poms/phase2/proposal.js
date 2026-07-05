import { createCrudApi, approveProposal, rejectProposal } from './phase2Store';

const api = createCrudApi('proposals');

export const getPage = api.getPage;
export const getDetail = api.getDetail;
export const add = api.add;
export const update = api.update;
export const remove = api.remove;
export const approve = approveProposal;
export const reject = rejectProposal;
