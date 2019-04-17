// register.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showRegister: {
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    appiconUrl: app.globalData.appiconUrl
  },

  ready() {
    var that = this;
    if (!wx.getStorageSync('phone')) {
      that.setData({
        showRegister: true
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
