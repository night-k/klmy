import { createCrudApi, passMilestone, canPassMilestone, revokeMilestone } from './phase2Store';

const api = createCrudApi('milestones');

export const getPage = api.getPage;
export const getDetail = api.getDetail;
export const add = api.add;
export const update = api.update;
export const pass = passMilestone;
export { canPassMilestone, revokeMilestone };
