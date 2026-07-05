<template>
  <el-drawer v-model="visible" title="开题报告" size="720px" append-to-body destroy-on-close @closed="$emit('closed')">
    <div v-if="projectId" class="drawer-body">
      <div class="drawer-toolbar">
        <el-button link type="primary" @click="goSpace">进入项目空间</el-button>
      </div>
      <proposal-tab :project-id="projectId" @changed="$emit('changed')" />
    </div>
  </el-drawer>
</template>

<script>
import ProposalTab from './tabs/ProposalTab.vue';

export default {
  components: { ProposalTab },
  props: {
    modelValue: Boolean,
    projectId: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'closed', 'changed'],
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
