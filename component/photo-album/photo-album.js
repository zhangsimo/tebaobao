// photoAlbum.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showPhoto: {
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    appName: app.globalData.appName,
    appiconUrl: app.globalData.appiconUrl
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onAuthDialogCancel: function() {
      this.setData({
        showPhoto: false,
      })
    }
  }
})
