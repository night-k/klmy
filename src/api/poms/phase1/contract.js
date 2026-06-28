import { createCrudApi, syncContractPayments } from './mockStore';

const api = createCrudApi('contracts');

export const getPage = api.getPage;
export const getList = api.getList;
export const getDetail = api.getDetail;

export const add = row => api.add(row).then(res => {
  if (res.data.data?.paymentPlans?.length) syncContractPayments(res.data.data);
  return res;
});

export const update = row => api.update(row).then(res => {
  if (res.data.data?.paymentPlans?.length) syncContractPayments(res.data.data);
  return res;
});

export const remove = api.remove;
