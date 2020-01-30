<template>
  <div id="q-app">
    <router-view />
    <MessageCompose ref="compose" />
  </div>
</template>

<script>
import Vue from 'vue'
import { ipcRenderer } from 'electron'
import theming from './css/theming'
// import prefetcher from 'src/modules/mail/prefetcher.js'
import MessageCompose from "./pages/mail/MailCompose.vue"

Vue.mixin({
  methods: {
    _getParentComponent: function (sComponentName) {
      let oComponent = null
      let oParent = this.$parent
      while (oParent && !oComponent) {
        if (oParent.$options.name === sComponentName) {
          oComponent = oParent
        }
        oParent = oParent.$parent
      }
      return oComponent
    },
    openCompose: function (oComposeParams) {
      let
        oAppComponent = this._getParentComponent('App'),
        oComposeComponent = oAppComponent ? oAppComponent.$refs.compose : null

      if (oComposeComponent) {
        oComposeComponent.openCompose(oComposeParams)
      }
    }
  }
})

export default {
  name: 'App',

  components: {
    MessageCompose,
  },

  computed: {
    currentAccountId () {
      let oCurrentAccount = this.$store.getters['mail/getCurrentAccount']
      return oCurrentAccount ? oCurrentAccount.AccountID : 0
    },
    dataToSave () {
      return {
        main: this.$store.getters['main/getDataToSave'],
        user: this.$store.getters['user/getDataToSave'],
      }
    },
  },

  watch: {
    '$store.state.main.theme': function (v) {
      this.setThemeColors(v)
    },
    'currentAccountId': function (iAccountId, iPrevAccountId) {
      this.$store.dispatch('mail/asyncGetFolderList')
      // prefetcher.currentAccountChanged()
    },
    dataToSave: function () {
      ipcRenderer.send('main-save-user-data', this.dataToSave)
    },
  },

  mounted () {
    ipcRenderer.on('notification', (event, mNotification) => {
      console.log('mNotification', mNotification)
    })
    this.setThemeColors(this.$store.state.main.theme)
  },

  methods: {
    setThemeColors (v) {
      if (v === 'light') {
        theming.setLightThemeColors()
      } else {
        theming.setDarkhemeColors()
      }
    },
  },
}
</script>

<style lang="scss">
.theme-text {
  color: var(--q-color-t-text);
}
.theme-bg {
  background-color: var(--q-color-t-background);
}
.big-button {
  border: 2px solid var(--q-color-primary);
  background: var(--q-color-primary-dark);
}

.main-tabs {
  background: var(--q-color-t-gradient-start);
  color: var(--q-color-t-text);
}

.bg-accent-dark {
  background: #6d5d7e;
}
.panel-rounded {
  border-radius: 5px;
}

.q-splitter--vertical {
  & > .main-split-separator {
    width: 4px ;
  }
}

.search-field.q-field--dense {
	.q-field__control,
	.q-field__marginal {
		height: 30px;
	}
}

.q-item {
  .nodata {
    color: #b9b9b9;
  }

  &.checked {
    background: var(--q-color-t-selection-alt);

    .nodata {
      // color: #bfbf9e;
      color: desaturate(darken(#eeeecd, 20%), 20%);
    }
  }

  &.selected {
    background: var(--q-color-t-selection);
    color: #fff;

    .nodata {
      // color: #ad98c5;
      color: lighten(#816f95, 15%);
    }

    .q-icon {
      color: #fff;
    }

    .q-item__section--side {
      color: inherit;
    }
  }
}

.q-separator {
  &.checked {
    background: #d6d6a9;
  }

  &.selected {
    background: #6d5d7e;
  }
}

.buttons {
  .q-btn {
    margin-right: 10px;

    &:last-child {
      margin-right: 0;
    }

    html.rtl & {
      margin-left: 10px;
      margin-right: 0;
    }
  }
}

.pannel-hint {
  font-size: 16pt;
  font-weight: 300;
  padding: 30px;
  color: #aaa;
  text-align: center;

  .sub-hint {
    padding-top: 1em;
    font-size: 12pt;
  }

  &--link {
    color: var(--q-color-primary);
    float: right;
    margin: 6px 10px 0;
    font-size: 90%;
    cursor: pointer;
  }
}
</style>
