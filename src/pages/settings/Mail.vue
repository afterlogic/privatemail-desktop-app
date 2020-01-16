<template>
  <div>
    <div class="text-h4 q-mb-md">Mail</div>
    <q-separator spaced />
    <q-list style="max-width: 500px;">
      <!-- <q-item>
        <q-item-section side center style="min-width: 140px;">
          Layout
        </q-item-section>
        <q-item-section>
          <q-select outlined v-model="layoutValue" :options="layoutList" :dense=true style="width: 100%;"/>
        </q-item-section>
      </q-item> -->

      <q-item>
        <q-item-section side center style="min-width: 140px;">
          Messages per page
        </q-item-section>
        <q-item-section>
          <q-select outlined v-model="perPageValue" :options="perPageList" :dense=true style="width: 100%;"/>
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section side top>
          <q-checkbox v-model="draftAutosave" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Allow autosave in Drafts</q-item-label>
          <!-- <q-item-label caption>
            Some feature description
          </q-item-label> -->
        </q-item-section>
      </q-item>

      <!-- <q-item tag="label" v-ripple>
        <q-item-section side top>
        </q-item-section>
        <q-item-section>
          <q-item-label>Allow handling email links</q-item-label>
          <q-item-label caption>
            Open Compose screen on clicking mailto link on any web site.
            The link above may do nothing if you already set mailto association before.
          </q-item-label>
        </q-item-section>
      </q-item> -->
    </q-list>
    <q-separator spaced />
    <q-btn color="primary" label="Save" align="right" />
  </div>

</template>

<style></style>

<script>
export default {
  name: 'MailSettings',

  data () {
    return {
      draftAutosave: false,
      layoutValue: 'Vertical split',
      layoutList: [
        {
          label: 'Vertical split',
          value: 0
        },
        {
          label: 'Horizontal split',
          value: 1
        },
      ],
      perPageValue: 20,
      perPageList: [10,20,30,50,100,200],
    }
  },
}
</script>
