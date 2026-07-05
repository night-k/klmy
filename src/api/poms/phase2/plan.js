import { createCrudApi, activatePlan, archivePlan } from './phase2Store';

const api = createCrudApi('plans');

export const getPage = api.getPage;
export const getDetail = api.getDetail;
export const add = api.add;
export const update = api.update;
export const remove = api.remove;
export const activate = activatePlan;
export const archive = archivePlan;
