const app = getApp()
Page({

  data: {
    lives: [],
    isLoading: true,
    isHideLoadMore: true,
    isNoNetError: true,
    showLive: false,
    pageSize: 1
  },



  loadData: function () {
    var that = this;
    //请求直播列表
    that.data.lives = [];
    wx.request({
      url: app.globalData.originApiUrl + 'live/list',
      header: {
        "token": wx.getStorageSync("token")
      },
      data: { 
        page: 1,
        limit: 10,
        v: app.globalData.version
      },
      success: function (res) {
        if (res.data.data) {
          // if (res.data.data.pager.totalPage === that.data.pageSize) {
          //   that.setData({
          //     isHideLoadMore: false
          //   })
          // }
          that.setData({
            lives: res.data.data.lives,
            banner: res.data.data.banner,
            goods: res.data.data.goods,
            showLive: res.data.data.showLive
          });
        }

        that.setData({
          isNoNetError: true
        });
      },
      fail: function (res) {
        that.setData({
          isNoNetError: false
        });
      },
      complete: function (res) {
        that.setData({
          isLoading: false
        });
        wx.stopPullDownRefresh();
      }
    });
  },

  loadMore: function () {
    var that = this;
    that.setData({
      isHideLoadMore: true,
      pageSize: ++that.data.pageSize
    });
    wx.request({
      url: app.globalData.apiUrl + 'live&act=list',
      header: {
        "token": wx.getStorageSync("token")
      },
      data: {
        page: that.data.pageSize,
        limit: 10,
        v: app.globalData.version
      },
      success: function (res) {
        if (res.data.data) {
          that.setData({
            lives: that.data.lives.concat(res.data.data && res.data.data.lives)
          });
          wx.stopPullDownRefresh();
        }
        
      },
      fail: function (res) {

      },
      complete: function (res) {
        that.setData({
          isHideLoadMore: false
        });
      }
    });
  },

  onLoad: function () {
    this.loadData();
    app.getUserInfo();
  },

  openLive: function (event) {
    //打开直播
    //console.log(event.currentTarget.dataset.liveid);
    wx.navigateTo({
      url: '/pages/live/live?id=' + event.currentTarget.dataset.liveid + '&title=' + event.currentTarget.dataset.livetitle
    });
    // wx.showToast({
    //   title: '此功能暂时没有开放',
    //   icon: 'none',
    //   duration: 2000
    // });
  },

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

  bannerClick: function (e) {
    console.log(e)
    var bannerType = e.currentTarget.dataset.type;
    var text = e.currentTarget.dataset.text;

    switch (bannerType) {
      case 0:
        wx.navigateTo({
          url: '../webview/webview?url=' + text,
        });
        break;

      case 2:
        if (text) {
          wx.navigateTo({
            url: '../../pages/live/live?id=' + text + '&title=' + '',
          });
        }
        break;

      default:
        break;
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})