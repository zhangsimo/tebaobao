//app.js
function debugConsole(e) {
}

var loginCode = null;

App({
  onLaunch: function () {
    var that = this;
    wx.getStorage({
      key: 'userInfo',
      success: function (res) {
        that.globalData.userInfo = res.data;
      },
      fail: function (res) {
        debugConsole(res);
      }
    });

    wx.getSystemInfo({
      success: function (res) {
        that.globalData.device = res.model;
        if (res.model.search("iPhone X") != -1) {
          that.globalData.isIphonex = true;
        }
      },
    });
  },

  onLoad: function () {

  },

  onShow: function () {

    var that = this;
    // that.setShopcartCount();

    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();

      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          wx.showToast({
            title: '亲，发现版本更新，小程序会自动重启',
            icon: "none",
            duration: 2000
          });
        }
      });

      updateManager.onUpdateReady(function () {
        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
        updateManager.applyUpdate();
      });

      updateManager.onUpdateFailed(function () {
        // 新的版本下载失败
      });
    }
  },

  debugConsole: function (e) {
  },

  login: function (successCallback, failCallback) {
    var that = this;
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          debugConsole("app wx.login success：" + res.code);

          loginCode = res.code;

          that.getWxUserInfo(successCallback, failCallback);

        } else {
          debugConsole('获取用户登录态失败：' + res.errMsg);
        }
      },

      fail: function () {
        debugConsole('wx.login fail');
      }
    });
  },

  getUserInfo: function (successCallback, failCallback) {
    var that = this;
    wx.checkSession({
      success: function () {
        if (!wx.getStorageSync("token")) {
          that.login(successCallback, failCallback);
          return;
        }
        if (that.globalData.userInfo == null) {
          wx.getStorage({
            key: 'userInfo',
            success: function (res) {
              that.globalData.userInfo = res.data;
              successCallback(that.globalData.userInfo);
              console.log('userInfo', res.data);
            },
            fail: function (res) {
              that.login(successCallback, failCallback);
            }
          });
        } else {
          successCallback(that.globalData.userInfo);
        }
      },

      fail: function () {
        // 登录
        that.login(successCallback, failCallback);
      },

      complete: function () {
        console.log("app.checksession complete");
        that.onLoad()
      }
    });

  },

  getWxUserInfo: function (successCallback, failCallback) {
    var that = this;
    wx.getUserInfo({
      success: res => {
        if (that.isLogining) {
          return;
        }
        that.isLogining = true;
        wx.request({
          url: this.globalData.apiUrl + "wechat/baobaoxiu_login",
          data: {
            code: loginCode,
            rawData: res.rawData,
            signature: res.signature,
            iv: res.iv,
            encryptedData: res.encryptedData,
            phone: wx.getStorageSync("phone").data ? wx.getStorageSync("phone").data : wx.getStorageSync("phone"),
            shopid: wx.getStorageSync("shopid")
          },
          success: function (respone) {
            that.globalData.userInfo = res.userInfo
            if (respone.data.code == 0) {
              wx.setStorage({
                key: "userInfo",
                data: res.userInfo
              });
              wx.setStorage({
                key: 'token',
                data: respone.data.data.token,
                success: function () {
                  successCallback(res.userInfo);
                }
              });
            }
          },
          complete: function (res) {
            that.isLogining = false;
          }
        });
      },
      fail: function () {
        debugConsole("app wx.getUserInfo fail");
      },
      complete: function (e) {
        debugConsole("app wx.getUserInfo complete");
        debugConsole(e);
        if (e.errMsg != "getUserInfo:ok") {
          failCallback(function () { });
        }
      }
    });
  },

  /**
   * 设置底部购物车的数量
   */

  setShopcartCountText: function (count) {

    if (count > 0) {
      var text = "";
      if (count > 99) {
        text = "99+";
      } else {
        text = count + "";
      }

      wx.setTabBarBadge({
        index: 2,
        text: text
      });
    } else {
      wx.hideTabBarRedDot({
        index: 2,
      });
    }
  },

  setShopcartCount: function () {
    var that = this;
    that.setShopcartCountText(that.globalData.shopcartCount);

    wx.request({
      url: this.globalData.apiUrl + "shopcart/count&token=" + wx.getStorageSync("token"),
      success: function (res) {
        if (res.data.code == 0) {
          that.globalData.shopcartCount = res.data.data.count;
          that.setShopcartCountText(res.data.data.count);
        }

        // if (res.data.statusCode == 401) { //登录失效
        //   wx.removeStorage({
        //     key: 'token',
        //     success: function(res) {
        //       that.getUserInfo(that.setShopcartCount, null);
        //     },
        //   });
        // }
      },

    });
  },

  globalData: {
    userInfo: null,
    isIphonex: false,
    shopcartCount: 0,
    // apiUrl: "http://v5.tbb.la/apps/index.php?url=show/",
    apiUrl: "https://m.tebaobao.com/apps/index.php?url=show/",  
    // indexUrl: "http://v5.tbb.la/apps/index.php?url=/",
    indexUrl: "https://m.tebaobao.com/apps/index.php?url=/",
    // liveUrl: "http://lv.v5.tbb.la/index.php?r=lv/",
    liveUrl: "https://lv.tebaobao.com/index.php?r=lv/",
    appiconUrl: "http://static.tebaobao.com/images/miniapp/basicprofile.jpeg",
    appName: "抱抱秀",
    version: "1.2",
    device: ""
  }
})