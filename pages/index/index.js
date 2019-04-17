//index.js
//获取应用实例
import util from '../../utils/util.js';
const app = getApp();
Page({
  data:{
    categoryDatas: [],
    homeTimeDatas: [],
    bannerData: [],
    timeList: [],
    brandData: [],
    homeOtherData: [],
    homeIndexStatus: 'block',
    homeBrandStatus: 'none',
    homeOtherStatus: 'none',
    isShowBrand: 'none',
    categoryClicked: 0,
    timeClicked: 1,
    mode: "scaleToFill",
    indicatorDots: true,
    autoplay: true,
    interval: 2000,
    duration: 1000,
    time: '',
    day: '',
    scrollTop: '0',
    scrollY: '',
    isShow: false,
    pageSize: 1,
    isLoading: true,
    isNoNetError: true,
  },

  loadData: function() {
    var that = this;

    // wx.showLoading({
    //   title: '加载中...',
    // });
    this.setData({
      pageSize: 1
    })
    wx.request({
      url: app.globalData.indexUrl + "homeVip/index",
      success: function (res) {
        var indexData = res.data;
        if (indexData.status.succeed == 1) {
          var cateData = [];
          cateData = indexData.data.category.unshift({
            id: '0',
            name: '首页',
            is_show_cat: 1
          }, {
            id: '5', 
            name: '品牌团',
            is_show_cat: 1
          });
          var DAY = util.day(new Date());
          that.setData({
            day: DAY,
          });
          var timeData = [];
          var timeDatas = indexData.data.time.map((val, key) => {
            var timeStatus = '';
            var timee = that.data.day + ' ' + '00:00:00';
            var resTime = that.data.day + ' ' + val.cat_name;
            var fixedTime = new Date(timee).valueOf();
            var currentTime = new Date().valueOf();
            var differTime = currentTime - fixedTime;
            var resTimeResult = new Date(resTime).valueOf();
            if (resTimeResult > currentTime) {
              timeStatus = '预热中';
            } else {
              timeStatus = '抢购中';
              that.setData({
                timeClicked: val.cat_id
              })
            }
           
            timeData = {
              ...val,
              cat_status: timeStatus
            }
            return timeData;
          })
          that.setData({
            categoryDatas: indexData.data.category,
            bannerData: indexData.data.banner,
            homeTimeDatas: timeDatas,
            isNoNetError: true,
            // banner_mark: indexData.data.banner_ad
          })
        }
        wx.stopPullDownRefresh();
      },
      fail: function (res) {
        that.setData({
          isNoNetError: false
        });
      },
      complete: function (res) {
        wx.hideLoading();
        that.setData({
          isLoading:　false
        })
      }
    });
    wx.request({
      url: app.globalData.indexUrl + "homeVip/buy_goods",
      data: {
        cat_id: '370'
      },
      success: function(res) {
        if (res.data.status.succeed === 1) {
          var timeLists = res.data.data.info.goods;
          that.setData({
            timeList: timeLists
          })
        }
      },
      fail: function(res) {
        console.log('fail', res);
      },
      complete: function(res) {
        wx.hideLoading();
      }
    })
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
          url: './brand?id=' + link,
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

  onLoad: function() {
    var that = this;
    var that = this;
    //获取tabContent 高度
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
          console.log(clientHeight);
        var calc = clientHeight * rpxR - 160;
        that.setData({
          tabContentHeight: calc
        });
      }
    });
    this.loadData();
  },

  goShopcart: function() {
    wx.navigateTo({
      url: '../shopcart/shopcart'
    })
  },

  goCategory: function () {
    wx.navigateTo({
      url: '../category/category'
    })
  },

  changeCategoryTab: function (e) {
    var parentId = e.currentTarget.dataset.parentId;
    var tapValue = e.currentTarget.dataset.tapValue;
    var that = this;
    this.setData({
      categoryClicked: parentId,
      pageSize: 1,
      brandData: [],
      homeOtherData: []
    });
    if (tapValue === '品牌团') {
      that.setData({
        homeBrandStatus: 'block',
        homeIndexStatus: 'none',
        homeOtherStatus: 'none'
      })
      wx.showLoading({
        title: '加载中...',
      });
      that.getBrandData(that.data.pageSize);
    } else if (tapValue === '首页') {
      that.setData({
        homeBrandStatus: 'none',
        homeIndexStatus: 'block',
        homeOtherStatus: 'none'
      });
    } else {
      that.setData({
        homeBrandStatus: 'none',
        homeIndexStatus: 'none',
        homeOtherStatus: 'block',
        isShow: true
      });
      wx.showLoading({
        title: '加载中...',
      });
      this.getOtherData(parentId, that.data.pageSize)
    }
  },

  // 品牌团
  getBrandData: function(pageSize) {
    var that = this;
    wx.request({
      url: app.globalData.indexUrl + 'homeVip/brand&token=' + wx.getStorageSync("token"),
      data: {
        page: pageSize
      },
      success: function (res) {
        if (res.data.status.succeed == 1 && res.data.data) {
          var brands = res.data.data;
          that.setData({
            brandData: that.data.brandData.concat(brands)
          })
        } else {
          that.setData({
            isShowBrand: 'block'
          })
        }
      },
      fail: function (res) {
        console.log('fail', res);
      },
      complete: function (res) {
        wx.hideLoading();
      }
    });
  },

  // 其他分类商品
  getOtherData: function(parentId, pageSize) {
    var that = this;
    wx.request({
      url: app.globalData.indexUrl + "goods_list_vip",
      data: {
        cat_id: parentId,
        page: pageSize
      },
      success: function (res) {
        if (res.data.status.succeed === 1) {
          var otherDatas = res.data.data;
          that.setData({
            homeOtherData: that.data.homeOtherData.concat(otherDatas)
          });
        }
      },
      fail: function (res) {
        console.log('fail', res);
      },
      complete: function (res) {
        wx.hideLoading();
        that.setData({
          isShow: false
        });
      }
    })
  },

  changeTimeTab: function (e) {
    var timeId = e.currentTarget.dataset.timeId;
    var that = this;
    this.setData({
      timeClicked: timeId
    });
    wx.showLoading({
      title: '加载中...',
    });
    wx.request({
      url: app.globalData.indexUrl + "homeVip/buy_goods",
      data: {
        cat_id: timeId
      },
      success: function (res) {
        if (res.data.status.succeed === 1) {
          var timeLists = res.data.data.info.goods;
          that.setData({
            timeList: timeLists
          })
        }
      },
      fail: function (res) {
        console.log('fail', res);
      },
      complete: function(res) {
        wx.hideLoading();
      }
    })
  },
  onReady: function() {
    
  },

  onShow: function() {
    var that = this;
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      pageSize: --this.data.pageSize
    })
    this.getOtherData(this.data.categoryClicked, this.data.pageSize);
    this.loadData();
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      pageSize: ++this.data.pageSize
    })
    this.getBrandData(this.data.pageSize);
    this.getOtherData(this.data.categoryClicked, this.data.pageSize);
  },



  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
  