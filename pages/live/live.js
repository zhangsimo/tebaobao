const app = getApp();

var webim = require('../../utils/webim_wx.js');
var webimhandler = require('../../utils/webim_handler.js');

var messages = [];
var historyMessages = [];
var userCount = 1;

var that;
var skuArr = [];
var skuObj = {};
var skuVal = '';

// 用户信息
var accountInfo = {
  userID: '',			// 用户ID
  userName: '',		// 用户昵称
  userAvatar: '',		// 用户头像URL
  userSig: '',		// IM登录凭证
  sdkAppID: '',		// IM应用ID
  accountType: '',	// 账号集成类型
  accountMode: 0,		//帐号模式，0-表示独立模式，1-表示托管模式
};

// 房间信息
var roomInfo = {
  roomID: '',			// 视频位房间ID
  roomName: '',		// 房间名称
  mixedPlayURL: '', 	// 混流地址
  isCreator: false,	// 是否为创建者
  pushers: [],		// 当前用户信息
  isLoginIM: false,	// 是否登录IM
  isJoinGroup: false,	// 是否加入群
  isDestory: false	// 是否已解散
};
/**
 * [loginIM 登录IM]
 * @param {options}
 *   data: {
 *   	roomID: 房间ID
 *   }
 *   success: 成功回调
 *   fail: 失败回调
 */
function loginIM(options) {
  roomInfo.isDestory = false;
  roomInfo.roomID = options.data.roomID;
  // 初始化设置参数
  webimhandler.init({
    accountMode: accountInfo && accountInfo.accountMode,
    accountType: accountInfo && accountInfo.accountType,
    sdkAppID: accountInfo && accountInfo.sdkAppID,
    avChatRoomId: options.roomID,
    selType: webim.SESSION_TYPE.GROUP,
    selToID: options.data.roomID,
    selSess: null //当前聊天会话
  });
  //当前用户身份
  var loginInfo = {
    'sdkAppID': accountInfo && accountInfo.sdkAppID, //用户所属应用id,必填
    'appIDAt3rd': accountInfo && accountInfo.sdkAppID, //用户所属应用id，必填
    'accountType': accountInfo && accountInfo.accountType, //用户所属应用帐号类型，必填
    'identifier': accountInfo && accountInfo.userID, //当前用户ID,必须是否字符串类型，选填
    'identifierNick': accountInfo && accountInfo.userName, //当前用户昵称，选填
    'userSig': accountInfo && accountInfo.userSig, //当前用户身份凭证，必须是字符串类型，选填
    'userAvatar': accountInfo && accountInfo.userAvatar // 当前用户的头像
  };
  // 同步用户信息
  wx.request({
    url: app.globalData.liveUrl + 'user/tim-update-user-info',
    method: 'post',
    header: {
      token: wx.getStorageSync("token"),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: function(res) {
      console.log(res);
    },
    fail: function(res) {
      console.log('同步用户消息',res)
    }
  })
  //监听（多终端同步）群系统消息方法，方法都定义在demo_group_notice.js文件中
  var onGroupSystemNotifys = {
    // 群被解散(全员接收)
    "5": function (notify) {
      roomInfo.isDestory = true;
      webimhandler.logout();

      wx.showModal({
        title: '直播已经结束',
        content: '',
        success: function (res) {
          if (res.confirm) {
            wx.navigateBack({
              delta: 1
            });
          }
        }
      });
    },
    "11": webimhandler.onRevokeGroupNotify, //群已被回收(全员接收)
    // 用户自定义通知(默认全员接收)
    "255": function (notify) {
      console.log('收到系统通知：', notify.UserDefinedField);
      var that = this;
      var str = notify.UserDefinedField.charAt(0);
      if (str == "{") {
        var users = JSON.parse(notify.UserDefinedField);
        userCount = users.data.message.member_num;
        // console.log(this);
        // this.setData({
        //   userCount
        // });
      }
     
      // var content = JSON.parse(notify.UserDefinedField);
      // if (content && content.cmd == 'notifyPusherChange') {

      // }
      var content = notify.UserDefinedField; //群自定义消息数据
      var msg = webimhandler.stringToCustomMsg(userCount);
      // console.log("msg.cmd: " + msg.cmd);
      // switch (msg.cmd) {
      //   case webimhandler.CUSTOM_MSG_CMD.SYSTEM_MSG_AUDIENCE_LEAVE_ROOM:
      //     console.log(msg.name + "离开房间", "");
      //     break;
      //   case webimhandler.CUSTOM_MSG_CMD.SYSTEM_MSG_AUDIENCE_ENTER_ROOM:
      //     console.log(msg.name + "进入房间", "");
      //     var countInfo = JSON.parse(msg.msg);
      //     var count = parseInt(countInfo.nowUserCount) + 2017 + parseInt(Math.random() * 200);
      //     break;
      //   case webimhandler.CUSTOM_MSG_CMD.SYSTEM_MSG_REFRESH_PRODUCT_LIST:
      //     wx.request({
      //       url: app.globalData.apiUrl + "live/goods&id=" + that.data.live_id + "&token=" + wx.getStorageSync("token"),
      //       success: function (res) {
      //         if (res.data.code == 0) {
      //           that.setData({
      //             goods: res.data.data.goods,
      //             showSkuLayout: false
      //           });
      //         }
      //       }
      //     });
      //     break;
      //   case webimhandler.CUSTOM_MSG_CMD.SYSTEM_MSG_RECOMMEND_GOODS:
      //     wx.request({
      //       url: app.globalData.apiUrl + "live/recommend-goods&id=" + that.data.live_id + "&token=" + wx.getStorageSync("token"),
      //       success: function (res) {
      //         if (res.data.code == 0) {
      //           that.setData({
      //             recommendGoods: res.data.data.goods,
      //             showSkuLayout: false
      //           });
      //         }
      //       }
      //     });
      //     break;
      //   default:
      //     break;
      // }
    }
  };

  //   //监听连接状态回调变化事件
  var onConnNotify = function (resp) {
    switch (resp.ErrorCode) {
      case webim.CONNECTION_STATUS.ON:
        //webim.Log.warn('连接状态正常...');
        break;
      case webim.CONNECTION_STATUS.OFF:
        webim.Log.warn('连接已断开，无法收到新消息，请检查下你的网络是否正常');
        break;
      default:
        webim.Log.error('未知连接状态,status=' + resp.ErrorCode);
        break;
    }
  };
  // var groupId = this.data.groupId;
  //监听事件
  var listeners = {
    "onConnNotify": webimhandler.onConnNotify, //选填
    "onBigGroupMsgNotify": function (msg) {
      console.log(msg)
      for (var i=0; i<msg.length; i++) {
        var msgs = msg[i];
        var nickName = msgs.fromAccountNick;
        var userId = msgs.fromAccount;
        var subType = msgs.sess._impl.type;
        if (subType == webim.SESSION_TYPE.GROUP) {
          for (var k = 0; k < msgs.elems.length; k++) {
            var elem = msgs.elems[k];
            console.log(elem);
            if (elem.type == webim.MSG_ELEMENT_TYPE.TEXT) {
              var str = elem.content.text;
              str = str.replace(/&quot;/g, "\"");
              var newStr = JSON.parse(str);
              let random = '';
              var colorArr = ["red", "orange", "pink", "purple", "green", "#FF164D", "#7B61FF", "#FFEC00", "#8C2FFF", "#FF6706", "#48F8FF"];
              for (var i = 0; i < colorArr.length; i++) {
                random = colorArr[Math.floor(Math.random() * colorArr.length)];
                colorArr--;
              }
              messages.push({
                username: newStr.data.nick_name, 
                content: newStr.data.show_message, 
                headUrl: newStr.data.headimg, 
                is_anchor: newStr.data.is_anchor,
                userColor: random
              });
              console.log(userCount);
              that.setData({
                messages: messages,
                userCount: userCount,
                messageToView: "msg_" + (messages.length - 1)
              });
            }
          }
        }
        // webim.getProfilePortrait({ // 获取用户信息
        //   "To_Account": [userId],
        //   "TagList":
        //     [
        //       // "Tag_Profile_IM_Nick" // 用户昵称
        //       "Tag_Profile_IM_Image" // 用户头像
        //     ]
        // },function(res){
        //   var userImg = res.UserProfileItem[0].ProfileItem[0]["Value"];
        // }, function(err) {
        // });
      }
    }, //监听新消息(大群)事件，必填
    "onMsgNotify": webimhandler.onMsgNotify, //监听新消息(私聊(包括普通消息和全员推送消息)，普通群(非直播聊天室)消息)事件，必填
    "onGroupSystemNotifys": onGroupSystemNotifys, //监听（多终端同步）群系统消息事件，必填
    "onGroupInfoChangeNotify": webimhandler.onGroupInfoChangeNotify,
    // 'onKickedEventCall': self.onKickedEventCall // 踢人操作
  };

  //   //其他对象，选填
  var others = {
    'isAccessFormalEnv': true, //是否访问正式环境，默认访问正式，选填
    'isLogOn': false //是否开启控制台打印日志,默认开启，选填
  };

  if (accountInfo && accountInfo.accountMode == 1) { //托管模式
    webimhandler.sdkLogin(loginInfo, listeners, others, 0, afterLoginIM, options);
  } else { //独立模式
    //sdk登录
    webimhandler.sdkLogin(loginInfo, listeners, others, roomInfo.roomID, afterLoginIM, options);
  }
}

//显示普通消息
// function showMsg(msg) {
//   var msg = webimhandler.stringToCustomMsg(msg.content);
//   switch (msg.cmd) {
//     case webim.GROUP_MSG_SUB_TYPE.COMMON: //群普通消息
//     messages.push({ username: msg.name, content: msg.msg });
//     if (messages.length > 50) {
//       messages.shift();
//     }
//     break;
//   }
//   that.setData({
//     messages: messages,
//     messageToView: "msg_" + (messages.length - 1)
//   });
// }

function afterLoginIM(options) {
  console.log('登录失败', options)
  if (options.errCode) {
    // webim登录失败
    console.log('webim登录失败:', options);
    options.callback.fail && options.callback.fail({
      errCode: -2,
      errMsg: '登录失败'
    });
    return;
  }
  // webim登录成功
  console.log('2.webim登录成功');
  roomInfo.isLoginIM = true;
  webimhandler.applyJoinBigGroup(roomInfo.roomID, afterJoinBigGroup, {
    success: options.callback.success,
    fail: options.callback.fail
  });
}
function afterJoinBigGroup(options) {
  if (options.errCode) {
    console.log('webim进群失败: ', options);
    options.callback.fail && options.callback.fail({
      errCode: -2,
      errMsg: '登录失败'
    });
    return;
  }
  roomInfo.isJoinGroup = true;
  console.log('进入IM房间成功: ', roomInfo.roomID);
}

/**
 * [receiveMsg 接收消息处理]
 * @param {options}
 *
 * @return event.onRecvRoomTextMsg 
 *   roomID: 房间ID
 *   userID: 用户ID
 *   nickName: 用户昵称
 *   headPic: 用户头像
 *   textMsg: 文本消息
 *   time: 消息时间
 */
function receiveMsg(msg) {
  if (!msg.content) { return; }
  console.log('IM消息: ', msg);
  if (msg.fromAccountNick == '@TIM#SYSTEM') {
    msg.fromAccountNick = '';
    msg.content = msg.content.split(';');
    msg.content = msg.content[0];
    msg.time = '';
  } else {
    var time = new Date();
    var h = time.getHours() + '', m = time.getMinutes() + '', s = time.getSeconds() + '';
    h.length == 1 ? (h = '0' + h) : '';
    m.length == 1 ? (m = '0' + m) : '';
    s.length == 1 ? (s = '0' + s) : '';
    time = h + ':' + m + ':' + s;
    msg.time = time;
    var contentObj, newContent;
    newContent = msg.content.split('}}');
    contentObj = JSON.parse(newContent[0] + '}}');
    if (contentObj.cmd == 'CustomTextMsg') {
      msg.nickName = contentObj.data.nickName;
      msg.headPic = contentObj.data.headPic;
      var content = '';
      for (var i = 1; i < newContent.length; i++) {
        if (i == newContent.length - 1)
          content += newContent[i];
        else content += newContent[i] + '}}';
      }
      msg.content = content;
    }
  }
  event.onRecvRoomTextMsg({
    roomID: roomInfo.roomID,
    userID: msg.fromAccountNick,
    nickName: msg.nickName,
    headPic: msg.headPic,
    textMsg: msg.content,
    time: msg.time
  });
};

Page({

  showMessageBar: function () {
    var that = this;
    that.setData({
      hideLiveChat: "hide",
      hideMessageBar: "",
      messageInputFocus: true
    });
  },
  hideMessageBar: function () {
    var that = this;
    that.setData({
      hideLiveChat: "",
      hideMessageBar: "hide"
    });
  },
  messageInput: function (e) {
    this.data.messageInputValue = e.detail.value;
  },
  sendMessage: function (e) {
    var that = this;
    if (that.data.messageInputValue == null || that.data.messageInputValue == "") {
      wx.showToast({
        title: '输入为空'
      });
      return;
    }
    let msgList = this.data.messages && this.data.messages.concat([{ username: "我", content: that.data.messageInputValue }]);
    webimhandler.mySendMsg(that.data.messageInputValue);
    that.setData({
      messageInputValue: null,
      messages: msgList,
      hideLiveChat: "",
      hideMessageBar: "hide",
      messageToView: "msg_" + (that.data.messages.length - 1)
    });
  },
  /**
   * 页面的初始数据
   */
  data: {
    live_id: null,
    title: "",
    coverUrl: "",
    showRegister: false,
    goods: null,
    messageInputValue: null,
    hideMessageBar: 'hide',
    showGoodsModal: false,
    navType: 0,
    count: 1,//选择的商品数量
    animationData: null,
    goodsId: null,
    //消息相关
    messageToView: 0,
    is_playback: false,
    messages: [],
    direction: 1,
    player: null,
    hidePlayer: false,
    //直播海报
    showPosterModal: false,
    qrcodeUrl: null,
    posterUrl: null,
    isUserAuth: true,
    user: [],
    skuData: [],
    showShuWrap: false,
    skuActive: false,
    skuId: '',
    goodsStock: 0,  //商品库存
    groupId: '',
    isFollow: false,
    is_anchor: false,
    skuInd: '',
    skuName: '',
    skuValue: '',
    isSku: false,
    userCount: 1
  },

  loadData: function () {
    var that = this;
    wx.request({
      url: app.globalData.liveUrl + 'room/getliveroomurl',
      method: 'post',
      header: {
        token: wx.getStorageSync("token"),
        'Content-Type': 'application/x-www-form-urlencoded'
      }, 
      data: {
        streamId: that.data.live_id
      },
      success: function (res) {
        if (res.data.statusCode == '401') {
          wx.removeStorage({
            key: 'token',
            success: function (res) {
              that.login();
            },
          });
          return;
        }
        if (res.data.code == 1001) {
          that.setData({
            live_url: res.data.data.url,
            user: res.data.data.owner,
            groupId: res.data.data.group_id,
            isFollow: res.data.data.is_follow
          })
          // if (that.data.is_playback) {
          //   that.data.player = wx.createVideoContext('video-player');
          // } else {
            that.data.player = wx.createLivePlayerContext('live-player');
          // }
          //载入历史消息
          that.getMessages(res.data.data.group_id);
          loginIM({
            data: {
              roomID: res.data.data.group_id
            },
            success: function (ret) {
              // 创建房间成功之后操作
              console.log('loginInfo');
            },

            fail: function (ret) {
              wx.showToast({
                title: ret.errMsg,
                icon: 'none',
                duration: 5000
              })
            }
          });
          that.loadGoods();
        }
        wx.stopPullDownRefresh();
      },
      fail: function (res) {
        console.log(res.data);
      },
      complete: function () {
        that.setData({
          showAuthModal: false
        })
      }
    });
  },
  loadGoods: function() {
    var that = this;
    wx.request({
      url: app.globalData.liveUrl + 'goods/product-live',
      method: 'post',
      header: {
        token: wx.getStorageSync("token"),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        room_id: that.data.live_id
      },
      success: function (res) {
        if (res.data.code == 1001) {
          var goods = res.data.data.goods.map((val, key) => {
            var objs = {
              ...val,
              sku_list: false
            }
            return objs;
          })
          that.setData({
            goods
          });
        }
      },
      fail: function(res) {
        console.log('fail', res);
      }
    });
  },
  loadUserInfo: function() {
    wx.request({
      url: app.globalData.liveUrl + 'user/tim-login-info',
      method: 'post',
      header: {
        token: wx.getStorageSync("token"),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        accountInfo = res.data.data;
      },
      fail: function(res) {
        console.log('fail', res);
      }
    })
  },

  toShopcart: function() {
    wx.switchTab({
      url: '../../pages/shopcart/shopcart',
    });
  },

  //获取历史消息
  getMessages: function (group_id) {
    var that = this;
    wx.request({
      url: app.globalData.apiUrl + "live&act=messages",
      method: "GET",
      header: {
        "token": wx.getStorageSync("token")
      },
      data: { gId: group_id, lastId: '', firstId: '' },
      success: function (res) {
        if (res.data.data.length == 0) {
          return;
        }

        var tempMessages = [];
        for (var i = 0; i < res.data.data.length; i++) {
          var msg = webimhandler.stringToCustomMsg(res.data.data[i].text);
          tempMessages.push({ id: res.data.data[i].id, username: msg.name, content: msg.msg });
        }
        messages = tempMessages.concat(messages);
        that.setData({
          messages: tempMessages
        });
      }
    });
  },

  /**
   * 载入购物车数量
   */
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
  /**
   * 显示商品
   */
  showGoodsModal: function () {
    // 显示遮罩层
    // var animation = wx.createAnimation({
    //   duration: 100,
    //   timingFunction: "ease",
    //   delay: 0
    // })

    // animation.translateY(300).step();
    this.setData({
      // animationData: animation.export(),
      showGoodsModal: true
    });

    // setTimeout(function () {
    //   animation.translateY(0).step();
    //   this.setData({
    //     animationData: animation.export()
    //   })
    // }.bind(this), 100);
  },

  hideGoodsModal: function () {
    // 隐藏遮罩层
    // var animation = wx.createAnimation({
    //   duration: 200,
    //   timingFunction: "linear",
    //   delay: 0
    // });

    // animation.translateY(300).step();
    // this.setData({
    //   animationData: animation.export(),
    // });
    // setTimeout(function () {
    //   animation.translateY(0).step();
      this.setData({
        // animationData: animation.export(),
        showGoodsModal: false,
        showSkuWrap: false
      })
    // }.bind(this), 200);
    // this.loadShopcartCount();
  },

  showGoodsSku: function(e) {
    var skuId = e.currentTarget.dataset.goodsId;
    var goodsIndex = e.currentTarget.dataset.goodsIndex;
    var goods = this.data.goods;
    this.setData({
      skuData: [],
      skuValue: [],
      count: 1,
      skuId: '',
      skuInd: ''
    });
    var goods = goods.map((val, key) => {
      if (val.goods_id == skuId) {
        val = {
          ...val,
          sku_list: !val.sku_list
        };
        var skuList = val.attr_goods_info.specification;
        if (skuList.length ==0) {
          that.setData({
            isSku: false
          })
        } else {
          that.setData({
            isSku: true
          })
        }
        this.setData({
          skuData: val.attr_goods_info.specification
        })
        // 处理规格 ==> 定义一个数组，把所有的规格通过key，value的形式放在一起。
        var skuArrs = [];
        var datas = val.attr_goods_info.specification;
        if (datas && datas.length !== 0) {
          datas.map((val, key) => {
            var skuObjs = {};
            function fun() {
              skuObjs.name = val.name; 
              skuObjs.id = "";
              skuObjs.val = "";
              skuArrs.push(skuObjs);
            }
            fun();
            skuObj = skuObjs;
            skuArr = skuArrs;
          })
        }
      } else {
        val = {
          ...val,
          sku_list: false
        }
      }
      return val;
    });
    this.setData({
      goods
    });
  },

  selectSku: function(e) {
    // 选择规格的时候判断当前选择的name值是否与对象中定义的一样，如果一样，就把对应的id与value放进去。
    var that = this;
    var skuId = e.currentTarget.dataset.skuId;
    var skuName = e.currentTarget.dataset.skuName;
    var skuValue = e.currentTarget.dataset.skuValue;
    var skuIndex = e.currentTarget.dataset.skuIndex;
    var skuInd = e.currentTarget.dataset.skuInd;
    skuArr.map((value, key) => {
      for (let item in value) {
        if (value[item] == skuName) {
          value.id = skuId;
          value.val = skuValue;
        };
      }
    });
    var skuId = ''; // 下单或者添加购物车时需要的skuId。
    var skuValue = ''; // 查询所选规格的库存
    for (let i in skuArr) {
      skuId += skuArr[i].id + ',';
      skuValue += skuArr[i].val;
    }
    if (skuId.length > 0) {
      skuId = skuId.substr(0, skuId.length - 1);
    }
    skuVal = skuValue;
    this.setData({
      skuId,
      skuInd,
      skuValue: skuArr
    })

    // 根据所选的规格查询是否有库存
    var goods = this.data.goods.map((val, key) => {
      var skuStockList = val.attr_goods_info.attr_num;
      if (val.goods_id == skuIndex) {
        if (skuStockList.length != 0) {
          var skuStock = skuStockList[skuVal] == '' ? '0' : skuStockList[skuVal]
        }
        val = {
          ...val,
          goods_number: skuStock
        }
      }
      return val;
    })
    this.setData({
      goods
    });
    this.loadShopcartCount();
  },

  // 加入购物车
  addToShopcart: function(e) {
    var goodsId = e.currentTarget.dataset.goodsId;
    var skuIdArr = this.data.skuId.split(',');
    for (var i = 0; i < this.data.goods.length; i++ ) {
      if (this.data.goods[i].goods_id == goodsId) {
        var skuList = this.data.goods[i].attr_goods_info.specification;
        if (skuList.length !== 0) {
          for (var k = 0; k < skuIdArr.length; k++) {
            if (skuIdArr[k] == '') {
              wx.showToast({
                title: '请选择规格',
                icon: "none",
                duration: 1500
              });
              return;
            }
          }
        }
        if (!this.data.goods[i].goods_number) {
          wx.showToast({
            title: '该商品暂时没有存货',
            icon: "none",
            duration: 1500
          });
          return;
        }
      }
    }
    wx.showLoading({
      title: '加入中',
    })
    var token = wx.getStorageSync('token');
    wx.request({
      url: app.globalData.apiUrl + "shopcart/add&token=" + token,
      method: "POST",
      data: { pId: goodsId, sku: that.data.skuId, pQuantity: [that.data.count], pOptionTexts: skuVal },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '成功添加到购物车',
          });
        }
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

        that.hideGoodsModal();
        that.userAddShopcartCount();
      }
    })
  },

  // 记录用户在观看直播的过程中添加购物车的次数
  userAddShopcartCount: function() {
    wx.request({
      url: app.globalData.liveUrl + 'goods/live-product-add-car',
      method: 'post',
      data: {
        room_id: that.data.live_id,
        nick_name: that.data.user.user_name,
        group_id: that.data.groupId
      },
      success: function(res) {
      },
      fail: function() {
        console.log('userAddShopcartCount fail', res);
      }
    })
  },

  //记录用户在观看直播的过程中进入商品详情的次数
  userIntoDetailCount: function() {
    wx.request({
      url: app.globalData.liveUrl + 'goods/product-click-save',
      method: 'post',
      data: {
        room_id: that.data.live_id
      },
      success: function (res) {
      },
      fail: function () {
        console.log('userAddShopcartCount fail', res);
      }
    })
  },

  // 立即购买
  buyNow: function(e) {
    var goodsId = e.currentTarget.dataset.goodsId;
    var skuIdArr = this.data.skuId.split(',');
    for (var i = 0; i < this.data.goods.length; i++) {
      if (this.data.goods[i].goods_id == goodsId) {
        var skuList = this.data.goods[i].attr_goods_info.specification;
        if (skuList.length !== 0) {
          for (var k = 0; k < skuIdArr.length; k++) {
            if (skuIdArr[k] == '') {
              wx.showToast({
                title: '请选择规格',
                icon: "none",
                duration: 1500
              });
              return;
            }
          }
        }
        if (!this.data.goods[i].goods_number) {
          wx.showToast({
            title: '该商品暂时没有存货',
            icon: "none",
            duration: 1500
          });
          return;
        }
      }
    }
    wx.navigateTo({
      url: '../order/check?goods_id=' +
        goodsId +
        "&count=" + that.data.count +
        "&sku=" + skuIdArr + 
        "&roomId=" + this.data.live_id + 
        "&nickName=" + that.data.user.user_name +
        "&groupId=" + that.data.groupId,
      success: function (res) {
      }
    });
  },

  /**
   * 显示商品详情
   */
  showGoodsDetail: function (e) {
    var goods = this.data.goods.map((val, key) => {
      var objs = {
        ...val,
        sku_list: false
      }
      return objs;
    });
    that.setData({
      goods
    });
    this.userIntoDetailCount();
    wx.navigateTo({
      url: '../goods/details?id=' + e.currentTarget.dataset.id + "&title=" + e.currentTarget.dataset.title,
    })
  },
  
  // 关注
  userFollow: function() {
    wx.request({
      url: app.globalData.liveUrl + 'relationship/follow',
      method: 'post',
      header: {
        token: wx.getStorageSync("token"),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        f_user_id: that.data.user.owner_id
      },
      success: function (res) {
        if (res.data.code == 1001) {
          wx.showToast({
            title: res.data.data[0]
          });
          that.setData({
            isFollow: true
          });
        }
      },
      fail: function () {
        console.log('userAddShopcartCount fail', res);
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.data.live_id = options.id;
    this.setData({
      live_id: options.id
    })
    //处理扫描二维码打开时候带的参数
    var scene = decodeURIComponent(options.scene);
    var shopid = null;
    if (scene != "undefined") {
      if (scene.indexOf('-') != -1) {
        that.data.live_id = scene.split('-')[0];
        shopid = scene.split('-')[1];
        wx.setStorage({
          key: 'shopid',
          data: shopid
        });
      } else {
        that.data.live_id = scene;
      }
    }

    this.loadUserInfo();

    if (!wx.getStorageSync('phone')) {
      wx.navigateTo({
        url: '../register/register',
      })
      return;
    }
    this.loadShopcartCount();

    //设置ui
    that.setData({
      hideLiveChat: "",
      hideMessageBar: "hide"
    });
    messages = [];

    //{ username: "", content: "绿色直播，禁止低俗，引诱、暴露等一切黄赌毒内容，警察叔叔24小时巡查哦～" }
    wx.setNavigationBarTitle({
      title: options.title
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.loadData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    this.setData({
      hidePlayer: false
    });
    // this.loadData();
    if (this.data.player) {
      this.data.player.play();
    }
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.writePhotosAlbum']) {
          that.setData({
            showPhoto: false
          })
        }
      }
    })
    // 保持屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // if (this.player){
    //   this.player.stop();
    // }

    this.setData({
      hidePlayer: true
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    webimhandler.logout();
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
    return {
      title: this.data.title,
      path: '/pages/live/live?id=' + this.data.live_id,
      imageUrl: this.data.live.cover
    }
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
   * 生成直播分享海报
   */
  shareQrcode: function () {
    var that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          that.setData({
            showPhoto: true
          })
        }
      }
    })
    that.hideShareModal();
    that.setData({
      qrcodeUrl: app.globalData.apiUrl + "wechat/wxacode&id=" + that.data.live_id + "&page=pages/live/live",
      posterUrl: app.globalData.apiUrl + "live&act=poster&id=" + that.data.live_id + "&token=" + wx.getStorageSync("token"),
      showPosterModal: true,
      hidePlayer: true
    });

  },

  posterClose: function (e) {
    this.setData({
      hidePlayer: false
    });
  },
})