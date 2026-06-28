import { createCrudApi } from './mockStore';

const api = createCrudApi('tenders');

export const getPage = api.getPage;
export const getList = api.getList;
export const getDetail = api.getDetail;
export const add = api.add;
export const update = api.update;
export const remove = api.remove;
