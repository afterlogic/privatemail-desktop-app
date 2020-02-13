import { colors } from 'quasar'


const primary = '#BC4799'
const primaryDark = colors.lighten(primary, -50)
const primaryLight = colors.lighten(primary, 50)
const primaryPale = colors.lighten(primary, 80)
  

export default {
  setLightThemeColors () {
    colors.setBrand('t-background', '#fff')
    colors.setBrand('t-text', '#000')
    // colors.setBrand('t-gradient-start', 'rgb(245,209,226,1)')
    colors.setBrand('t-gradient-start', 'rgb(209, 221, 245,1)')
    colors.setBrand('t-gradient-stop', 'rgba(182,186,226,1)')
    colors.setBrand('t-selection', '#816f95')
    colors.setBrand('t-selection-alt', '#eeeecd')

    colors.setBrand('primary', '#ce0993')
    colors.setBrand('primary-dark', `${colors.lighten('#ce0993', -30)}`)
    colors.setBrand('primary-light', `${colors.lighten('#ce0993', 30)}`)
    colors.setBrand('primary-pale', `${colors.lighten('#ce0993', 50)}`)
    colors.setBrand('secondary', '#ccc')
    colors.setBrand('accent', '#BC4799')
    colors.setBrand('positive', '#33F')
    colors.setBrand('negative', '#33F')
    colors.setBrand('info', '#33F')
    colors.setBrand('warning', '#f00')
  },
  setDarkhemeColors () {
    colors.setBrand('t-background', '#000')
    colors.setBrand('t-text', '#fff')
    colors.setBrand('t-gradient-start', 'rgba(65,3,36,1)')
    colors.setBrand('t-gradient-stop', 'rgba(34,39,87,1)')
    colors.setBrand('t-selection', '#816f95')
    colors.setBrand('t-selection-alt', '#eeeecd')

    colors.setBrand('primary', '#BC4799')
    colors.setBrand('primary-dark', primaryDark)
    colors.setBrand('primary-light', primaryLight)
    colors.setBrand('primary-pale', primaryPale)

    colors.setBrand('secondary', '#33F')
    colors.setBrand('accent', '#f00')
    colors.setBrand('positive', '#33F')
    colors.setBrand('negative', '#33F')
    colors.setBrand('info', '#33F')
    colors.setBrand('warning', '#f00')
  }
}