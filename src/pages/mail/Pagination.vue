<template>
  <div class="pagination">
    <ul>
      <li v-if="firstPage !== null" @click="changePage(firstPage)">&laquo;</li>
      <li v-for="page in pages" :key="page" :class="currentPage === page ? 'current-page' : ''" @click="changePage(page)">{{page}}</li>
      <li v-if="lastPage !== null" @click="changePage(lastPage)">&raquo;</li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
  .pagination {
    border-top: solid 1px #ddd;
    background: rgb(238, 238, 238);

    ul {
      list-style-type: none;

      li {
        cursor: pointer;
        float: left;
        padding: 4px 10px;
      }

      li.current-page {
        background: gray;
        border-radius: 16px;
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
    messagesPerPage: {
      type: Number,
      default: 20,
    },
    messagesCount: {
      type: Number,
      default: 0,
    },
    changePage: Function,
  },
  computed: {
    pagesCount: function () {
      return Math.ceil(this.messagesCount / this.messagesPerPage)
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
      if (this.pages[0] === 1) {
        return null
      }
      return 1
    },
    lastPage: function () {
      if (this.pages[this.pages.length - 1] === this.pagesCount) {
        return null
      }
      return this.pagesCount
    },
  },
}
</script>
