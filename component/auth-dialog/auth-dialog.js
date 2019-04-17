// component/auth-dialog/auth-dialog.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showAuthModal: {
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    appiconUrl: app.globalData.appiconUrl,
    appName: app.globalData.appName,
    confirmDisabled: false
  },

  /**
   * 组件的方法列表
   */
  methods: {

    // _successCallback:function(){
    //   this.triggerEvent("successCallback");
    // },
    onAuthDialogCancel: function (event) {
      this.setData({
        showAuthModal: false,
      });
    },

    onAuthDialogConfirm: function (event) {
      this.setData({
        showAuthModal: false,
      });
    },

    getUserInfo: function (e) {
      var that = this;

      app.globalData.userInfo = e.detail.userInfo;

      wx.showLoading({
        title: '登录中...',
        icon:"none"
      });

      that.setData({
        confirmDisabled: true
      });
      app.login(function (res) {

        // that.setData({
        //   userInfo: res,
        // });

        that.setData({
          showAuthModal: false,
          confirmDisabled:false
        });
        var myEventDetail = {} // detail对象，提供给事件监听函数
        var myEventOption = {} // 触发事件的选项
        that.triggerEvent('confirm', myEventDetail, myEventOption);
        wx.hideLoading();
        wx.navigateBack({ changed: true });

      }, function () {
        that.setData({
          showAuthModal: true,
          confirmDisabled: false
        });
        consle.log('error');
        wx.hideLoading();
      });
    }
  }
})
