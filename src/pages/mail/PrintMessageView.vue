<template>
  <div class="print-dn">
    <div class="hello" ref="PrintMessageView">
      <div>
        <table style="border-collapse: collapse;width: 96%;" onload="window.print ()">
          <tbody>
          <tr>
            <td width="60px" style="padding: 4px;border: solid #666666;font: normal 11px Tahoma, Arial, Helvetica, sans-serif;text-align: left;border-width: 0 1px 1px 0">
              <span>From:</span>
            </td>
            <td colspan="2" style="padding: 4px;border: solid #666666;font: normal 11px Tahoma, Arial, Helvetica, sans-serif;text-align: left;border-width: 0 0 1px 1px;">{{ message.From }}</td>
          </tr>
          <tr>
            <td style="padding: 4px;border: solid #666666;font: normal 11px Tahoma, Arial, Helvetica, sans-serif;text-align: left;border-width: 0 1px 1px 0">
              <span>To:</span>
            </td>
            <td colspan="2" style="padding: 4px;border: solid #666666;font: normal 11px Tahoma, Arial, Helvetica, sans-serif;text-align: left;border-width: 0 0 1px 1px;">{{ message.To }}</td>
          </tr>
          <tr>
            <td style="padding: 4px;border: solid #666666;font: normal 11px Tahoma, Arial, Helvetica, sans-serif;text-align: left;border-width: 0 1px 1px 0">
              <span>Date:</span>
            </td>
            <td colspan="2" style="padding: 4px;border: solid #666666;font: normal 11px Tahoma, Arial, Helvetica, sans-serif;text-align: left;border-width: 0 0 1px 1px;">{{ fullDate }}</td>
          </tr>
          <tr>
            <td style="padding: 4px;border: solid #666666;font: normal 11px Tahoma, Arial, Helvetica, sans-serif;text-align: left;border-width: 0 1px 1px 0">
              <span>Subject:</span>
            </td>
            <td colspan="2" style="padding: 4px;border: solid #666666;font: normal 11px Tahoma, Arial, Helvetica, sans-serif;text-align: left;border-width: 0 0 1px 1px;">{{ message.Subject }}</td>
          </tr>
          <tr>
            <td colspan="3" v-html="message.Html === '' ? message.Plain : message.Html" style="padding: 4px;border: solid #666666;font: normal 11px Tahoma, Arial, Helvetica, sans-serif;text-align: left;border-width: 1px 0 0 0"></td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import dateUtils from "../../utils/date";
import Menu from "electron"

export default {
  name: "MessageHTML",
  mounted() {

  },
  props: {
    message: Object
  },
  model: {
    prop: 'open',
    event: 'close'
  },
  computed: {
    fullDate () {
      return dateUtils.getFullDate(this.message.TimeStampInUTC)
    },
  },
  methods: {
    printMessage() {
      const electron = require('electron');
      const BrowserWindow = electron.remote.BrowserWindow;
      let sHtml = this.$refs.PrintMessageView.innerHTML
      sHtml = sHtml.replace(/\'/g, "\\'")
      sHtml = sHtml.replace(/\n/g, '')
      sHtml = sHtml + "<img src=\"src/assets/sad.svg\" onerror= \"window.print()\" style=\"width: 0;height: 0;\" />"
      const printWindow = new BrowserWindow({
        width: 1200,
        height: 600,
      })
      printWindow.loadURL(("data:text/html;charset=utf-8," + encodeURI(sHtml)))
      printWindow.removeMenu()
      printWindow.setTitle('Print message')
    }
  }

}
</script>
<style scoped>
.print-dn {
  display: none;
}
</style>
