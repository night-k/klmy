<template>
  <el-drawer v-model="visible" title="招聘邮箱" size="720px" append-to-body destroy-on-close @closed="$emit('closed')">
    <el-table v-loading="loading" :data="emails" border size="small">
      <el-table-column prop="subject" label="主题" min-width="220" show-overflow-tooltip />
      <el-table-column prop="candidateName" label="候选人" min-width="100" />
      <el-table-column prop="source" label="来源" width="100" />
      <el-table-column prop="receivedAt" label="接收时间" min-width="150" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag size="small" :type="row.processed ? 'success' : 'info'">{{ row.processed ? '已入库' : '待处理' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button v-if="!row.processed" type="primary" link @click="$emit('intake', row)">登记入库</el-button>
          <el-button v-else type="success" link @click="$emit('view-candidate', row)">查看候选人</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-drawer>
</template>

<script>
export default {
  name: 'EmailIntakeDrawer',
  props: {
    modelValue: { type: Boolean, default: false },
    emails: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'closed', 'intake', 'view-candidate'],
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
  },
};
</script>
