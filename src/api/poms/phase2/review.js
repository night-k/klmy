import { createCrudApi, approveReview, rejectReview } from './phase2Store';

const api = createCrudApi('resultReviews');

export const getPage = api.getPage;
export const getDetail = api.getDetail;
export { approveReview, rejectReview };
