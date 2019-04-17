// pages/category/category.js
const app = getApp();
var allCategory = [];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryTop:[],
    categorySub:[],
    subCategoryName:"",
    animationData: null,
    isNoNetError:true
  },

  loadData: function () {
    var that = this;

    wx.request({
      url: app.globalData.apiUrl + "category/list",

      success: function (res) {
        app.debugConsole(res);

        that.setData({
          isNoNetError: true
        });

        if (res.data.code == 0) {

          //处理顶部分类
          var categoryTop = [];
          var j = 0;
          var subCategoryName = "";
          allCategory = res.data.data;

          for(var i=0; i< res.data.data.length; i++){
            var category = res.data.data[i];
            if(category.parent_id == 0){
              if(j==0){
                category.isActive = true;
                subCategoryName = category.name;
              }else{
                category.isActive = false;
              }
              categoryTop.push(category);
              j++;
            }
          }

          var categorySub = [];
          if(categoryTop.length > 0){
            var parentId = categoryTop[0].id;

            for (var i = 0; i < res.data.data.length; i++){
              var category = res.data.data[i];
              if (category.parent_id == parentId) {
                categorySub.push(category);
              }
            }
          }

          that.setData({
            categoryTop: categoryTop,
            categorySub: categorySub,
            subCategoryName: subCategoryName
          });

        }
        wx.stopPullDownRefresh();
      },
      fail: function (res) {
        that.setData({
          isNoNetError: false
        });
      }
    });
  },

  topCategoryTap: function(event){
    var parentId = event.currentTarget.dataset.id;
    var index = event.currentTarget.dataset.index;

    var yindex = 2*(index * 44 + 14);
    var categoryTop = this.data.categoryTop;
    var categorySub = [];
    var subCategoryName = "";

    for (var i = 0; i < categoryTop.length;i++){
      if (categoryTop[i].id == parentId){
        categoryTop[i].isActive = true;
        subCategoryName = categoryTop[i].name;
      }else{
        categoryTop[i].isActive = false;
      }
    }

    for (var i = 0; i < allCategory.length; i++){
      if (allCategory[i].parent_id == parentId){
        categorySub.push(allCategory[i]);
      }
    }

    var animation = wx.createAnimation({
      duration: 100,
      timingFunction: "ease",
      delay: 0
    });
    
    animation.top(yindex+"rpx").step();

    this.setData({
      categoryTop: categoryTop,
      categorySub: categorySub,
      animationData: animation.export(),
      subCategoryName: subCategoryName
    });
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "搜索"
    });

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
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})