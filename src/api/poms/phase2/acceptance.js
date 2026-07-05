import {
  createCrudApi,
  submitAcceptance as doSubmitAcceptance,
  verifyRectification,
  startRectification,
  submitRectification,
  getAcceptanceListPage,
  revokeAcceptance,
  getAcceptanceHistory,
} from './phase2Store';

const rectApi = createCrudApi('rectifications');

export const getAcceptancePage = getAcceptanceListPage;
export const submitAcceptance = doSubmitAcceptance;
export const getRectificationPage = rectApi.getPage;
export { verifyRectification, startRectification, submitRectification, revokeAcceptance, getAcceptanceHistory };
