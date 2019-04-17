// pages/goods/details.js
const app = getApp();
var goodsId = 0;
var skuArr = [];
var skuObj = {};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: null,
    isIphonex: app.globalData.isIphonex,
    swiperCount: "0 / 0",
    animationData: null,
    showModalStatus: false,

    shareAnimationData: null,
    showShareModalStatus: false,

    showPhoneModel: false,
    skuButtonName: "加入购物车",
    count: 1,//选择的商品数量
    shopcartCount: 0, //购物车现有的商品数量
    shopcartCountText: "",
    isNoNetError: true,
    qrcodeUrl: null,//海报地址
    showPosterModal: false,
    qrcode: false,
    skuPrice: '',
    skuId: [],
    goodsImg: '',
    skuNum: null
  },

  loadData: function () {
    var that = this;
    wx.request({
      url: app.globalData.apiUrl + "goods/details&id=" + goodsId,
      success: function (res) {
        app.debugConsole(res);

        that.setData({
          isNoNetError: true
        });

        if (res.data.code == 0) {

          var swiperCount = "1 / " + res.data.data.goods.images.length;

          if (res.data.data.goods.short_video) {
            swiperCount = "1 / " + (res.data.data.goods.images.length + 1);
          }
          wx.setNavigationBarTitle({
            title: res.data.data.goods.name,
          });
          that.setData({
            goods: res.data.data.goods,
            swiperCount: swiperCount,
            skuPrice: res.data.data.goods.price,
            goodsImg: res.data.data.goods.cover,
            skuNum: res.data.data.goods.goods_number
          });
        }
        if (res.data.data.goods.attributes) {
          let attributes = res.data.data.goods.attributes[0];
          var skuArrs = [];
          for (let i = 0; i < attributes.length; i++) {
            var sku = attributes[i];
            // for (var j = 0; j < sku[1].length; j++) {
            //   if (sku.length == 3) {
            //     sku.pop();
            //   }
            // }
            var index = i;
            var skuObjs = {};
            function fun(index) {
              let sku = attributes[index]
              skuObjs.name = sku[0];
              skuObjs.val = "";
              skuArrs.push(skuObjs);
            }
            fun(index);
            skuObj = skuObjs;
            skuArr = skuArrs;
          }
        }
        wx.stopPullDownRefresh();
      },
      fail: function (res) {
        that.setData({
          isNoNetError: false
        });
      }
    });

    that.loadShopcartCount();
  },

  loadShopcartCount: function () {
    var that = this;
    wx.request({
      url: app.globalData.apiUrl + "shopcart/count&token=" + wx.getStorageSync("token"),
      success: function (res) {
        if (res.data.code == 0) {
          var shopcartCountText = "";
          if (res.data.data.count > 99) {
            shopcartCountText = "99+";
          } else {
            shopcartCountText = res.data.data.count;
          }

          that.setData({
            shopcartCount: res.data.data.count,
            shopcartCountText: shopcartCountText
          });
        }
      }
    });
  },

  bannerChange: function (event) {
    var currentIndex = event.detail.current;
    var swiperCount = currentIndex + 1 + " / " + this.data.goods.images.length;

    if (this.data.goods.short_video) {
      swiperCount = currentIndex + 1 + " / " + (this.data.goods.images.length + 1);
    }
    this.setData({
      swiperCount: swiperCount
    });
  },

  goodsPhotoPreview: function (event) {
    wx.previewImage({
      current: event.currentTarget.dataset.image,
      urls: this.data.goods.images,
    });
  },

  /**
   * 播放视频
   */
  playVideo: function (event) {
    var url = event.currentTarget.dataset.url;
    wx.navigateTo({
      url: '../../pages/video/video?url=' + url,
    })
  },

  /*返回首页*/
  goHome: function () {
    wx.switchTab({
      url: '../../pages/index/index',
    });
  },

  goShopcart: function () {
    wx.switchTab({
      url: '../../pages/shopcart/shopcart',
    });
  },

  goChat: function () {
    wx.navigateTo({
      url: '../../pages/chat/chat'
    })
  },

  /**
   * 检查登录并显示sku modal
   */
  checkAuthAndBuy: function () {
    var that = this;
    that.showModal();
  },
  /**
   * 显示sku modal
   */
  showModal: function () {

    this.setData({
      isNoScroll: true
    });
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 100,
      timingFunction: "ease",
      delay: 0
    });

    animation.translateY(300).step();
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    });

    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 100);
  },

  hideModal: function () {

    this.setData({
      isNoScroll: false
    });
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });

    animation.translateY(300).step();
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      });
    }.bind(this), 200);
  },

  reduce: function () {
    var count = this.data.count;

    if (count > 1) {
      count--;
    }

    this.setData({
      count: count
    });
  },

  add: function () {
    var count = this.data.count;
    count++

    this.setData({
      count: count
    });
  },

  selectSku: function (event) {
    var skuName = event.currentTarget.dataset.skuName;
    var skuValue = event.currentTarget.dataset.skuValue;
    var attributes = this.data.goods.attributes[0];
    var attributesList = this.data.goods.attribute_price_stock;
    for (var i = 0; i < attributes.length; i++) {
      var sku = attributes[i];
      if (sku[0] == skuName) {
        for (var j = 0; j < sku[1].length; j++) {
          if (sku[1][j] == skuValue) {
            if (sku.length == 2) {
              sku.push(j);
            } else {
              sku[2] = j;
            }
          }
          for (var k = 0; k < attributesList.length; k++) {
            for (var h = 0; h < attributesList[k].length; h++) {
              if (attributesList[k][h][0] === skuValue) {
                skuArr.map((value, key) => {
                  for (let item in value) {
                    if (value[item] == skuName) {
                      value.val = attributesList[k][h][2];
                    };
                  }
                });
                var skuId = '';
                for (let i in skuArr) {
                  skuId += skuArr[i].val + ',';
                }
                if (skuId.length > 0) {
                  skuId = skuId.substr(0, skuId.length - 1);
                }
                this.setData({
                  skuPrice: this.data.goods.price + Number(attributesList[k][h][3]),
                  skuId: skuId,
                  goodsImg: attributesList[k][h][4] ? attributesList[k][h][4] : this.data.goods.cover
                })
              }
            }
          }
        }
      }
    }
    app.debugConsole(this.data.goods.attributes);

    this.setData({
      goods: this.data.goods
    });
  },

  uniq: function (array) {
    var temp = []; //一个新的临时数组
    for (var i = 0; i < array.length; i++) {
      if (temp.indexOf(array[i]) == -1) {
        temp.push(array[i]);
      }
    }
    return temp;
  },

  /**
   * 添加到购物车
   */
  addToShopcart: function (event) {
    var isSku = event.currentTarget.dataset.isSku;
    var that = this;
    if (!wx.getStorageSync('phone')) {
      wx.navigateTo({
        url: '../register/register',
      })
      return;
    }
    app.getUserInfo(function (res) {
      that.loadShopcartCount();
    }, function () {
    });

    if (isSku) {
      if (this.data.skuId.length == '') {
        wx.showToast({
          title: '请选择规格',
          icon: "none",
          duration: 2000
        });
        return;
      }
      var skuIdArr = this.data.skuId.split(',');
      for (var i = 0; i < skuIdArr.length; i++) {
        if (skuIdArr[i] == '') {
          wx.showToast({
            title: '请选择规格',
            icon: "none",
            duration: 2000
          });
          return;
        }
      }
    }

    if (!this.checkSkuSelectStatus(isSku)) {
      return;
    }
    if (Number(this.data.skuNum) === Number("0")) {
      wx.showToast({
        icon: 'none',
        title: '该商品暂时没有存货',
      });
      return;
    }
    var pOptionTexts = [];
    //处理规格,拼接成字符串，用,号隔开
    var attributesList = that.data.goods.attributes && that.data.goods.attributes[0];
    for (var i = 0; i < attributesList.length; i++) {
      pOptionTexts.push(attributesList[i][1][attributesList[i][2]]);
    }
    pOptionTexts = [pOptionTexts.join()];
    var token = wx.getStorageSync('token');
    if (token) {
      wx.request({
        url: app.globalData.apiUrl + "shopcart/add&token=" + token,
        method: "POST",
        data: { pId: that.data.goods.id, pQuantity: [that.data.count], pOptionTexts: pOptionTexts },
        success: function (res) {
          if (res.data.code == 0) {
            wx.showToast({
              title: '成功添加到购物车',
            });
            var shopcartCountText = "";
            if (res.data.data.count > 99) {
              shopcartCountText = "99+";
            } else {
              shopcartCountText = res.data.data.count;
            }
            that.setData({
              shopcartCount: res.data.data.count,
              shopcartCountText: shopcartCountText
            });

            app.globalData.shopcartCount = res.data.data.count;

            that.hideModal();
          }

        }
      })
    } else {
      //显示登录授权
    }
  },

  /**
   * 立即购买
   */
  buyNow: function (event) {
    var isSku = event.currentTarget.dataset.isSku;
    var that = this;
    console.log(isSku);

    if (isSku) {
      if (this.data.skuId.length == '') {
        wx.showToast({
          title: '请选择规格',
          icon: "none",
          duration: 2000
        });
        return;
      }
      var skuIdArr = this.data.skuId.split(',');
      for (var i = 0; i < skuIdArr.length; i++) {
        if (skuIdArr[i] == '') {
          wx.showToast({
            title: '请选择规格',
            icon: "none",
            duration: 2000
          });
          return;
        }
      }
    }
    if (!this.checkSkuSelectStatus(isSku)) {
      return;
    }
    if (Number(this.data.skuNum) === Number("0")) {
      wx.showToast({
        icon: 'none',
        title: '该商品暂时没有存货',
      });
      return;
    }
    var pOptionTexts = [];
    var skuName = [];
    var attributesList = that.data.goods.attributes && that.data.goods.attributes[0];
    for (var i = 0; i < attributesList.length; i++) {
      skuName.push(attributesList[i][0]);
      pOptionTexts.push(attributesList[i][1][attributesList[i][2]]);
    }
    pOptionTexts = [pOptionTexts.join()];
    wx.navigateTo({
      url: '../order/check?goods_id=' +
        that.data.goods.id +
        "&count=" + that.data.count +
        "&sku=" + skuIdArr,
      success: function (res) {
        that.hideModal();
      }
    });
  },
  /**
   * 检查规格选择情况
   */
  checkSkuSelectStatus: function (isSku) {
    var hasSelectSku = true;
    var goodsAttribute = this.data.goods.attributes && this.data.goods.attributes[0];
    for (var i = 0; i < goodsAttribute.length; i++) {
      if (goodsAttribute[i].length < 3) {
        hasSelectSku = false;
      }
    }
    if (!hasSelectSku && isSku && isSku.length !== 0) {
      wx.showToast({
        title: '请选择规格',
        icon: "none",
        duration: 2000
      });
    }

    return hasSelectSku;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.setNavigationBarTitle({
      title: options.title,
    });
    wx.setStorage({
      key: 'shopid',
      data: options.shopid
    });
    goodsId = options.id;

    //处理扫描二维码打开时候带的参数
    var scene = decodeURIComponent(options.scene);
    var shopid = null;

    if (scene != "undefined") {
      if (scene.indexOf('-') != -1) {
        goodsId = scene.split('-')[0];
        shopid = scene.split('-')[1];
        wx.setStorage({
          key: 'shopid',
          data: shopid
        });
      } else {
        goodsId = scene;
      }
    }

    this.loadData();
    wx.request({
      url: app.globalData.apiUrl + 'live&act=list',
      header: {
        "token": wx.getStorageSync("token")
      },
      data: {
        page: 1,
        limit: 10,
        v: 1.05
      },
      success: function (res) {
        that.setData({
          qrcode: res.data.data.showLive
        });
      },
      fail: function (res) {
      },
      complete: function (res) {
      }
    });
  },


  showShareModal: function () {

    this.setData({
      isNoScroll: true
    });
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 100,
      timingFunction: "ease",
      delay: 0
    });

    animation.translateY(300).step();
    this.setData({
      shareAnimationData: animation.export(),
      showShareModalStatus: true
    });

    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        shareAnimationData: animation.export()
      })
    }.bind(this), 100);
  },

  hideShareModal: function () {
    this.setData({
      isNoScroll: false
    });
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });

    animation.translateY(300).step();
    this.setData({
      shareAnimationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        shareAnimationData: animation.export(),
        showShareModalStatus: false
      });
    }.bind(this), 200);
  },



  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    this.hideShareModal();
    return {
      title: this.data.goods.name,
      imageUrl: this.data.goods.cover,
      path: '/pages/goods/details?id=' + goodsId,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  /**
   * 生成分享海报
   */
  shareQrcode: function () {

    var that = this;
    that.hideShareModal();

    that.setData({
      qrcodeUrl: app.globalData.apiUrl + "wechat/wxacode&id=" + goodsId + "&page=pages/goods/details",
      posterUrl: app.globalData.apiUrl + "goods/poster&id=" + goodsId,
      showPosterModal: true
    });
  }


})