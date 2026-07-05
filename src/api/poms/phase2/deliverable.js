import { createCrudApi, addDeliverable, submitDeliverableForReview } from './phase2Store';

const api = createCrudApi('deliverables');

export const getPage = api.getPage;
export const getDetail = api.getDetail;
export const add = addDeliverable;
export const update = api.update;
export const remove = api.remove;
export const submitForReview = submitDeliverableForReview;
