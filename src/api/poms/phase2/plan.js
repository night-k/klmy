import { createCrudApi, activatePlan, archivePlan, syncMilestonesFromPlan } from './phase2Store';

const api = createCrudApi('plans');

export const getPage = api.getPage;
export const getDetail = api.getDetail;
export const add = api.add;
export const remove = api.remove;
export const activate = activatePlan;
export const archive = archivePlan;

export const update = row => {
  return api.update(row).then(res => {
    const item = res.data.data;
    if (item?.status === 'active') syncMilestonesFromPlan(item);
    return res;
  });
};
