// pages/my/my.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    appiconUrl: app.globalData.appiconUrl,
    appName: app.globalData.appName,
    order_count_1: 0,
    order_count_2: 0,
    order_count_3: 0,
    showLive: false,
    replyCount: 0,
    isFenxiao: 0,
    version: app.globalData.version,
  },

  loadData: function(){
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.setNavigationBarTitle({
      title: "我"
    });
    if (!wx.getStorageSync('phone')) {
      wx.navigateTo({
        url: '../register/register',
      })
      return;
    } else {
      app.getUserInfo(function (res) {
        that.setData({
          userInfo: res,
        });
        that.getOrderCount();
      }, function () {
      });
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    this.getOrderCount();
    app.getUserInfo(function (res) {
      that.setData({
        userInfo: res,
      });
      that.getOrderCount();
    }, function () {
    });
  },

  getOrderCount: function(){
    var that = this;
    wx.request({
      url: app.globalData.apiUrl + "order/count&token=" + wx.getStorageSync("token") + "&v=" + app.globalData.version,
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            order_count_1: res.data.data.count_1,
            order_count_2: res.data.data.count_2,
            order_count_3: res.data.data.count_3,
            order_count_5: res.data.data.count_5,
            showLive: res.data.data.showLive,
            isFenxiao: res.data.data.userInfo && res.data.data.userInfo.is_fenxiao,
            replyCount: res.data.data.replyCount
          });
        }
        if (res.data.statusCode == 401) { //token过期
          wx.removeStorage({
            key: 'token',
            success: function (res) {
              app.getUserInfo(that.getOrderCount, null);
            },
          });
        }
        wx.stopPullDownRefresh();
      },
      complete: function(res) {
        
      }
    });
  },

  myLive: function (event) {
    // var token = wx.getStorageSync("shop_token");
    // if (!token) {
    //   wx.navigateTo({
    //     url: '../live/login',
    //   });
    // } else {
      wx.navigateTo({
        url: '../live/list',
      });
    // }
  },

  openHelp: function (event) {
    wx.navigateTo({
      url: '',
    });
  },

  /**
   * 反馈
   */
  openFeedback: function(){
    wx.navigateTo({
      url: 'feedback-list',
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getOrderCount();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})