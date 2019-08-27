<template>
  <div class="column full-height bg-white text-black">
    <div v-if="message === null">
      No message selected.
      <br />
      Click any message in the list to preview it here or double-click to view it full size.
    </div>
    <div v-if="message !== null">
      <div class="col-auto">
        <q-toolbar style="float: right; width: auto;">
          <q-btn flat color="primary" icon="reply">
            <q-tooltip>
              Reply
            </q-tooltip>
          </q-btn>
          <q-btn flat color="primary" icon="reply_all">
            <q-tooltip>
              Reply To All
            </q-tooltip>
          </q-btn>
          <q-btn flat color="primary" icon="forward">
            <q-tooltip>
              Forward
            </q-tooltip>
          </q-btn>
          <q-btn flat color="primary" icon="open_in_new">
            <q-tooltip>
              Open in a new window
            </q-tooltip>
          </q-btn>
          <q-btn-dropdown flat color="primary">
            <template v-slot:label>
              <q-btn flat icon="more_horiz" />
              <q-tooltip>
                More
              </q-tooltip>
            </template>
            <q-list>
              <q-item clickable>
                <q-item-section side>
                  <q-icon name="print" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Print</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable>
                <q-item-section side>
                  <q-icon name="arrow_downward" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Download as .eml</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable>
                <q-item-section side>
                  <q-icon name="forward" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Forward as attachment</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable>
                <q-item-section side>
                  <q-icon name="code" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>View message headers</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-toolbar>
        <div class="q-pt-xs q-px-md">
          <q-chip v-for="fromAddr in from" :key="'from_' + fromAddr" icon-right="add">{{fromAddr}}</q-chip>
          →
          <q-chip v-for="toAddr in to" :key="'to_' + toAddr">{{toAddr}}</q-chip>
          <div class="row items-center q-pa-xs" style="clear: both;">
            <div class="col subject text-h5">{{message.Subject}}</div>
            <div class="col-auto date">{{message.MiddleDate}}</div>
          </div>
        </div>
        <q-separator />
      </div>
      <div class="col" style="height: 100%;">
        <q-scroll-area style="height: 100%;">
          <div class="q-pa-md" v-if="!message.Received">
            Loading...
          </div>
          <div class="q-pa-md" v-if="message.Received && message.Html" v-html="message.Html">
          </div>
          <div class="q-pa-md" v-if="message.Received && !message.Html" v-html="message.Plain">
            <!-- <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Dapibus ultrices in iaculis nunc sed augue. Egestas integer eget aliquet nibh praesent. Orci ac auctor augue mauris augue. Sed risus pretium quam vulputate dignissim suspendisse in est ante. Eget sit amet tellus cras adipiscing. Lobortis scelerisque fermentum dui faucibus in ornare. In nulla posuere sollicitudin aliquam ultrices sagittis orci a scelerisque. Blandit aliquam etiam erat velit scelerisque in dictum non consectetur. Tortor vitae purus faucibus ornare suspendisse sed nisi lacus sed. Pellentesque diam volutpat commodo sed egestas. Blandit libero volutpat sed cras ornare arcu dui vivamus arcu. Auctor augue mauris augue neque gravida in fermentum et sollicitudin. Egestas pretium aenean pharetra magna ac placerat vestibulum. Ultrices sagittis orci a scelerisque purus semper eget duis at. Aliquet risus feugiat in ante metus dictum at tempor commodo. Nullam non nisi est sit amet facilisis magna. Est placerat in egestas erat imperdiet sed euismod. Bibendum enim facilisis gravida neque convallis a.</p>
            <p>Sit amet luctus venenatis lectus. Erat velit scelerisque in dictum. Et molestie ac feugiat sed lectus vestibulum mattis ullamcorper. Vel pretium lectus quam id leo. Sapien faucibus et molestie ac feugiat sed lectus vestibulum mattis. Suspendisse in est ante in nibh mauris cursus. Tellus elementum sagittis vitae et. Ut pharetra sit amet aliquam id diam maecenas ultricies. Egestas sed tempus urna et pharetra pharetra massa. Ultrices sagittis orci a scelerisque purus semper. Egestas sed tempus urna et pharetra pharetra massa massa. Lectus magna fringilla urna porttitor. Magna etiam tempor orci eu lobortis elementum. Nibh sit amet commodo nulla facilisi nullam vehicula. Molestie at elementum eu facilisis.</p>
            <p>Vel fringilla est ullamcorper eget nulla facilisi etiam dignissim. Libero volutpat sed cras ornare arcu dui vivamus arcu felis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames. Commodo odio aenean sed adipiscing diam donec. Quis varius quam quisque id. Mauris sit amet massa vitae tortor. Egestas integer eget aliquet nibh. Risus at ultrices mi tempus. Pellentesque elit ullamcorper dignissim cras tincidunt lobortis feugiat vivamus at. Ultricies leo integer malesuada nunc. Amet commodo nulla facilisi nullam vehicula. Lectus nulla at volutpat diam ut. Urna nunc id cursus metus aliquam eleifend mi in nulla. Rhoncus est pellentesque elit ullamcorper dignissim cras. Malesuada bibendum arcu vitae elementum curabitur.</p>
            <p>Vitae suscipit tellus mauris a diam maecenas sed enim. Semper quis lectus nulla at. Eget est lorem ipsum dolor sit. In nibh mauris cursus mattis molestie a iaculis at erat. Ultrices neque ornare aenean euismod elementum. Urna duis convallis convallis tellus id interdum velit laoreet id. Tellus rutrum tellus pellentesque eu tincidunt tortor aliquam nulla. Sed ullamcorper morbi tincidunt ornare massa. Ac odio tempor orci dapibus ultrices. Commodo viverra maecenas accumsan lacus vel facilisis. Metus dictum at tempor commodo ullamcorper a lacus vestibulum sed. Ut aliquam purus sit amet luctus venenatis lectus magna fringilla. Pulvinar neque laoreet suspendisse interdum consectetur libero id. Bibendum est ultricies integer quis auctor elit sed. Orci eu lobortis elementum nibh tellus molestie. Ullamcorper malesuada proin libero nunc consequat interdum varius. Sed risus ultricies tristique nulla aliquet enim tortor at. Nisl vel pretium lectus quam id leo.</p>
            <p>Et pharetra pharetra massa massa ultricies mi quis hendrerit. Quisque sagittis purus sit amet volutpat consequat mauris. Nunc non blandit massa enim nec dui nunc. Vestibulum lorem sed risus ultricies tristique nulla. Blandit libero volutpat sed cras ornare arcu dui. Mattis rhoncus urna neque viverra justo. Mattis rhoncus urna neque viverra justo nec ultrices dui. Sit amet commodo nulla facilisi nullam vehicula ipsum a. Turpis cursus in hac habitasse platea dictumst quisque sagittis purus. Et ultrices neque ornare aenean euismod elementum. Gravida neque convallis a cras semper auctor neque vitae. Dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Nunc eget lorem dolor sed viverra ipsum nunc aliquet bibendum. Magna eget est lorem ipsum dolor. Viverra suspendisse potenti nullam ac tortor vitae purus faucibus. Ac tincidunt vitae semper quis lectus nulla at. Et ultrices neque ornare aenean euismod. Sed risus pretium quam vulputate dignissim suspendisse in est ante. Nunc aliquet bibendum enim facilisis.</p> -->
          </div>
        </q-scroll-area>
      </div>
      <div class="col-3" v-if="message.HasAttachments && message.Attachments && message.Attachments['@Collection']" style="background: yellow;">
        <div v-for="attach in message.Attachments['@Collection']" :key="attach.Hash" v-show="!attach.IsLinked">
          {{attach.FileName}} - {{attach.EstimatedSize}} - 
          <a v-if="attach.Actions && attach.Actions.download && attach.Actions.download.url" :href="'http://aurora.dev.com/' + attach.Actions.download.url" target="_blank">download</a>
        </div>
      </div>
      <div class="col-3">
        <q-separator />
        <div class="q-px-md q-pt-md">
          <q-editor v-model="replyText" min-height="6rem" />
        </div>
        <q-toolbar class="q-pa-md">
          <q-btn color="primary" label="Send" />
          <q-btn color="primary" label="Save" />
          Ctrl+Enter to send
          <q-space />
          <a>Open full reply form </a>
        </q-toolbar>
      </div>
    </div>
  </div>
</template>

<style></style>

<script>
import addressUtils from 'src/utils/address'

export default {
  name: 'MessageViewer',
  data () {
    return {
      replyText: '',
    }
  },
  computed: {
    message () {
      return this.$store.getters['mail/getСurrentMessage']
    },
    from () {
      var oFrom = this.message.From
      var aFrom = []
      _.each(oFrom['@Collection'], function (oAddress) {
        aFrom.push(addressUtils.getFullEmail(oAddress.DisplayName, oAddress.Email))
      })
      return aFrom
    },
    to () {
      var aAddresses = _.union(this.message.To ? this.message.To['@Collection'] : [], this.message.Cc ? this.message.Cc['@Collection'] : [], this.message.Bcc ? this.message.Bcc['@Collection'] : [])
      var aTo = []
      _.each(aAddresses, function (oAddress) {
        aTo.push(addressUtils.getFullEmail(oAddress.DisplayName, oAddress.Email))
      })
      return aTo
    },
  },
  watch: {
    message: function () {
      if (this.message.Attachments && this.message.Attachments['@Collection'] && this.message.Attachments['@Collection'][0]
          && this.message.Attachments['@Collection'][0].Actions && this.message.Attachments['@Collection'][0].Actions.download
          && this.message.Attachments['@Collection'][0].Actions.download.url) {
        console.log(this.message.Attachments['@Collection'][0].Actions.download.url)
      }
    }
  },
}
</script>
