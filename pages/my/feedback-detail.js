// pages/my/feedback-detail.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    feedback:null,
    replies:null,
    isLoading: true,
    isHideLoadMore: true,
    isNoNetError: true,
    isIphonex: app.globalData.isIphonex,
    is_empty: false
  },

  loadData: function () {
    var that = this;
    //请求直播列表
    that.data.replies = [];

    wx.request({
      url: app.globalData.apiUrl + 'feedback/detail&token=' + wx.getStorageSync("token"),
      data: {id:that.feedback_id, count: that.data.replies.length },
      success: function (res) {

        if (!res.data.data.replies || res.data.data.replies.length == 0) {
          that.setData({
            is_empty: true
          });
        }else{
          that.setData({
            is_empty: false
          });
        }

        that.setData({
          feedback: res.data.data.feedback,
          replies: res.data.data.replies
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

    wx.request({
      url: app.globalData.apiUrl + 'feedback/detail&token=' + wx.getStorageSync("token"),
      data: { id: that.feedback_id, count: that.data.replies.length },
      success: function (res) {

        if (res.data.data.replies && res.data.data.replies.length>0){
          that.setData({
            replies: that.data.replies.concat(res.data.data.replies)
          });
        }
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
    this.feedback_id = options.id;
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
    this.loadData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
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