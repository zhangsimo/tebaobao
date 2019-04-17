// getPhoneNumber.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showPhoneModal: {
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    appiconUrl: app.globalData.appiconUrl,
    appName: app.globalData.appName
  },



  ready() {
    var that = this;
    if (!wx.getStorageSync('phone')) {
      that.setData({
        showPhoneModal: true
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onPhoneDialogCancel: function (event) {
      this.setData({
        showPhoneModal: false,
      });
    },

    getPhoneNumber: function (e) {
      var that = this;
      if (wx.getStorageSync('phone')) {
        this.setData({
          showPhoneModal: false
        })
        return;
      }
      wx.showLoading({
        title: '获取中...',
        icon: "none"
      });
      wx.login({
        success: res => {
          wx.request({
            // url: app.globalData.apiUrl + 'baobaoxiu_getphonenumber',
            data: {
              'encryptedData': encodeURIComponent(e.detail.encryptedData),
              'iv': encodeURIComponent(e.detail.iv),
              'code': res.code
            },
            header: {
              'content-type': 'application/json'
            }, 
            success: function (res) {
              if (res.data.code == 0) {
                wx.setStorageSync('phone', res.data.data);
              }
              that.setData({
                showPhoneModal: false,
              });
            },
            fail: function (err) {
              console.log(err);
            },
            complete: function(res) {
              wx.hideLoading();
            }
          })
        }
      })
    }
  }
})
