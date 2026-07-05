import { TAG_DIMENSION } from './dict';

export function Option() {
  return {
    border: true,
    index: true,
    stripe: true,
    menuAlign: 'center',
    align: 'center',
    searchMenuSpan: 6,
    addBtn: true,
    editBtn: false,
    delBtn: false,
    viewBtn: false,
    column: [
      { label: '标签名称', prop: 'name', search: true, rules: [{ required: true, message: '请输入标签名称' }] },
      { label: '维度', prop: 'dimension', type: 'select', dicData: TAG_DIMENSION, search: true, slot: true },
      { label: '类型', prop: 'system', width: 100, slot: true, addDisplay: false, editDisplay: false },
      { label: '关联文档数', prop: 'docCount', width: 110, addDisplay: false, editDisplay: false },
      { label: '创建时间', prop: 'createTime', width: 160, addDisplay: false, editDisplay: false },
    ],
  };
}
