<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex flex-stretch" style="height: 100%">
      <q-splitter v-model="splitterFolderModel" style="height: 100%; width: 100%;">
        <template v-slot:before>
          <div class="column full-height">
            <div class="col-auto q-px-sm">
              <q-btn label="New event" flat no-caps size=18px color="primary" class="full-width big-button" />
            </div>
            <div class="col">
              <q-list>
                <q-item clickable v-ripple >
                  <q-item-section avatar>
                    <q-icon name="event" />
                  </q-item-section>
                  <q-item-section>My calendar</q-item-section>
                </q-item>
                <q-item clickable v-ripple>
                  <q-item-section avatar>
                    <q-icon name="event" />
                  </q-item-section>
                  <q-item-section>Holydays</q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-auto full-width">
              <q-date v-model="date" dark color="purple" class="full-width"
         />
            </div>
          </div>
        </template>

        <template v-slot:after>
          <div class="column full-height bg-white text-grey-8 panel-rounded">
            <div class="col-auto">
              <toolbar />
            </div>
            <div class="col">
              <!-- <q-scroll-area class="full-height" style="min-height: 800px;"> -->
                <div class="column full-height">
                  <div class="col-2 row full-width" v-for="r in 6" :key="r">
                    <div class="col cell" v-for="n in 7" :key="n">{{(r- 1)*7 + n}}</div>
                  </div>
                </div>
              <!-- </q-scroll-area> -->
            </div>
          </div>
        </template>
      </q-splitter>
    </q-page>
  </q-page-container>
</template>

<style lang="scss">
.cell {
  border: 1px solid #eee;
  border-width: 1px 0px 0px 1px;
}
</style>

<script>
import Toolbar from "./Toolbar"

export default {
  name: "CalendarUI",
  components: {
    Toolbar,
  },
  data () {
    return {
      splitterFolderModel: 20,
      splitterMessageModel: 50,
      checkboxVal: false,
      searchText: '',
      date: '2019/02/01',
      dayCounter: 1
    }
  }
};
</script>
