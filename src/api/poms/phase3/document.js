import { createDocumentCrud } from './phase3Store';

const api = createDocumentCrud();

export const getPage = api.getPage;
export const getDetail = api.getDetail;
export const add = api.add;
export const update = api.update;
export const remove = api.remove;
