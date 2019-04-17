// pages/shopcart/shopcart.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading:true,
    isEmpty:false,
    shopcartItems:null,
    isSubmitDisable:true,
    isSelectAll: false,
    totalPrice: "",
    selectCount: "",//选择的购物车商品数量的说明比如（1）
    isNoNetError: true
  },

  loadData: function(event){
    var that = this;
    wx.request({
      url: app.globalData.apiUrl + "shopcart/index&token=" + wx.getStorageSync("token"),
      success: function (res) {
        app.debugConsole(res.data.data);

        that.setData({
          isNoNetError: true
        });

        var isEmpty = false;
        if (res.data.data && res.data.data.length == 0){
          isEmpty = true;
        }
        that.setData({
          shopcartItems: res.data.data,
          isEmpty: isEmpty
        });
        wx.stopPullDownRefresh();
      },
      fail: function(res){
        that.setData({
          isNoNetError:false
        });
      },
      complete: function (res) {
        that.setData({
          isLoading: false,
          isSubmitDisable: true,
          isSelectAll: false,
          selectCount: "",
          totalPrice: ""
        });
      }
    });
  },

  goToBuy: function (event) {
    wx.switchTab({
      url: "../index/index"
    });
  },

  edit: function (e) {
    var shopId = e.currentTarget.dataset.shopId;
    var checkboxItems = this.data.shopcartItems;

    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      if (checkboxItems[i].shopId == shopId){

        if (checkboxItems[i].isEditing){
          checkboxItems[i].isEditing  = false;
        }else{
          checkboxItems[i].isEditing = true;
        }

        break;
      }
    }

    this.setData({
      shopcartItems: checkboxItems
    });
  },

  minus: function(e){

    var that = this;
    var cartId = e.currentTarget.dataset.id;
    var count = 0;
    
    for (var i = 0; i < that.data.shopcartItems.length; i++){
      
      for(var j = 0; j < that.data.shopcartItems[i].cartProducts.length; j++){

        if (that.data.shopcartItems[i].cartProducts[j].cartId == cartId){
          count = that.data.shopcartItems[i].cartProducts[j].pQuantity;
          if(count > 1){
            count --;
          }

          that.data.shopcartItems[i].cartProducts[j].pQuantity = count;
        }
      }
    }

    wx.request({
      url: app.globalData.apiUrl+"shopcart/edit&token="+wx.getStorageSync("token"),
      data:{id: cartId, count: count},
      success: function(res){
        console.log(res);
        that.getCount();
      }
    });

    that.setData({
      shopcartItems: that.data.shopcartItems
    });

    that.checkWhetherSubmit();
  },

  plus: function(e){
    var that = this;
    var cartId = e.currentTarget.dataset.id;
    var count = 0;

    for (var i = 0; i < that.data.shopcartItems.length; i++) {

      for (var j = 0; j < that.data.shopcartItems[i].cartProducts.length; j++) {

        if (that.data.shopcartItems[i].cartProducts[j].cartId == cartId) {
          count = that.data.shopcartItems[i].cartProducts[j].pQuantity;

          count++;

          that.data.shopcartItems[i].cartProducts[j].pQuantity = count;
        }
      }
    }

    wx.request({
      url: app.globalData.apiUrl + "shopcart/edit&token=" + wx.getStorageSync("token"),
      data: { id: cartId, count: count },
      success: function (res) {
        console.log(res);

        that.getCount();
      }
    });

    that.setData({
      shopcartItems: that.data.shopcartItems
    });

    that.checkWhetherSubmit();
  },

  stepperInput: function(e){
    var that = this;
    var cartId = e.currentTarget.dataset.id;
    var count = e.detail.value;

    for (var i = 0; i < that.data.shopcartItems.length; i++) {

      for (var j = 0; j < that.data.shopcartItems[i].cartProducts.length; j++) {

        if (that.data.shopcartItems[i].cartProducts[j].cartId == cartId) {

          that.data.shopcartItems[i].cartProducts[j].pQuantity = count;
        }
      }
    }

    wx.request({
      url: app.globalData.apiUrl + "shopcart/edit&token=" + wx.getStorageSync("token"),
      data: { id: cartId, count: count },
      success: function (res) {
        console.log(res);
      }
    });

    that.setData({
      shopcartItems: that.data.shopcartItems
    });

    that.checkWhetherSubmit();
  },

  delete: function(e){

    var that = this;
    var cartId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确定要删除该商品么？',
      content: '',
      success: function(res){
        if(res.confirm){
          wx.showLoading({
            title: '删除中...',
          });

          wx.request({
            url: app.globalData.apiUrl+"shopcart/delete&token="+wx.getStorageSync("token"),
            data: {id: cartId},
            success: function(res){
              if(res.data.code == 0){

                outer:
                for (var i = 0; i < that.data.shopcartItems.length; i++){
                  
                  var items = that.data.shopcartItems[i].cartProducts;
                  for(var j = 0; j < items.length; j++){

                    if(items[j].cartId == cartId){
                      that.data.shopcartItems[i].cartProducts.splice(j,1);

                      if (that.data.shopcartItems[i].cartProducts.length==0){
                        that.data.shopcartItems.splice(i, 1);
                        break outer;
                      }
                    }
                  }
                }
              }

              var isEmpty = false;

              if(that.data.shopcartItems.length == 0){
                isEmpty = true
              }

              that.setData({
                shopcartItems: that.data.shopcartItems,
                isEmpty: isEmpty
              });

              that.getCount();
            },
            complete: function(res){
              wx.hideLoading();
            }
          });//end wx.request
        }
      }
    });
  },

  getCount: function(){
    wx.request({
      url: app.globalData.apiUrl + "shopcart/count&token=" + wx.getStorageSync("token"),
      success: function (res) {
        if (res.data.code == 0) {

          app.globalData.shopcartCount = res.data.data.count;

          app.setShopcartCount();
        }
      }
    });
  },

  shopCheckboxChange: function (e) {

    var shopId = e.currentTarget.dataset.id;
    var isSelectAll = true;
    var checkboxItems = this.data.shopcartItems, values = e.detail.value;

    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {

      if(checkboxItems[i].shopId == shopId){
        
        var isChecked = false;
        if (values.length > 0) {
          isChecked = true;
        } else {
          isChecked = false;
        }

        checkboxItems[i].checked = isChecked;

        for(var j=0;j<checkboxItems[i].cartProducts.length;j++){
          checkboxItems[i].cartProducts[j].checked = isChecked;
        }
      }

      for (var j = 0; j < checkboxItems[i].cartProducts.length; j++){
        if (!checkboxItems[i].cartProducts[j].checked) {
          isSelectAll = false;
        }
      }
      
    }

    this.setData({
      shopcartItems: checkboxItems,
      isSelectAll: isSelectAll
    });
    this.checkWhetherSubmit();
  },

  /**
   * 显示商品详情
   */
  showGoodsDetail: function(e){
    
    wx.navigateTo({
      url: '../goods/details?id='+e.currentTarget.dataset.id+"&title="+e.currentTarget.dataset.title,
    })
  },

  /**
   * 单选某一个商品
   */

  singleSelect:function(e){

    var value = e.detail.value;
    var cartId = e.currentTarget.dataset.id;
    var checkboxItems = this.data.shopcartItems;
    var isSelectAll = true;

    var shopId = 0;

    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {

      for (var j = 0; j < checkboxItems[i].cartProducts.length; j++) {

        if (checkboxItems[i].cartProducts[j].cartId == cartId){
          shopId = checkboxItems[i].shopId;
          if(value.length>0){
            checkboxItems[i].cartProducts[j].checked = true;
          }else{
            checkboxItems[i].cartProducts[j].checked = false;
          }
        }

        if (!checkboxItems[i].cartProducts[j].checked){
          isSelectAll = false;
        }
      }
    }

    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      if (checkboxItems[i].shopId == shopId){
        
        for (var j = 0; j < checkboxItems[i].cartProducts.length; j++){

          if (!checkboxItems[i].cartProducts[j].checked){
            checkboxItems[i].checked = false;
            break;
          }else{
            checkboxItems[i].checked = true;
          }
        }

        
        break;
      }
    }

    this.setData({
      shopcartItems: checkboxItems,
      isSelectAll: isSelectAll
    });

    this.checkWhetherSubmit();

  },

  /**
   * 全选
   */
  selectAll:function(e){

    var value = e.detail.value;
    var checkboxItems = this.data.shopcartItems;

    var isSelectAll = false;
    if(value.length>0){
      isSelectAll = true;
    }else{
      isSelectAll = false;
    }

    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {

      checkboxItems[i].checked = isSelectAll;

      for (var j = 0; j < checkboxItems[i].cartProducts.length; j++) {
        checkboxItems[i].cartProducts[j].checked = isSelectAll;
      }
    }

    this.setData({
      isSelectAll:isSelectAll,
      shopcartItems: checkboxItems
    });

    this.checkWhetherSubmit();
  },

  /**
   * 检查是否可以提交,并且计算总额
   */
  checkWhetherSubmit: function(){
    var isCanSubmit = false;
    var checkboxItems = this.data.shopcartItems;
    var count = 0;
    var totalPrice = 0.00;

    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {

      for (var j = 0; j < checkboxItems[i].cartProducts.length; j++) {
        if (checkboxItems[i].cartProducts[j].checked){
          isCanSubmit = true;
          totalPrice = totalPrice + parseFloat(checkboxItems[i].cartProducts[j].pPrice) * parseFloat(checkboxItems[i].cartProducts[j].pQuantity);

          totalPrice = parseFloat(totalPrice.toFixed(2));
          count++;
        }
      }
    }

    totalPrice = totalPrice.toFixed(2);

    if(count>0){
      count = "("+count+")";

      if (count>99){
        count = "(99+)";
      }
    }else{
      count = "";  
    }

    this.setData({
      isSubmitDisable: !isCanSubmit,
      selectCount: count,
      totalPrice: totalPrice
    });

  },

  check: function(e){

    var checkboxItems =  this.data.shopcartItems;
    var cartId = [];

    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {

      for (var j = 0; j < checkboxItems[i].cartProducts.length; j++) {
        if (checkboxItems[i].cartProducts[j].checked) {
          cartId.push(checkboxItems[i].cartProducts[j].cartId);
        }
      }
    }

    var cartIdStr = JSON.stringify(cartId);
    wx.navigateTo({
      url: '../order/check?cartId=' + cartIdStr + '&sku=',
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.loadData()
    if (!wx.getStorageSync('phone')) {
      wx.navigateTo({
        url: '../register/register',
      })
      return;
    }
    app.getUserInfo(function (res) {
      that.setData({
        userInfo: res,
      });
      that.loadData();
    }, function () {
      
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
    var that = this;
    app.getUserInfo(function (res) {
      that.setData({
        userInfo: res,
      });
      that.loadData();
    }, function () {
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
  
  }
})