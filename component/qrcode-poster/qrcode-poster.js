const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showPosterModal: {
      type: Boolean,
      value: false,
    },
    posterUrl:{
      type:String,
      value:null
    },

    qrcodeUrl:{
      type:String, 
      value: null
    },
    goods:{
      type:Object,
      value: null
    },
    disabled:{
      type:Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    appiconUrl: app.globalData.appiconUrl,
    appName: app.globalData.appName,
    confirmDisabled: false,
    showPhoto: false
  },

  ready() {
    var that = this;
    // wx.getSetting({
    //   success(res) {
    //     if (!res.authSetting['scope.writePhotosAlbum']) {
    //       that.setData({
    //         showPhoto: true
    //       })
    //     }
    //   }
    // }) 
  },

  /**
   * 组件的方法列表
   */
  methods: {

    hidePosterModal: function () {

      var myEventDetail = {} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent("close", myEventDetail, myEventOption);

      this.setData({
        showPosterModal: false
      });

      console.log("hidePosterModal");
    },

    emptytest:function(){

    },

    onAuthDialogCancel: function () {
      this.setData({
        // showPhoto: false,
        showPosterModal: false
      })
    },

    save: function(){

      var that = this;

      wx.showLoading({
        title: '保存图片到手机相册中...',
      });

      that.setData({
        disabled: true
      });

      wx.downloadFile({
        url: that.data.posterUrl, 
        success: function (res) {
          that.setData({
            disabled: false
          });
          if (res.statusCode === 200) {
            //保存到相册
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function(){
                wx.hideLoading();
                that.setData({
                  showPosterModal: false
                });

                wx.showToast({
                  title: '成功保存',
                  icon:"success"
                });

                that.triggerEvent("close",{}, {});
              },
              fail:function(){
                wx.hideLoading();
                that.setData({
                  showPosterModal: false
                });
                that.triggerEvent("close", {}, {});
              }
            });
          }
        },
        fail: function(){
          that.setData({
            disabled: false
          });
          wx.hideLoading();
          that.triggerEvent("close", {}, {});
        }
      });
    }
  }
})
