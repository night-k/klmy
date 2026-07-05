<template>
  <div class="project-space-entry">
    <el-empty v-if="!activeProjectId" description="请从项目列表进入项目空间" :image-size="120" />
    <project-space-detail v-else :project-id="activeProjectId" hide-breadcrumb />
  </div>
</template>

<script>
import projectSpaceDetail from './index.vue';
import { getPage } from '@/api/poms/phase2/projectAdapter';

export default {
  name: 'PomsPhase2ProjectSpaceEntry',
  components: { projectSpaceDetail },
  data() {
    return { activeProjectId: null };
  },
  watch: {
    '$route.query.projectId': {
      handler() {
        this.bootstrapSelection();
      },
    },
  },
  mounted() {
    this.bootstrapSelection();
  },
  methods: {
    async bootstrapSelection() {
      const routeProjectId = this.$route?.query?.projectId;
      if (routeProjectId) {
        this.activeProjectId = routeProjectId;
        return;
      }
      const res = await getPage(1, 1, {});
      const first = res?.data?.data?.records?.[0];
      if (first?.id) this.activeProjectId = first.id;
    },
  },
};
</script>
