import { createCrudApi, dispatchTasks, startTask, submitTaskReview, checkPreTasks as checkPreTasksApi, getTaskDetail as getTaskDetailApi, cancelTask } from './phase2Store';

const api = createCrudApi('tasks');

export const getPage = api.getPage;
export const getDetail = api.getDetail;
export const add = api.add;
export const update = api.update;
export const remove = api.remove;
export const dispatch = dispatchTasks;
export const start = startTask;
export const submitReview = submitTaskReview;
export const checkPreTasks = checkPreTasksApi;
export const getTaskDetail = getTaskDetailApi;
export const cancel = cancelTask;
