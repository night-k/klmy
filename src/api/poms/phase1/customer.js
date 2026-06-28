import { createCrudApi, getCustomerHistory } from './mockStore';

const api = createCrudApi('customers');

export const getPage = api.getPage;
export const getList = api.getList;
export const getDetail = api.getDetail;
export const add = api.add;
export const update = api.update;
export const remove = api.remove;

export const getHistory = customerId => {
  return Promise.resolve({ data: { code: 200, success: true, data: getCustomerHistory(customerId) } });
};
