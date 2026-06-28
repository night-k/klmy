import { createCrudApi, createContractFromWinbid, syncTenderWinInfo } from './mockStore';

const api = createCrudApi('winbids');

export const getPage = api.getPage;
export const getList = api.getList;
export const getDetail = api.getDetail;
export const remove = api.remove;
export const generateContract = createContractFromWinbid;

export function add(row) {
  return api.add(row).then(res => {
    syncTenderWinInfo(res.data.data);
    return res;
  });
}

export function update(row) {
  return api.update(row).then(res => {
    syncTenderWinInfo(res.data.data);
    return res;
  });
}
