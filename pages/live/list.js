//index.js
//获取应用实例
const app = getApp()
Page({

  data: {
    lives: [],
    isLoading: true,
    isHideLoadMore: true,
    isNoNetError: true,
    pageSize: 1,
    isIphonex: app.globalData.isIphonex
  },



  loadData: function () {
    var that = this;
    //请求直播列表
    that.data.lives = [];

    wx.request({
      url: app.globalData.apiUrl + 'live&act=myLiveList&token='+wx.getStorageSync("token"),
      data: { page: 1, limit: 10 ,shop_token: wx.getStorageSync("shop_token")},
      success: function (res) {
        if(res.data.code == -2){
          wx.removeStorage({
            key: 'shop_token',
            success: function(res2) {
              wx.showModal({
                title: '',
                content: res.data.msg,
                showCancel:false,
                success: function(res3){
                  wx.redirectTo({
                    url: 'login',
                  });
                }
              })
            },
          });
        }else{
          that.setData({
            lives: res.data.data
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
          isLoading: false
        });
      }
    });
  },

  loadMore: function () {
    var that = this;
    that.setData({
      isHideLoadMore: false,
      pageSize: ++that.data.pageSize
    });
    wx.request({
      url: app.globalData.apiUrl + 'live/act=my&token=' + wx.getStorageSync("token"),
      // data: { count: that.data.lives.length, shop_token: wx.getStorageSync("shop_token") },
      data: {
        page: that.data.pageSize, 
        limit: 10, 
        shop_token: wx.getStorageSync("shop_token")
      },
      success: function (res) {
        if (res.data.data){
          console.log(res.data.data)
          if(res.data.data.length>0){
            that.setData({
              lives: that.data.lives.concat(res.data.data)
            });
          }
        }
      },
      fail: function (res) {

      },
      complete: function (res) {

        that.setData({
          isHideLoadMore: true
        });
      }
    });
  },

  onLoad: function () {
    
  },

  onShow: function(){
    this.loadData();
  },

  openLive: function (event) {
    //打开直播
    //console.log(event.currentTarget.dataset.liveid);

    var canPush = event.currentTarget.dataset.canpush;

    var that = this;

    if (canPush){
      wx.navigateTo({
        url: '/pages/live/push?id=' + event.currentTarget.dataset.liveid + '&title=' + event.currentTarget.dataset.livetitle+"&direction="+event.currentTarget.dataset.direction
      });
    }else{
      const list = ['观看', '删除'];
      wx.showActionSheet({
        itemList: list,
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              wx.navigateTo({
                url: '/pages/live/live?id=' + event.currentTarget.dataset.liveid + '&title=' + event.currentTarget.dataset.livetitle
              });
            break;
            
            case 1:
              wx.showModal({
                title: '确定删除这个直播吗?',
                content: event.currentTarget.dataset.livetitle,
                success: function (res) {
                  if (res.confirm) {
                    wx.showLoading({
                      title: '删除直播中...',
                      icon: ''
                    });

                    wx.request({
                      url: app.globalData.apiUrl + "live&act=liveDelete&id=" + event.currentTarget.dataset.liveid + "&token=" + wx.getStorageSync("token"),
                      method: "POST",
                      success: function (res) {
                        wx.hideLoading();
                        if (res.data.code == 0) {
                          that.loadData();
                        } else {
                          wx.showModal({
                            title: '提示',
                            content: res.data.msg
                          });
                        }
                      },
                      fail: function (res) {
                        wx.hideLoading();
                        wx.showToast({
                          title: "请求失败，请重试",
                          icon: 'none'
                        });
                      },
                      complete: function (res) {
                        
                      }
                    });
                  } else if (res.cancel) {
                    
                  }
                }
              })

            break;
          }
        }
      });
    }
  },

  createLive: function(e){
    wx.navigateTo({
      url: 'new',
    });
  },

  logout: function(e){

    wx.showModal({
      title: '',
      content: '要退出店铺登录吗？',
      success: function(res){
        if (res.confirm) {
          wx.removeStorage({
            key: 'shop_token',
            success: function(res2) {

              
                wx.switchTab({
                  url: '../my/my',
                });
              
            },
          });
        }
      }
    });
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
})
