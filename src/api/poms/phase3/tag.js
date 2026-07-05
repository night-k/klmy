import { createTagCrud, getTagSuggestions } from './phase3Store';

const api = createTagCrud();

export const getPage = api.getPage;
export const add = api.add;
export const update = api.update;
export const remove = api.remove;
export { getTagSuggestions };
