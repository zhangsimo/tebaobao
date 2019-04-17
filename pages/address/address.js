// pages/address/address.js
const app = getApp();
var provincialCity = {};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    checked: false,
    addressList: null,
    isMark:false,
    animationData: null,
    createAddressStatus: false,
    editAddressStatus: false,
    isDelete:false,
    isShowCityList: false,
    autoAddress: null,
    province: [],
    city: [],
    area: [],
    province_index: 0,
    city_index: 0,
    area_index: 0,
    cityShow: [],
    region: [], 
    result: {},
    intelligenceText:  null,
    intelligenceAddress: {},
    isUserAuth: true,
    isButtonShow: 'visible',
    isShowInput: 'block'
  },

  // 获取收货地址列表
  getAddressList: function () {
    var that = this;
    wx.request({
      url: app.globalData.apiUrl + "address/list&token=" + wx.getStorageSync("token"),
      method: "POST",
      success: function (res) {
        if (res.data.code === 0) {
          var datas = res.data.data;
          that.setData({
            addressList:res.data.data
          })
        }
      }
    });
  },

  // 添加收货地址
  chooseAddress: function (e) {
    var obj = {};
    var that = this;  
    var id = e.currentTarget.dataset.id;     
    var datas = this.data.addressList.map(function(val, key) {
      if (val.aId == id) {
        obj = {
          ...val,
          isDefault: "1"
        }
      } else {
        obj = {
          ...val,
          isDefault: "0"
        }     
      }
      return obj;
    });
    this.setData({
      addressList: datas
    });
    wx.showLoading({
      title: 'loading',
    });
    wx.request({
      url: app.globalData.apiUrl + "address/set-default&token=" + wx.getStorageSync("token"),
      method: "GET",
      data: {
        address_id: id
      },
      success: function (res) {
        if (res.data.code === 0) {
          that.getAddressList();
          wx.navigateBack({
            delta: 1
          })
        }
      },
      complete: function () {
        wx.hideLoading();
      }
    });
  },

  // 显示新建收货地址
  showModal: function () {
    var that = this;
    // 显示遮罩层
    this.setData({
      isMark: true,
      result:{},
      intelligenceText: '',
      intelligenceAddress: {}
    });
    this.getCityList();
    // wx.request({
    //   url: app.globalData.apiUrl + 'project/data-version&type=region_list',
    //   methods: 'GET',
    //   success: function(res) {
    //     var version = res.data.data.data_version.version
    //     console.log('version', res);
    //     wx.setStorage({
    //       key: 'version_city',
    //       data: version,
    //     })
    //     if (version === wx.getStorageSync("version_city")) {
    //       that.getCityList();
    //       that.setData({
    //         region: wx.getStorage({ key:'city_list'})
    //       })
    //     } else if (wx.getStorageSync("version_city") !== version) {
    //       that.getCityList();
    //     }
    //   }
    // })
    var animation = wx.createAnimation({
      duration: 400,
      timingFunction: "ease",
      delay: 0
    });

    animation.translateY(300).step();
    this.setData({
      animationData: animation.export(),
      createAddressStatus: true
    });

    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 100);
  },

  // 隐藏新建收货地址
  hideModal: function () {
    this.setData({
      intelligenceAddress: ''
    })
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 400,
      timingFunction: "linear",
      delay: 0
    });

    animation.translateY(300).step();
    this.setData({
      animationData: animation.export()
    })
    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        animationData: animation.export(),
        createAddressStatus: false,
        isMark: false
      });
    }.bind(this), 200);
  },

  // 新建收货地址
  formSubmit:function (event) {
    var val = event.detail.value;
    var reg = /^1\d{10}$/;
    var data = {};
    var that = this;
    if (val.consignee === '') {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    console.log(val.mobile)
    if (val.mobile === '' || !reg.test(Number(val.mobile))) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none',
        duration: 2000
      }); 
      return;
    }
    if (val.provinceId === '' && val.cityId === '' && val.districtId === '') {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    if (val.address === '') {
      wx.showToast({
        title: '请输入详细地址',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    wx.showLoading({
      title: '提交中...',
    });
    data = {
      consignee: val.consignee,
      mobile: val.mobile,
      countryId:1,
      provinceId: this.data.result.province.id,
      cityId: this.data.result.city.id,
      districtId: this.data.result.area.id,
      address: val.address,
      zipCode: '000000'
    }
    wx.request({
      url: app.globalData.apiUrl + "address/new-add&token=" + wx.getStorageSync("token"),
      method: "POST",
      data: data,
      success: function (res) {
        if (res.data.code === 0) {
          that.setData({
            isMark: false,
            createAddressStatus: false
          });
          that.getAddressList();
        }
      },
      complete: function () {
        wx.hideLoading();
      }
    })
  },

  // 智能录入地址的value
  intelligenceChange: function (e) {
    var val = e.detail.value;
    this.setData({
      intelligenceText: val
    });
  },

  // 智能收货地址
  intelligenceSubmit: function () {
    var that = this;
    if (this.data.intelligenceText == '') {
      wx.showToast({
        title: '请输入收货地址',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    wx.showLoading({
      title: '提交中...',
    });
    wx.request({
      url: app.globalData.apiUrl + "address/cloud-resolve&token=" + wx.getStorageSync("token"),
      method: "POST",
      data: {
        address: this.data.intelligenceText
      },
      success: function (res) {
        if (res.data.code === 0) {
          var address = res.data.data.address;
          var obj = {};
          obj = {
            ...address,
            consignee: address.name,
            address: address.detail
          }
          var city = {
            province: {
              name: address.province_name,
              id: address.province_id
            },
            city: {
              name: address.city_name,
              id: address.city_id
            },
            area: {
              name: address.county_name,
              id: address.county_id
            }
          };
          that.setData({
            intelligenceAddress: obj,
            result: city,
            intelligenceText: ''
          });
        }
      },
      complete: function () {
        wx.hideLoading();
      }
    })
  },

  // 清空智能录入
  intelligenceClear: function (e) {
    this.setData({
      intelligenceText: ''
    });
  },

  // 照片上传
  uploadImage:function () {
    var that = this;
    wx.showLoading({
      title: '提交中...',
    });
    wx.chooseImage({
      count: 1, 
      sizeType: ['original', 'compressed'], 
      sourceType: ['album', 'camera'],
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        wx.uploadFile({
          url: app.globalData.apiUrl + "address/cloud-ocr&token=" + wx.getStorageSync("token"),
          filePath: tempFilePaths[0],
          name: 'img',
          header: {
            "Content-Type": "multipart/form-data",
            'accept': 'application/json',
            'Authorization': 'Bearer ..'    //若有token，此处换上你的token，没有的话省略
          },
          success: function (res) {
            var datas = JSON.parse(res.data);
            if (datas.code === 0) {
              var address = datas.data.address;
              var obj = {
                consignee: address.name,
                mobile: address.mobile,
                address: address.detail.address,
                province: address.detail.province,
                provinceId: address.province_id,
                city: address.detail.city,
                cityId: address.city_id,
                area: address.detail.district,
                areaId: address.county_id,
                zipCode: '000000'
              };
              that.setData({
                intelligenceAddress: obj
              })
              var city = {
                province: {
                  name: that.data.intelligenceAddress.province,
                  id: that.data.intelligenceAddress.provinceId
                },
                city: {
                  name: that.data.intelligenceAddress.city,
                  id: that.data.intelligenceAddress.cityId
                },
                area: {
                  name: that.data.intelligenceAddress.area,
                  id: that.data.intelligenceAddress.areaId
                }
              }
              that.setData({
                result: city
              })
            }
          },
          complete: function (res) {
            wx.hideLoading();
          },
        })
      }
    })
  },

  // 显示删除的二次确认框
  showDel: function (event) {
    var aId = event.currentTarget.dataset.delAddress;
    this.setData({
      isDelete: true,
      aId
    })
  },


  // 确认删除收货地址
  deleteAddress: function () {
    var that = this;
    wx.showLoading({
      title: '删除中...',
    });
    wx.request({
      url: app.globalData.apiUrl + "address/delete&token=" + wx.getStorageSync("token"),
      method: "GET",
      data: {
        address_id: this.data.aId
      },
      success:function (res) {
        if(res.data.code === 0) {
          that.getAddressList();
          that.setData({
            isDelete: false
          });
        }
      },
      complete: function (res) {
        wx.hideLoading();
      }
    });
  },

  // 取消删除
  cancelDel: function () {
    this.setData({
      isDelete:false
    });
  },

  // 新建弹出城市列表
  showCities: function (e) {
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease'
    });
    this.animation = animation;
    animation.height(1332 + 'rpx').step();
    this.setData({
      animationData: animation.export(),
      isButtonShow: 'hidden',
      isShowInput: 'none'
    });
  },

  // 编辑弹出城市列表
  showCitiesEdit:function(e) {
    var that = this;
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease'
    });
    this.animation = animation;
    animation.height(1332 + 'rpx').step();
    this.setData({
      animationData: animation.export(),
      isButtonShow: 'hidden',
      isShowInput: 'none'
    });
    var provinceId = 0;
    var cityId = 0;
    var areaId = 0;
    this.data.province.map(function(val, key) {
      if (val.id === that.data.result.province.id) {
        provinceId = key;
      }
      return provinceId;
    })
    this.setData({
      province_index: provinceId
    });
    this.formatCityData();
    this.data.city.map(function(val, key) {
      if (val.id === that.data.result.city.id) {
        cityId = key;
      }
      return cityId;
    })
    this.setData({
      city_index: cityId
    });
    this.formatCityData();
    this.data.area.map(function (val, key) {
      if (val.id === that.data.result.area.id) {
        areaId = key;
      }
      return areaId;
    })
    var lists = [provinceId, cityId, areaId];
    this.setData({ cityShow: lists });
  }, 

  // 取消选择城市
  cancelCities: function () {
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease'
    });
    this.animation = animation;
    animation.height(0 + 'rpx').step();
    this.setData({
      animationData: animation.export(),
      isButtonShow: 'visible',
      isShowInput: 'block'
    });
    // 取消不传值
    provincialCity = []
  },

  // 获取城市列表
  getCityList: function () {
    var that = this;
    wx.request({
      url: app.globalData.apiUrl + "address/region&token=" + wx.getStorageSync("token"),
      method: "GET",
      success: function (res) {
        if (res.data.code === 0) {
          that.setData({
              region: res.data.data.region
          }); 
          that.formatCityData();
          // wx.setStorage({
          //   key: 'city_list',
          //   data: res.data.data.region,
          // })
        }
      },
      complete: function() {
       
      }

    });
  },

  // 选择城市
  bindChange: function (e) {
    const val = e.detail.value;
    this.setData({
      province_index: val[0],
      city_index: val[1],
      area_index: val[2]
    });
    this.formatCityData();
  },

  // 选择城市后确认
  confirmCities: function () {
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease'
    });
    this.animation = animation;
    animation.height(0 + 'rpx').step();
    this.setData({
      animationData: animation.export(),
      result: provincialCity,
      isButtonShow: 'visible',
      isShowInput: 'block'
    });
  },

  // 把数据格式化成页面现实的形式
  formatCityData: function () {
    var that = this,
        region = that.data.region,
        selectItems = [],
        province = [],
        city = [],
        area = [],
        area_index = that.data.area_index,
        city_index = that.data.city_index,
        province_index = that.data.province_index;
    // 第一遍格式化数据，
    for (var i = 0; i < region.length; i++) {
      if (region[i].parent_id == 1) {
        var provinceItem = region[i];
        var selectItem1 = { label: provinceItem.zh_name, provinceId: provinceItem.id, children: [] };
        for (var j = 0; j < region.length; j++) {
          if (region[j].parent_id == provinceItem.id) {
            var cityItem = region[j];
            var selectItem2 = { label: cityItem.zh_name, cityId: cityItem.id, children: [] };
            selectItem1.children.push(selectItem2);
            for (var k = 0; k < region.length; k++) {
              if (region[k].parent_id == cityItem.id) {
                var areaItem = region[k];
                var selectItem3 = { label: areaItem.zh_name, areaId: areaItem.id, children: [] };
                selectItem2.children.push(selectItem3);
              }
            }
          }
        }
        selectItems.push(selectItem1);
      }
    }
    // 遍历所有的数据。将省的名字放在对应的数组中
    for (let i = 0; i < selectItems.length; i++) {
      province.push({
        name: selectItems[i].label,
        id: selectItems[i].provinceId
      });
    }
    if (selectItems[province_index].children && selectItems[province_index].children) {// 判断选中的省级里面有没有市
      if (selectItems[province_index].children[city_index]) {
        for (let i = 0; i < selectItems[province_index].children.length; i++) {
          city.push({
            name: selectItems[province_index].children[i].label,
            id: selectItems[province_index].children[i].cityId
          });
        }
        if (selectItems[province_index].children[city_index].children) {
          if (selectItems[province_index].children[city_index].children[area_index]) {
            for (let i = 0; i < selectItems[province_index].children[city_index].children.length; i++) {
              area.push({
                name: selectItems[province_index].children[city_index].children[i].label,
                id: selectItems[province_index].children[city_index].children[i].areaId
              });
            }
          } else {
            that.setData({
              area_index: 0
            });
            for (let i = 0; i < selectItems[province_index].children[city_index].childre.length; i++) {
              area.push({
                name: selectItems[province_index].children[city_index].children[i].label,
                id: selectItems[province_index].children[city_index].children[i].areaId
              });
            }
          }
        } else {
          area.push({
            name: province[province_index].children[city_index].label,
            id: province[province_index].children[city_index].areaId
          });
        }
      } else {
        that.setData({
          city_index: 0
        });
        for (let i = 0; i < selectItems[province_index].childre.length; i++) {
          city.push({
            name: selectItems[province_index].children[i].label,
            id: selectItems[province_index].children[i].cityId
          });
        }
      }
    } else {
      // 如果该省没有市，那么就把省的名字作为市和区的名字
      city.push({
        name: province[province_index].label,
        id: province[province_index].cityId
      });
      area.push({
        name: province[province_index].label,
        id: province[province_index].areaId
      });
    }
    // 选择成功后把对应的数组赋值给相应的变量
    that.setData({
      province: province,
      city: city,
      area: area
    });
    provincialCity = {
      province: {
        name: province[that.data.province_index].name,
        id: province[that.data.province_index].id,
      },
      city: {
        name: city[that.data.city_index].name,
        id: city[that.data.city_index].id
      },
      area: {
        name: area[that.data.area_index].name,
        id: area[that.data.area_index].id
      } 
    }
  },

  // 显示编辑收货地址
  showEditAddress: function (e) {
    var that = this;
    var editAddress = null;
    var id = e.currentTarget.dataset.editAddress;
    this.getCityList();
    var datas = this.data.addressList.map(function (val, key) {
      if (val && val.aId == id) {
        editAddress = that.data.addressList[key];
      }
      return editAddress;
    });

    this.setData({
      intelligenceAddress: editAddress,
      editAid: id,
      isButtonShow: 'visible',
      isShowInput: 'block'
    });
    var city = {
      province: {
        name: this.data.intelligenceAddress.province,
        id: this.data.intelligenceAddress.provinceId
      },
      city: {
        name: this.data.intelligenceAddress.city,
        id: this.data.intelligenceAddress.cityId
      },
      area:{
        name: this.data.intelligenceAddress.district,
        id: this.data.intelligenceAddress.districtId
      } 
    }

    this.setData({
      result: city,
    })
    // 显示遮罩层
    this.setData({
      isMark: true
    });
    var animation = wx.createAnimation({
      duration: 400,
      timingFunction: "ease",
      delay: 0
    });

    animation.translateY(300).step();
    this.setData({
      animationData: animation.export(),
      editAddressStatus: true,
    });

    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 100);
  },

  // 隐藏编辑收货地址
  hideEditAddress: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 400,
      timingFunction: "linear",
      delay: 0
    });

    animation.translateY(300).step();
    this.setData({
      animationData: animation.export(),
      isButtonShow: 'visible',
      isShowInput: 'block'
    })
    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        animationData: animation.export(),
        editAddressStatus: false,
        isMark: false
      });
    }.bind(this), 200);
  },

  // 编辑收货地址
  editAddressSuccess: function (event) {
    var val = event.detail.value;
    var reg = /^1\d{10}$/;
    var data = {};
    var that = this;
    if (val.consignee === '') {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    console.log(val.mobile)
    if (val.mobile === '' || !reg.test(Number(val.mobile))) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    if (val.provinceId === '' && val.cityId === '' && val.districtId === '') {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    if (val.address === '') {
      wx.showToast({
        title: '请输入详细地址',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    wx.showLoading({
      title: '提交中...',
    });
    data = {
      aId: this.data.editAid,
      consignee: val.consignee,
      mobile: val.mobile,
      countryId: 1,
      provinceId: this.data.result.province.id,
      cityId: this.data.result.city.id,
      districtId: this.data.result.area.id,
      address: val.address,
      zipCode: val.zipCode
    }
    wx.request({
      url: app.globalData.apiUrl + "address/new-edit&token=" + wx.getStorageSync("token"),
      method: "POST",
      data: data,
      success: function (res) {
        if (res.data.code === 0) {
          that.setData({
            isMark: false,
            editAddressStatus: false
          });
          that.getAddressList();
        }
      },
      complete: function () {
        wx.hideLoading();
      }
    })
  },

  // 微信授权
  weixinAuth: function () {
    var that = this;
    wx.getSetting({
      success: (res) => {
        this.setData({
          isUserAuth: res.authSetting['scope.address']
        })
      }
    });
    wx.chooseAddress({
      success: function (res) {
        wx.request({
          url: app.globalData.apiUrl + "address/wechat-scope-address&token=" + wx.getStorageSync("token"),
          method: "POST",
          data: {
            province: res.provinceName,
            city: res.cityName,
            district: res.countyName,
            address: res.detailInfo,
            zipcode: res.postalCode,
            consignee: res.userName,
            mobile: res.telNumber
          },
          success: function (res) {
            if (res.data.code === 0) {
              that.getAddressList();
            } else {
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 2000
              })
            }
          }
        });
      }
    });
  },

  cancelAuth: function () {
    this.setData({
      isUserAuth: true
    });
  },

  setAuth: function () {
    this.setData({
      isUserAuth: true
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAddressList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {;
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})