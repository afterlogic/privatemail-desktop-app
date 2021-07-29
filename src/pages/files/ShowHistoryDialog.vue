<template>
  <div>
    <q-dialog v-model="confirm" persistent>
      <q-card class="q-dialog-size" style="min-width: 900px">
        <div>
          <q-item class="bg-grey-4">
            <q-item-section>
              <q-item-label>Date</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label>Action</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label>IP</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label>User</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-for="item in historyList" :key="item.Timestamp">
            <q-item-section>
              <q-item-label>{{ getDate(item.Timestamp) }}</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.Action }}</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.IpAddress }}</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.GuestPublicId }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <pagination :currentPage="currentPage" :itemsPerPage="10" :itemsCount="itemsCount" :changePage="changePage"></pagination>
        <q-card-actions align="right">
          <q-btn flat :ripple="false" color="primary"
                 label="Clear" @click="openClearDialog"/>
          <q-btn flat class="q-px-sm" :ripple="false" color="primary"
                 label="Cancel" @click="cancel"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="confirmClearDialog" persistent>
      <q-card class="q-dialog-size" style="min-width: 300px">
        <q-item class="q-mt-md">
          <q-item-section>
            <q-item-label>Are you sure you want to clear the entire activity history?</q-item-label>
          </q-item-section>
        </q-item>
        <q-card-actions align="right">
          <q-btn flat class="q-px-sm" :ripple="false" color="primary" @click="clearHistory"
                 label="Ok" />
          <q-btn flat class="q-px-sm" :ripple="false" color="primary" v-close-popup
                 label="Cancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import date from '../../utils/date'
import Pagination from '../Pagination'

export default {
  name: 'ShowHistoryDialog',
  components: {
    Pagination
  },
  data () {
    return {
      confirm: false,
      confirmClearDialog: false,
      file: null,
      historyList: [],
      itemsCount: 0,
      offset: 0,
      currentPage: 1
    }
  },
  methods: {
    changePage (page) {
      this.currentPage = page
      this.offset = (page - 1) * 10
      this.getHistory(this.file)
    },
    getDate (timestamp) {
      return date.getFullDate(timestamp)
    },
    openDialog (file) {
      this.currentPage = 1
      this.offset = 0
      this.historyList = []
      this.getHistory(file)
      this.confirm = true
    },
    getHistory (file) {
      this.file = file
      const resourceId = file.Type + file.Path + '/' + file.Name
      this.$store.dispatch('files/getHistory', {
        resourceType: 'file',
        resourceId: resourceId,
        offset: this.offset,
        limit: 10
      }).then( result => {
        if (result) {
          this.historyList = result.Items
          this.itemsCount = result.Count
        }
      })
    },
    openClearDialog () {
      this.confirmClearDialog = true
    },
    clearHistory () {
      this.confirmClearDialog = false
      const resourceId = this.file.Type + this.file.Path + '/' + this.file.Name
      this.$store.dispatch('files/clearHistory', {
        resourceType: 'file',
        resourceId: resourceId,
      }).then( result => {
        if (result) {
          this.getHistory(this.file)
        }
      })
    },
    cancel () {
      this.confirm = false
    },
  }
}
</script>

<style scoped>

</style>
