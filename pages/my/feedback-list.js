// pages/my/feedback-list.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    feedbacks: [],
    isLoading: true,
    isHideLoadMore: true,
    isNoNetError: true,
    isIphonex: app.globalData.isIphonex,
    is_empty: false
  },

  loadData: function(){
    var that = this;
    //请求直播列表
    that.data.feedbacks = [];

    wx.request({
      url: app.globalData.apiUrl + 'feedback/list&token=' + wx.getStorageSync("token"),
      data: { count: that.data.feedbacks.length},
      success: function (res) {

        if(!res.data.data||res.data.data.length==0){
          that.setData({
            is_empty: true
          });
        }else{
          that.setData({
            is_empty: false
          });
        }

        that.setData({
          feedbacks: res.data.data
        });
      },
      fail: function (res) {
        that.setData({
          isNoNetError: false
        });
      },
      complete: function (res) {
        wx.stopPullDownRefresh();
        that.setData({
          isLoading: false
        });
      }
    });
  },

  loadMore: function(){

      var that = this;
      //请求直播列表

      that.setData({
        isHideLoadMore: false
      });
      wx.request({
        url: app.globalData.apiUrl + 'feedback/list&token=' + wx.getStorageSync("token"),
        data: { count: that.data.feedbacks.length },
        success: function (res) {

          that.setData({
            feedbacks: that.data.feedbacks.concat(res.data.data)
          });
        },
        fail: function (res) {
          that.setData({
            isNoNetError: false
          });
        },
        complete: function (res) {
          wx.stopPullDownRefresh();
          that.setData({
            isLoading: false,
            isHideLoadMore: true
          });
        }
      });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  createFeedback: function(){
    wx.navigateTo({
      url: 'feedback',
    });
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
    this.loadData();
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
    console.log("onReachBottom");
    if (this.data.isHideLoadMore) {
      this.loadMore();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})