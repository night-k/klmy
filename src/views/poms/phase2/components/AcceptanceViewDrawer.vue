<template>
  <el-drawer v-model="visible" title="项目验收" size="640px" append-to-body destroy-on-close @closed="$emit('closed')">
    <div v-if="projectId" class="drawer-body">
      <div class="drawer-toolbar">
        <el-button link type="primary" @click="goSpace">进入项目空间</el-button>
        <el-button link type="primary" @click="goMilestone">里程碑验收</el-button>
      </div>
      <acceptance-tab :project-id="projectId" :can-submit="canSubmit" @changed="$emit('changed')" />
    </div>
  </el-drawer>
</template>

<script>
import AcceptanceTab from './tabs/AcceptanceTab.vue';
import { getDetail } from '@/api/poms/phase2/projectAdapter';
import { canAccept } from '../utils/projectFlow';

export default {
  components: { AcceptanceTab },
  props: {
    modelValue: Boolean,
    projectId: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'closed', 'changed'],
  data() {
    return { projectDetail: null };
  },
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(v) {
        this.$emit('update:modelValue', v);
      },
    },
    canSubmit() {
      return canAccept(this.projectDetail);
    },
  },
  watch: {
    projectId: {
      immediate: true,
      handler(id) {
        if (id)
          getDetail(id).then(res => {
            this.projectDetail = res.data.data;
          });
      },
    },
  },
  methods: {
    goSpace() {
      this.$router.push({ path: '/poms/phase2/projectSpace', query: { projectId: this.projectId, tab: 'milestone' } });
    },
    goMilestone() {
      this.$router.push({ path: '/poms/phase2/projectSpace', query: { projectId: this.projectId, tab: 'milestone' } });
    },
  },
};
</script>

<style scoped>
.drawer-toolbar {
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
}
</style>
