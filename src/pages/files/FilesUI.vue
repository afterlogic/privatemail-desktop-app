<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex flex-stretch" style="height: 100%">
      <q-splitter v-model="splitterFolderModel" style="height: 100%; width: 100%;">
        <template v-slot:before>
          <div class="column full-height">
            <div class="col-auto q-px-sm q-pb-md">
              <q-btn @click="uploadFiles" label="Upload files" flat no-caps size=18px color="primary" class="full-width big-button" />
            </div>
            <div class="col" style="overflow: hidden;">
              <q-scroll-area class="full-height ">
                <q-list>
                  <div  v-for="storage in storageList" :key="storage.DisplayName">
                    <q-item
                      :class="{active: currentStorage.DisplayName === storage.DisplayName}"
                      clickable v-ripple @click="selectStorage(storage)">
                      <q-item-section avatar>
                        <q-icon name="folder"></q-icon>
                      </q-item-section>
                      <q-item-section avatar>{{ storage.DisplayName }}</q-item-section>
                      <!-- <q-item-section side>3</q-item-section> -->
                    </q-item>
                  </div>
                </q-list>
              </q-scroll-area>
            </div>
          </div>
        </template>

        <template v-slot:after>
          <div class="column full-height bg-white text-grey-8 panel-rounded">
            <div class="col-auto">
              <toolbar />
              <q-toolbar style="width: 100%; background: #eee;">
                <q-input outlined rounded v-model="searchText" :dense=true style="width: 100%;">
                  <template v-slot:prepend>
                    <q-icon name="search" ></q-icon>
                  </template>
                  <!-- <template v-slot:after>
                    <q-btn round dense flat icon="send" ></q-btn>
                  </template> -->
                </q-input>
              </q-toolbar>
<!--              <q-breadcrumbs class="q-px-md q-py-sm">
                <q-breadcrumbs-el label="Home" icon="home" />
                <q-breadcrumbs-el label="Components" icon="widgets" />
                <q-breadcrumbs-el label="Breadcrumbs" />
              </q-breadcrumbs>-->
              <q-separator />
            </div>
            <router-view />
<!--            <div class="col">
              <q-scroll-area class="full-height">
                <div class="row q-pa-sm">
                  <q-card class="q-ma-md" v-for="n in 20" :key="n">
                    <q-card-section>
                      <div class="text-subtitle2">by John Doe</div>
                    </q-card-section>

                    <q-separator />
                    <q-card-section>
                      Image.jpg
                    </q-card-section>
                  </q-card>
                </div>
              </q-scroll-area>
            </div>-->
          </div>
        </template>
      </q-splitter>
    </q-page>
  </q-page-container>
</template>

<style scoped lang="scss">
</style>

<script>
import Toolbar from "./Toolbar"

export default {
  name: "FilesUI",
  components: {
    Toolbar,
  },
  data () {
    return {
      splitterFolderModel: 20,
      splitterMessageModel: 50,
      checkboxVal: false,
      searchText: ''
    }
  },
  mounted() {
    this.populate()
  },
  computed: {
    storageList () {
      return this.$store.getters['files/getStorageList']
    },
    currentStorage () {
      console.log(this.$store.getters['files/getCurrentStorage'], 'this.$store.getters[\'files/getCurrentStorage\']')
      return this.$store.getters['files/getCurrentStorage']
    }
  },
  methods: {
    populate () {
      this.$store.dispatch('files/asyncGetStorages')
    },
    selectStorage (currentStorage) {
      this.$store.dispatch('files/setCurrentStorage', { currentStorage })
      this.$router.push(`/files/${currentStorage.Type}`)
      console.log(this.currentStorage, 'currentStorage')
    },
    uploadFiles() {
      console.log('uploadFiles');
    }
  }
};
</script>
