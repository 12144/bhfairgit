// pages/item/item.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    name: "", //商品的类别
    hidden: true,//回复的弹出框
    reply_template_id: "F0phicxYskBb7z2AzCEUc6OtVquG1ddfDFKgPWjetks",
    message_template_id: "ecDKL9Mvd0oZfq5R47wYS4OWNlwsknoSp6YTpyR6R_w",
    codersrc:null,
    form_id:null,
    return_message:"",
    user_info_id:null,
    item_info: {
      id: '',
      title: "",  //商品标题
      sort:"",    //商品类型
      price: 0,  //商品价格
      bargain:'',//是否可刀
      condition:1,//商品成色
      images: [],   //商品图片
      amount: 1, //商品数量
      description:"",//商品描述
      salerid: "",  //商品卖者
      campus:"",//校区
      openid:"",//卖家的openid
      created_by:0,
    },//商品信息
    message:[{
      id: 0,
      nick_name:"",
      content:"",
      created_at:0,
      created_by:0,
      avatar:"",
      nick_name:"",
      user_type:"",
      receiver:0,
      rec_nickname:"",
    }],
    input:"",
    receiver:0,
    rec_nickname:"",
  },
  like: function (e) {
    var self = this.data
    if (!app.globalData.hasuserinfo) {//如果用户没登录
      this.authorize(e)
    }
    else {
      wx.showModal({
        title: '',
        content: '添加收藏',
        success: function (res) {
          if (res.confirm) {
            let tableID = app.globalData.store_tableID //表
            let tableobject = new wx.BaaS.TableObject(tableID)

            //先查询是否已收藏
            let query = new wx.BaaS.Query()
            query.compare('storeby', '=', app.globalData.userInfo.openid)
            query.compare('product_id', '=', self.item_info.id)

            tableobject.setQuery(query).find().then(res => {
              if (res.data.objects.length == 0) {     //如果查询结果为空，则收藏
                let record = tableobject.create()

                var data = {
                  product_id: self.item_info.id,
                  pname: self.item_info.title,
                  types: self.item_info.sort,
                  bargain: self.item_info.bargain,
                  photos: self.item_info.images,
                  amount: self.item_info.amount,
                  description: self.item_info.description,
                  seller_id: self.item_info.salerid,
                  campus: self.item_info.campus,
                  price: self.item_info.price,
                  condition: self.item_info.condition,
                  openid: self.item_info.openid,
                  storeby: app.globalData.userInfo.openid
                }
                //更新表
                record.set(data).save().then(res => {
                  wx.showToast({
                    title: '收藏成功',
                    icon: 'success',
                    duration: 2000
                  })
                }, err => {
                  wx.showToast({
                    title: '收藏失败',
                    icon: 'none',
                    duration: 2000
                  })
                })
              }
              else {
                wx.showToast({
                  title: '您已收藏',
                  icon: 'none',
                  duration: 2000
                })
              }
            })
          }
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this
    if(app.globalData.hasuserinfo){ //如果已登录
      self.setData({
        user_info_id: app.globalData.userInfo.id  //当前用户的id
      })
    }
    
    let tableid = app.globalData.product_tableID  //商品表ID
    let Product = new wx.BaaS.TableObject(tableid)
    Product.get(options.id).then(res => {
        var itemdata = res.data;
          this.setData({
            item_info:{
              id: itemdata.id,
              title: itemdata.pname,
              sort: itemdata.types,
              price: itemdata.price,
              bargain: itemdata.bargain == 1 ? "是" : "否",
              condition: itemdata.condition,
              images: itemdata.photos,
              amount: itemdata.amount,
              description: itemdata.description,
              salerid: itemdata.seller_id,
              campus: itemdata.campus,
              created_by: itemdata.created_by,
              openid:itemdata.openid
            }
          })
        this.getcodesrc(res.data.seller_id)
      },err =>{
        wx.showToast({
          title: '此商品可能已下架',
          icon:'none',
          duration:2000,
        })
        console.log("fail to get product infomation")
        setTimeout(function(){wx.navigateBack({delta: 1})},2000)
      })//获取商品信息

      let tableID = app.globalData.comment_tableID  //评论表格的id
      let query = new wx.BaaS.Query()
      query.compare('product_id', '=',options.id)
      let messages = new wx.BaaS.TableObject(tableID)
      messages.setQuery(query).find().then(data=>{
        for (var i = 0; i < data.data.objects.length;i++){
          data.data.objects[i].created_at = this.todata(data.data.objects[i].created_at)
        }
        this.setData({
          message:data.data.objects,
        })
      });//获取留言
  },
  //设置formid
  formSubmit: function (e) {
    if (app.globalData.userInfo.openid != "" && e.detail.formId !="the formId is a mock one"){ 
      console.log('form发生了submit事件，携带数据为：', e.detail.formId)
      this.setData({
        form_id: e.detail.formId,
      })
      let tableID = 50899
      let Product = new wx.BaaS.TableObject(tableID)
      let product = Product.create()

      // 设置formId
      let data = {
        formId: this.data.form_id,
        openid:app.globalData.userInfo.openid
      }
      console.log("上传数据为:",data)
      product.set(data).save().then(res => {
        // success
        console.log("上传formid成功:", data, "and", res)
      }, err => {
        // err
        console.log("failure:", data, "and", err)
      })
    }
  },

  //预览大图函数
  preview:function(e){
    var self = this;
    wx.previewImage({
      current:e.target.id,
      urls: self.data.item_info.images,
    })
  },

  //回复留言
  reply:function(e){
    if (app.globalData.hasuserinfo == false) {
      console.log("未授权")
      this.authorize(e)
    }
    else{
      this.setData({
        hidden: !this.data.hidden,
        receiver:e.target.dataset.message.created_by,
        rec_nickname: e.target.dataset.message.nick_name,
      })
      console.log("已授权");
      }
  },
  //更新回复留言内容
  return_message: function(e){
      this.setData({
        return_message:e.detail.value,
      })
  },
  //取消回复留言
  cancel: function () {
    this.setData({
      hidden: true,
      receiver: 0,
      rec_nickname: "",
      return_message:"",
    });
  },
  //获取收款码
  getcodesrc: function (userID) {
    let self = this
    let myuser = new wx.BaaS.User()
    myuser.get(userID).then(res => {
      if (res.data.code){
        self.setData({
          codesrc: res.data.code
        })
      }
      else{
        self.setData({
          codesrc: "/images/nocode.jpg"
        })
      }
    }, err => {
      console.log('查询收款码失败', err)
    })
  },
  //显示二维码
  showcode: function () {
    this.setData({
      showcode: true
    })
  },
  hidecode: function () {
    this.setData({
      showcode: false
    })
  },
  //将图片保存至本地
  saveimage: function () {
    var self = this
    wx.showModal({
      title: '',
      content: '确认保存到本地相册？',
      success: function (res) {
        if (res.confirm) {
          wx.downloadFile({
            url: self.data.codesrc,
            success: function (res) {
              let path = res.tempFilePath
              wx.saveImageToPhotosAlbum({
                filePath: path,
                success: function () {
                  wx.showToast({
                    title: '已成功保存至本地',
                    icon: 'success',
                    duration: 2000
                  })
                }
              })
            }
          })
        }
      }
    })
  },

  //确认回复留言
  confirm: function () {
    this.setData({
      hidden: true,
    })
    if(this.data.return_message==''){
      this.setData({
        receiver: 0,
        rec_nickname: "",
      })
      wx.showToast({
        title: '回复内容不能为空',
        icon:'none',
        duration: 2000,
      })
    }
    else{
      wx.showLoading({
        title: '处理中...',
        mask: true,
      })
      //修改本地数据并且上传
      var temp_message = this.data.message
      var temp = {
        created_at: this.todata(this.getdate()),
        product_id: this.data.item_info.id,
        content: this.data.return_message,
        user_type: this.data.item_info.salerid == app.globalData.userInfo.id ? "卖家" : "普通用户",
        avatar: app.globalData.userInfo.avatarUrl,
        nick_name: app.globalData.userInfo.nickName,
        receiver: this.data.receiver,
        openid: app.globalData.userInfo.openid,
        rec_nickname: this.data.rec_nickname,
        created_by: app.globalData.userInfo.id,
        id: 0,
      }

      let tableID = 50161;
      let MyTableObject = new wx.BaaS.TableObject(tableID);
      let MyRecord = MyTableObject.create();

      MyRecord.set(temp).save().then(res => {
        temp.id = res.data.id
        temp_message.push(temp)
       
        wx.hideLoading()
        wx.showToast({
          title: '回复成功',
          icon: 'success',
          duration: 2000
        })

        //如果用户回复自己则不推送
        if(app.globalData.userInfo.id!=this.data.receiver){
          wx.BaaS.invokeFunction('sendmsg', {
            id: this.data.receiver,   //接收者id
            product_id: this.data.item_info.id,
            template_id: this.data.reply_template_id,
            content: this.data.message[this.data.message.length - 1].content,
            nick_name: this.data.message[this.data.message.length - 1].nick_name
          }).then(res => {console.log('推送结果',res,)})
        }
        
        this.setData({
          message: temp_message,
          return_message: "",
          rec_nickname: "",
          receiver: 0,
        })
      });
    }
  },
  //更新本地输入
  setmessage: function (e) {
    this.setData({
      input: e.detail.value
    })
  },

  //传入时间戳，返回日期,形如:2018-9-5
  todata: function toDate(number) {
    var n = number * 1000;
    var date = new Date(n);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    return(Y + M + D)
  },
  //获取当前时间戳
  getdate: function (){
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    return timestamp
  },

  //上传留言
  upload_message: function(e){
    //判断是否符合上传条件
    if (this.data.input.length > 0 && this.data.input.length <= 140  && app.globalData.hasuserinfo == true){
      wx.showLoading({
        title: '处理中...',
        mask: true,
      })
      //修改本地数据并且上传
      let tableID = 50161;
      let MyTableObject = new wx.BaaS.TableObject(tableID);
      let MyRecord = MyTableObject.create();
      var temp_message = this.data.message
      var temp = {
        created_at: this.todata(this.getdate()),
        product_id: this.data.item_info.id,
        content: this.data.input,
        user_type: this.data.item_info.salerid == app.globalData.userInfo.id ? "卖家" : "普通用户",
        avatar: app.globalData.userInfo.avatarUrl,
        nick_name: app.globalData.userInfo.nickName,
        receiver: 0,
        rec_nickname: "",
        openid: app.globalData.userInfo.openid,
        created_by: app.globalData.userInfo.id,
        id: 0,
      }
  
      MyRecord.set(temp).save().then(res => {
        temp.id = res.data.id
        temp_message.push(temp)
        this.setData({
          'this.data.message': temp_message,
          input: "",
        })

        wx.hideLoading()
        wx.showToast({
          title: '留言成功',
          icon: 'success',
          duration: 2000
        })

        //这里发送消息推送,如果是卖家留言则不推送
        if(app.globalData.userInfo.id!=this.data.item_info.created_by){
          wx.BaaS.invokeFunction('sendmsg', {
            id: this.data.item_info.created_by,
            product_id: this.data.item_info.id,
            template_id: this.data.message_template_id,
            content: this.data.message[this.data.message.length - 1].content,
            nick_name: this.data.message[this.data.message.length - 1].nick_name
          }).then(res => {console.log('推送结果', res)})
        }
      });   
    }
    else if (app.globalData.hasuserinfo == false){
      this.authorize(e) //进入授权函数
    }
    else if (this.data.input.length ==0){
      wx.showToast({
        title: '留言内容不能为空',
        icon: 'none',
        duration: 2000
      })
    }
    else{
      console.log("请输入少于140字内容")
      wx.showToast({
        title: '请输入少于140字内容',
        icon: 'none',
        duration: 2000
      })
    }
  },

  //删除留言
  del_message: function(info){
    var self = this
    wx.showModal({
      title: '',
      content: '确认删除？',
      success: function (res) {
        if (res.confirm) {
          var index = info.target.dataset.index
          var message_id = self.data.message[index].id;
          var message = self.data.message 

          message.splice(index, 1)
          self.setData({
            message:message
          })
          //删除本地数据

          let tableID = 50161
          let MyTableObject = new wx.BaaS.TableObject(tableID)
          MyTableObject.delete(message_id).then(res => {
            console.log("delete successful")
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 1500
            })
          },err => {
            console.log("fail to delete!")
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
   
  },
  //用户授权登陆
  authorize: function (e) {
    var self = this;
    if (!app.globalData.hasuserinfo) {//如果用户没登录
      wx.showModal({
        title: '',
        content: '是否授权登录？',
        success: function (res) {
          if (res.confirm) {
            self.userInfoHandler(e)
          } else if (res.cancel) {
            wx.showToast({
              title: '请授权登录后重试',
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    }
  },

  //获取用户信息
  userInfoHandler: function (e) {
    var self = this
    console.log("获取用户数据中")
    wx.BaaS.handleUserInfo(e).then(res => {
      // res 包含用户完整信息，详见下方描述
      app.globalData.userInfo = {
        id: res.id,
        openid: res.openid,
        unionid: res.unionid,
        city: res.city,
        country: res.country,
        gender: res.gender,
        language: res.language,
        nickName: res.nickName,
        province: res.provincvince,
        avatarUrl: res.avatarUrl,
        created_by: res.id,
      }
      self.setData({
        user_info_id: res.id //当前用户id
      })
      app.globalData.hasuserinfo = true
    }, res => {
      console.log("fail to get user information");
    })
  },
  contact_seller:function(e){
    wx.showToast({
      title: '正在开发中，敬请期待',
      icon:'none'
    })
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