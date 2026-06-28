import {
  createCrudApi,
  getPaymentStatistics,
  getPaymentProjectTree,
  getContractPaymentPage,
  getContractPaymentDetail,
  updatePaymentNode,
} from './mockStore';

const api = createCrudApi('payments');

export const getPage = getContractPaymentPage;
export const getList = getContractPaymentPage;
export const getDetail = getContractPaymentDetail;
export const update = updatePaymentNode;
export const updateNode = updatePaymentNode;
export const add = api.add;
export const remove = api.remove;

export const getStatistics = scope => {
  return Promise.resolve({ data: { code: 200, success: true, data: getPaymentStatistics(scope) } });
};

export const getProjectTree = () => {
  return Promise.resolve({ data: { code: 200, success: true, data: getPaymentProjectTree() } });
};
