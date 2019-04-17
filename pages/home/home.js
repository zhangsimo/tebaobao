// pages/home/home.js
var app = getApp();
var floatBuyTips = require("../../utils/floatBuyTips.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading:true,
    banner: null,
    categories: null,
    goods: [],
    swiperCount: "",
    lives: [],
    isHideLoadMore: true,
    isNoNetError: true,
    showLive: false
  },

  loadData: function(){
    var that = this;

    wx.request({
      url: app.globalData.apiUrl + "site/index&v="+app.globalData.version,

      success: function (res) {
        app.debugConsole(res);
        var swiperCount = "1 / "+res.data.data.banner.length;
        if (res.data.code == 0) {
          that.setData({
            banner: res.data.data.banner,
            goods: res.data.data.goods,
            categories: res.data.data.categories,
            swiperCount: swiperCount,
            lives: res.data.data.lives,
            recommandBanner: res.data.data.recommandBanner,
            showLive: res.data.data.showLive
          });
        }

        that.setData({
          isNoNetError: true
        });
        wx.stopPullDownRefresh();
      },
      fail: function (res){
         that.setData({
           isNoNetError:false
         });
      },
      complete: function (res) {
        that.setData({
          isLoading: false
        });
      }
    });
  },

  loadMore: function(){
    app.debugConsole("loadMore");
    var that = this;
    that.setData({
      isHideLoadMore: false
    });
    wx.request({
      url: app.globalData.apiUrl + "site/index-loadmore",
      data: { count: that.data.goods.length },
      success: function (res) {
        app.debugConsole(res);

        if (res.data.code == 0) {

          that.setData({
            goods: that.data.goods.concat(res.data.data.goods)
          });

        }
        wx.stopPullDownRefresh();
      },
      complete: function (res){
        that.setData({
          isHideLoadMore: true
        });
      }
    });
  },

  bannerChange: function (event) {
    var currentIndex = event.detail.current;
    var swiperCount = currentIndex + 1 + " / " + this.data.banner.length;
    this.setData({
      swiperCount: swiperCount
    });
  },

  allLive: function(e){
    
    console.log(e);
    
    wx.switchTab({
      url: '/pages/index/index',
    });
  },

  bannerClick: function(e){
    var bannerType = e.currentTarget.dataset.type;
    var text = e.currentTarget.dataset.text;
    
    switch(bannerType){
      case 0:
        wx.navigateTo({
          url: '../../pages/webview/webview?url='+text,
        });
      break;

      case 2:
        if(text){
          wx.navigateTo({
            url: '../../pages/live/live?id='+text+'&title='+'',
          });
        }
      break;

      default:
      break;
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadData();
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
    floatBuyTips.show();
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
    this.loadData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.isHideLoadMore){
      this.loadMore();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})