// pages/category/search.js

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showHistory: true,
    historyKey: [],
    hotKey: [],
    keyword: '', 
    goods: null,
    history:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.request({
      url: app.globalData.liveUrl + "search/keywords",
      success: function(res) {
        if (res.data.code == 1001) {
          that.setData({
            historyKey: res.data.data.history_keywords,
            hotKey: res.data.data.hot_keywords
          })
        }
      },
      fail: function(res) {
        console.log('fail', res);
      }
    })
  },

  search: function(e){
    this.data.keyword = e.detail.value;
    if(!this.data.keyword||this.data.keyword == ""){
      return;
    }

    if(this.data.history==null){
      this.data.history = [];
    }

    var samekeyword = false;
    for(var i=0; i< this.data.history.length; i++){
      if(this.data.history[i] == this.data.keyword){

        if(this.data.history.length>1){
          this.data.history.splice(i, 1);
          this.data.history = [this.data.keyword].concat(this.data.history);
        }
        samekeyword = true;
        break;
        
      }
    }

    if(!samekeyword){
      
      if (this.data.history.length==10){
        this.data.history.pop();
      }

      this.data.history = [this.data.keyword].concat(this.data.history);
    }

    this.setData({
      history:this.data.history
    });

    wx.setStorage({
      key: 'search_history',
      data: this.data.history,
    });
    this.data.goods = [];
    this.setData({
      showHistory: false
    });
    wx.showLoading({
      title: '搜索中...'
    });
    this.loadData();
  },

  deleteHistory:function(e){

    var that = this;
    wx.showModal({
      title: '确认删除全部搜索历史?',
      content: '',
      success: function(res){
        wx.removeStorage({
          key: 'search_history',
          success: function(res) {},
        });
        that.setData({
          history:null
        });
      }
    })
  },

  loadData: function(){

    var that  = this;
    var count = 0;
    
    if(that.data.goods){
      count = that.data.goods.length;
    }

    wx.request({
      url: app.globalData.apiUrl + "goods/search",
      method: "GET",
      data:{keyword: that.data.keyword, count: count},
      success: function(res){

        if(res.data.code == 0){
          that.data.goods = that.data.goods.concat(res.data.data.goods);
          
          that.setData({

            goods: that.data.goods
          });
        }
      },
      
      fail:function(res){

      },

      complete: function(res){
        wx.hideLoading();
      }
    });
  },

  delText: function() {
    this.setData({
      keyword: ''
    });
  },

  keywordSelect:function(e){
    this.data.keyword = e.currentTarget.dataset.keyword;
    this.setData({
      keyword: this.data.keyword
    });
    e.detail.value = this.data.keyword;
    this.search(e);
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
    wx.getStorage({
      key: 'search_history',
      success: function (res) {
        that.setData({
          history: res.data
        });
      },
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
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})