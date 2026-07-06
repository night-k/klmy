import { addTemplate, createCrudApi, getTemplateOptions } from './phase4Store';

const api = createCrudApi('templates');

export const getPage = api.getPage;
export const getList = api.getList;
export const getDetail = api.getDetail;
export const remove = api.remove;

export const getOptions = type => {
  return Promise.resolve({ data: { code: 200, success: true, data: getTemplateOptions(type) } });
};

export const add = row => {
  const item = addTemplate(row);
  return Promise.resolve({ data: { code: 200, success: true, data: item } });
};

export const update = row => {
  const patch = { ...row };
  const files = patch.templateFiles;
  if (Array.isArray(files) && files.length) {
    patch.templateFile = files[0];
    patch.fileName = files[0].name;
    delete patch.templateFiles;
  }
  return api.update(patch);
};
