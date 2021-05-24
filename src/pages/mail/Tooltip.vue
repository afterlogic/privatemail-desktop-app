<template>
  <div class="progress-bar" style="margin-bottom: 10px">
    <div id="myProgress" @click="move">
      <div id="myBar"></div>
    </div>
    <q-tooltip anchor="top middle" self="center middle" v-on="test()">{{JSON.stringify(userSpace)}}</q-tooltip>
    <br>
  </div>
</template>

<script>
export default {
  name: "Tooltip",
  data () {
    return {
      accountCapacity: 0,
      //userSpace: 0,
    }
  },
  computed: {
    userQuota() {
      //TODO make this.$store.getters['mail/getAccountQuota'] work
      var oAccount = this.$store.getters['mail/getCurrentAccount'];
      // console.log('test function', oAccount.aQuota, oAccount);
      console.log('oAccount in null', oAccount == null);
      return oAccount && oAccount.aQuota ? oAccount.aQuota : [];
      // return this.$store.getters['mail/getAccountQuota']
    },
    userSpace() {
      return this.$store.getters['mail/getAccountQuota']
    }
  },
  watch: {
    userQuota() {
      console.log(this.userQuota, 'userQuota')
    }
  },
  methods: {
    move() {
      this.test()
      let elem = document.getElementById("myBar");
      let width = 1;
      let id = setInterval(frame, 10);
      function frame() {
        if (width >= 100) {
          clearInterval(id);
        } else {
          width++;
          elem.style.width = width + '%';
        }
      }
    },
    test() {
      // var oAccount = this.$store.getters['mail/getCurrentAccount'];

      // console.log('test function', oAccount.aQuota, oAccount);
      // console.log(this.$store.getters['mail/getCurrentAccount'], 'this.$store.getters[mail/getCurrentAccount]')
      // console.log(this.$store.getters['mail/getAccountQuota'], 'this.$store.getters[mail/getCurrentAccount]')
    }
  }
}
</script>

<style scoped>
.progress-bar {
  display: flex;
  align-items: center;
}
#myProgress {
  margin: auto;
  height: 10px;
  width: 60%;
  background-color: transparent;
  padding: 2px 4px 2px 4px;
  border: 1px solid #bc4799;
  border-radius: 15px;
}

#myBar {
  overflow:hidden;
  width: 0;
  height: 4px;
  background-color: #bc4799;
}
</style>
