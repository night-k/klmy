<template>
  <el-drawer v-model="visible" title="成果物管理" size="720px" append-to-body destroy-on-close @closed="$emit('closed')">
    <div v-if="projectId" class="drawer-body">
      <div class="drawer-toolbar">
        <el-button link type="primary" @click="goSpace">进入项目空间</el-button>
      </div>
      <deliverable-tab ref="deliverableTab" :project-id="projectId" :task-id="taskId" />
    </div>
  </el-drawer>
</template>

<script>
import DeliverableTab from './tabs/DeliverableTab.vue';

export default {
  components: { DeliverableTab },
  props: {
    modelValue: Boolean,
    projectId: { type: String, default: '' },
    taskId: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'closed'],
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(v) {
        this.$emit('update:modelValue', v);
      },
    },
  },
  watch: {
    visible(val) {
      if (val && this.taskId) {
        this.$nextTick(() => this.$refs.deliverableTab?.openWithTask(this.taskId));
      }
    },
  },
  methods: {
    goSpace() {
      this.$router.push({ path: '/poms/phase2/projectSpace', query: { projectId: this.projectId } });
    },
  },
};
</script>

<style scoped>
.drawer-toolbar {
  margin-bottom: 12px;
}
</style>
