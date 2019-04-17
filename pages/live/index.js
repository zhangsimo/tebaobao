//index.js
//获取应用实例
const app = getApp();
import util from '../../utils/util.js';
Page({
  
  data:{
    goods: [],
    banner: [],
    lives: [],
    dataNotice: [],
    folllowData: [],
    isLoading: true,
    isHideLoadMore: true,
    isNoNetError: true,
    currentTab: 0,
    showLive: false,
    live_categories: null,
    pageSize: 1,
    showList: 'none',
    // 倒计时
    tian: '',
    shi: '',
    fen: '',
    miao: '',
    isFollow: false,
    // 轮播图
    indicatorDots: true,
    autoplay: true,
    interval: 2000,
    duration: 1000,
  },

  
  loadLive: function(){
    var that = this;
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: app.globalData.liveUrl + 'live/roomslist',
      success: function (res) {
        if (res.statusCode == 200) {
          var datas = res.data.data;
          var lives = datas.filter(function(item) {
            return item.start_time == 0;
          });
          var dataNotice = datas.filter(function (item) {
            return item.start_time != 0;
          });
          var noticeTime = dataNotice.map((val, key) => {
            var startTime = new Date(val.start_time);
            var times = setInterval(function() {
            var nowTime = new Date().valueOf();
            var timer = util.time(new Date(startTime - nowTime));
            var resultTime = timer.split("/");
            that.setData({
              tian: resultTime[0],
              shi: resultTime[1],
              fen: resultTime[2],
              miao: resultTime[3]
            });
            }, 1000);
            
          });
          that.setData({
            lives: lives,
            isNoNetError: true,
            dataNotice: dataNotice
          })
          that.loadData();
          wx.hideLoading();
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

  loadData: function() {
    var that = this;
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: app.globalData.liveUrl + 'index/show-recommend',
      success: function (res) {
        if(res.statusCode == 200) {
          that.setData({
            isNoNetError: true,
            showList: 'block',
            goods: res.data.data.goods,
            banner: res.data.data.banner_list
          });
          wx.hideLoading();
        }
      },
      fail: function (res) {
        that.setData({
          isNoNetError: false
        });
      },
      complete: function (res) {
        that.setData({
          isLoading: false,
          isHideLoadMore: true
        });
      }
    });
  },

  // 获取关注的直播列表
  loadFollow: function() {
    var that = this;
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: app.globalData.liveUrl + 'live/category-rooms-list',
      method: 'post',
      header: {
        token: wx.getStorageSync("token"),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data:  {
        category_id: -1
      },
      success: function (res) {
        if (res.statusCode == 200) {
         that.setData({
           followData: res.data.data
         })
         wx.hideLoading();
        }
      },
      fail: function (res) {
        that.setData({
          isNoNetError: false
        });
      },
      complete: function (res) {
        that.setData({
          isLoading: false,
          isHideLoadMore: true
        });
      }
    });
  },

  bannerClick: function (e) {
    /**
     * 1 ==> 商品
     * 2 ==> 品牌团
     * 3 ==> h5
     * 4 ==>禁止点击
     * 5 ==> 专题
     */
    var bannerType = e.currentTarget.dataset.type;
    var link = e.currentTarget.dataset.link;
    var title = e.currentTarget.dataset.title;
    switch (bannerType) {
      case "1":
        if (link) {
          wx.navigateTo({
            url: '../goods/details?id=' + link + '&title=' + title,
          });
        }
        break;

      case "2":
        wx.navigateTo({
          url: '../brand?id=' + link,
        })
        break;

      case "3":
        wx.navigateTo({
          url: '../webview/webview?url=' + link,
        });
        break;

      case "4":
        wx.navigateTo({
          url: '',
        })
        break;

      case "5":
        wx.navigateTo({
          url: '../special'
        })
        break;

      default:
        break;
    }
  },

  // 点击预约
  tapNotice: function(e) {
    var that = this;
    var roomId = e.currentTarget.dataset.roomId;
    wx.request({
      url: app.globalData.liveUrl + 'relationship/live-subscribe',
      method: 'post',
      header: {
        token: wx.getStorageSync("token"),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        s_room_id: roomId
      },
      success: function(res) {
        if (res.data.code == 1001) {
          wx.showToast({
            title: res.data.data[0]
          });
        }
      },
      fail: function(res) {
        console.log('订阅直播fail', res);
      }
    })
  },

  // 取消预约
  cancelNotice: function(e) {
    var roomId = e.currentTarget.dataset.roomId;
    var that = this;
    wx.showLoading({
      title: '',
    })
    wx.request({
      url: app.globalData.liveUrl + 'relationship/live-unsubscribe',
      method: 'post',
      header: {
        token: wx.getStorageSync("token"),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        us_room_id: roomId
      },
      success: function (res) {
        if (res.data.code == 1001) {
          wx.showToast({
            title: res.data.data[0]
          });
          that.loadFollow();
        } else {
          wx.showToast({
            icon: "none",
            title: res.data.message
          });
        }
        wx.hideLoading();
      },
      fail: function (res) {
        console.log('取消预约fail', res);
      }
    })
  },

  // 取消关注
  cancelFollow: function(e) {
    var userId = e.currentTarget.dataset.userId;
    var that = this;
    wx.showLoading({
      title: '',
    })
    wx.request({
      url: app.globalData.liveUrl + 'relationship/unfollow',
      method: 'post',
      header: {
        token: wx.getStorageSync("token"),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        uf_user_id: userId
      },
      success: function (res) {
        if (res.data.code == 1001) {
          wx.showToast({
            title: res.data.data[0]
          });
          that.loadFollow();
          wx.hideLoading();
        }
      },
      fail: function (res) {
        console.log('取消预约fail', res);
      }
    })
  },

  onLoad:function(){
    var that = this;
    //获取tabContent 高度
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR - 80;
        that.setData({
          tabContentHeight: calc
        });
      }
    });

    this.loadLive();
  },

  onShow:function(){
  },

  openLive: function (event) {
    //打开直播
    wx.navigateTo({
      url: '/pages/live/live?id=' + event.currentTarget.dataset.liveid + '&title=' + event.currentTarget.dataset.livetitle + '&direction=' + event.currentTarget.dataset.direction
    })
  },

  onPullDownRefresh: function () {
    this.loadData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // if (this.data.isHideLoadMore) {
    //   this.loadMore();
    // }
  },

  // 滚动切换标签样式
  switchTab: function (e) {
    this.setData({
      currentTab: e.detail.current
    });
    this.checkCor();

    if (this.data.currentTab == 1) {
      this.loadFollow();
    } else {
      this.loadLive();
    }
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    var cur = e.target.dataset.current;
    if (this.data.currentTab == cur) { return false; }
    else {
      this.setData({
        currentTab: cur
      });
      if (this.data.currentTab == 1) {
        this.loadFollow();
      } else {
        this.loadLive();
      }
    }
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    if (this.data.currentTab > 3) {
      this.setData({
        scrollLeft: 300
      })
    } else {
      this.setData({
        scrollLeft: 0
      })
    }
  },

  refresh: function(){
    wx.startPullDownRefresh({
      
    });
  }
})
