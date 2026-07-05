export default {
  data() {
    return {
      projectId: String(this.$route.query.projectId || ''),
      projectDetail: null,
    };
  },
  methods: {
    onProjectLoaded(detail) {
      this.projectDetail = detail;
    },
    onModuleChanged() {
      if (this.projectId && this.$refs.contextBar) {
        this.$refs.contextBar.loadDetail(this.projectId);
      }
    },
  },
};
