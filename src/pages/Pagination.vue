<template>
  <div class="pagination" :class="{'hidden': pages.length <= 1}">
    <q-btn icon="chevron_left" dense flat unelevated color="primary" v-if="firstPage !== null" @click="changePage(firstPage)" />
    <q-btn unelevated flat color="primary" :class="{'current-page': currentPage === page}" :label="page" v-for="page in pages" :key="page" @click="changePage(page)" />
    <q-btn icon="chevron_right" dense flat unelevated color="primary" v-if="lastPage !== null" @click="changePage(lastPage)" />
  </div>
</template>

<style lang="scss" scoped>
  .pagination {
    border-top: solid 1px #ddd;
    padding: 10px;
    text-align: right;

    &.hidden {
      display: none;
    }

    .q-btn {
      &.current-page {
        color: #000000;
        cursor: default;
      }
    }
  }
</style>

<script>
export default {
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      default: 1,
    },
    itemsPerPage: {
      type: Number,
      default: 20,
    },
    itemsCount: {
      type: Number,
      default: 0,
    },
    changePage: Function,
  },
  computed: {
    pagesCount: function () {
      return Math.ceil(this.itemsCount / this.itemsPerPage)
    },
    pages: function () {
      let iStartPage = this.currentPage - 2
      if (iStartPage < 1) {
        iStartPage = 1
      }
      let iEndPage = iStartPage + 4
      if (iEndPage > this.pagesCount) {
        iEndPage = this.pagesCount
      }

      let aPages = []
      for (let i = iStartPage; i <= iEndPage; i++) {
        aPages.push(i)
      }

      return aPages
    },
    firstPage: function () {
      if (this.pages.length === 0 || this.pages[0] === 1) {
        return null
      }
      return 1
    },
    lastPage: function () {
      if (this.pages.length === 0 || this.pages[this.pages.length - 1] === this.pagesCount) {
        return null
      }
      return this.pagesCount
    },
  },
}
</script>
