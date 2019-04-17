// pages/category/goodsList.js
var app = getApp();
var categoryId = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    goods: [],
    isHideLoadMore: true,
    isNoNetError: true
  
  },

  loadData: function(){
    this.loadMore();
  },

  loadMore: function () {
    app.debugConsole("loadMore");
    var that = this;
    that.setData({
      isHideLoadMore: false
    });
    wx.request({
      url: app.globalData.apiUrl + "category/goods-list",
      data: {categoryId:categoryId ,count: that.data.goods.length },
      success: function (res) {
        app.debugConsole(res);
        
        that.setData({
          isNoNetError: true
        });

        if (res.data.code == 0) {

          that.setData({
            goods: that.data.goods.concat(res.data.data.goods)
          });

        }
        wx.stopPullDownRefresh();
      },
      complete: function (res) {
        that.setData({
          isHideLoadMore: true,
          isLoading: false
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.title
    });

    categoryId = options.id;

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
    this.loadMore();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadMore();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})