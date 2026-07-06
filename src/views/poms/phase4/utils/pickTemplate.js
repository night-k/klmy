import { h, ref } from 'vue';
import { ElMessageBox, ElSelect, ElOption } from 'element-plus';

export function pickResumeTemplate(templates = []) {
  if (!templates.length) return Promise.reject('no-template');
  if (templates.length === 1) return Promise.resolve(templates[0].value);

  const selected = ref(templates[0].value);
  return ElMessageBox({
    title: '选择简历模板',
    message: () =>
      h(
        ElSelect,
        {
          modelValue: selected.value,
          'onUpdate:modelValue': val => {
            selected.value = val;
          },
          style: { width: '100%' },
          filterable: true,
        },
        {
          default: () => templates.map(t => h(ElOption, { key: t.value, label: t.label, value: t.value })),
        },
      ),
    showCancelButton: true,
    confirmButtonText: '生成',
    cancelButtonText: '取消',
  }).then(() => selected.value);
}
