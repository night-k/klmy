export default {
  data() {
    return {
      form: {},
      search: {},
      query: {},
      loading: false,
      page: { pageSize: 10, currentPage: 1, total: 0 },
      data: [],
      tabStatus: '',
    };
  },
  mounted() {
    this.applyRouteQuery();
    if (this.$route.query.status) {
      this.tabStatus = String(this.$route.query.status);
    }
  },
  methods: {
    applyRouteQuery() {
      const q = this.$route.query;
      if (q.projectId) this.query.projectId = q.projectId;
      if (q.status) this.tabStatus = q.status;
      if (q.auditStatus) this.tabStatus = q.auditStatus;
    },
    onTabChange() {
      this.page.currentPage = 1;
      this.onLoad(this.page);
    },
    searchChange(params, done) {
      this.query = { ...params };
      this.page.currentPage = 1;
      this.onLoad(this.page);
      done();
    },
    searchReset() {
      this.query = {};
      const q = this.$route.query;
      if (q.projectId) this.query.projectId = q.projectId;
      this.onLoad(this.page);
    },
    currentChange(currentPage) {
      this.page.currentPage = currentPage;
    },
    sizeChange(pageSize) {
      this.page.pageSize = pageSize;
    },
    refreshChange() {
      this.onLoad(this.page);
    },
    mapRows(records) {
      return records;
    },
  },
};
