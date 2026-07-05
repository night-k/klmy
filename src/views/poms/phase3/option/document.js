import { DOC_TYPE, FILE_FORMAT, PERMISSION_SCOPE, SOURCE_TYPE } from './dict';

export function Option() {
  return {
    border: true,
    index: true,
    indexLabel: '序号',
    stripe: true,
    menuAlign: 'center',
    align: 'center',
    searchMenuSpan: 6,
    searchShow: true,
    addBtn: false,
    editBtn: false,
    delBtn: false,
    viewBtn: false,
    column: [
      { label: '文档编号', prop: 'code', search: true, minWidth: 140, slot: true },
      { label: '文档名称', prop: 'name', search: true, minWidth: 200, overHidden: true },
      { label: '文档类型', prop: 'docType', type: 'select', dicData: DOC_TYPE, search: true, width: 110, slot: true },
      { label: '格式', prop: 'fileFormat', type: 'select', dicData: FILE_FORMAT, width: 80 },
      { label: '关联项目', prop: 'projectName', minWidth: 160, overHidden: true },
      { label: '版本', prop: 'version', width: 80 },
      { label: '来源', prop: 'sourceType', type: 'select', dicData: SOURCE_TYPE, width: 100, slot: true },
      { label: '权限', prop: 'permissionScope', type: 'select', dicData: PERMISSION_SCOPE, width: 90, slot: true },
      { label: '上传人', prop: 'uploaderName', width: 90 },
      { label: '上传时间', prop: 'uploadTime', width: 160 },
    ],
  };
}
