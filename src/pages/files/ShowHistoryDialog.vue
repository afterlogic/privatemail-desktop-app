<template>
  <div>
    <q-dialog v-model="confirm" >
        <q-card class="q-dialog-size" style="min-width: 820px">
          <h6 class="q-mx-md q-my-md">{{ title }}</h6>
          <div class="q-mx-md" style=" border-color: #d5d9dc; border-style: solid; border-width: 1px 1px 0 1px; border-radius: 3px; font-size: 10pt">
            <q-item class="bg-grey-4" style="border-bottom: 1px solid #d5d9dc;" dense>
              <q-item-section>
                <q-item-label><b>Date</b></q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label><b>Action</b></q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label><b>IP</b></q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label><b>User</b></q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="!historyList.length" clickable style="border-bottom: 1px solid #d5d9dc">
              <q-item-section>
                <q-item-label><div style="text-align: center">There is no history yet</div></q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-for="item in historyList" :key="item.Timestamp" style="border-bottom: 1px solid #d5d9dc" dense>
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
          <pagination :currentPage="currentPage" :itemsPerPage="10" :itemsCount="itemsCount" :changePage="changePage" :border="false"></pagination>
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
      title: '',
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
    openDialog (file, title) {
      this.title = title
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
