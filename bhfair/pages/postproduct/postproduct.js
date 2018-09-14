// pages/postproduct/postproduct.js
const app=getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    types:['衣服物品','电子设备','图书','食品','活动招募','其他'],
    campus:["学院路","沙河"],
    condition:[1,2,3,4,5,6,7,8,9,10],
    width: app.globalData.windowWidth - 140,
    starttime:null,
    endtime:null,
    imgs: [],
    item_title: "",
    item_ifbrg: false,
    item_amount: 1,
    item_cdt: 9,
    item_cps: "沙河",
    item_type: "选择分类",
    item_price:null,
    item_dsp:""
  },
  //设置title
  settitle: function (e) {
    this.setData({
      item_title: e.detail.value
    })
  },
  //设置文本
  settext:function(e){
    this.setData({
      item_dsp:e.detail.value
    })
  },
  //设置是否可刀
  setbrg: function (e) {
    this.setData({
      item_ifbrg: e.detail.value
    })
  },
  //设置数量
  setamount: function (e) {
    this.setData({
      item_amount: e.detail.value
    })
  },
  //设置成色
  setcdt:function(e){
    console.log(e.detail.value)
    this.setData({
      item_cdt:this.data.condition[e.detail.value]
    })
  },
  //设置校区
  setcps:function(e){
    console.log(e.detail.value)
    this.setData({
      item_cps:this.data.campus[e.detail.value]
    })
  },
  //设置分类
  settype:function(e){
    console.log(e.detail.value)
    this.setData({
      item_type:this.data.types[e.detail.value],
    })
  },
  //设置价格
  setprice: function (e) {
    this.setData({
      item_price: e.detail.value
    })
  },
  start:function(e){
    this.starttime=e.timeStamp
  },
  end:function(e){
    this.endtime=e.timeStamp
  },
  //预览图片
  preview:function(e){
    var self = this
    if(this.endtime-this.starttime<100){
      var id = e.target.id.split('_')[1] - '0'
      console.log()
      wx.previewImage({
        current: self.data.imgs[id],
        urls: self.data.imgs
      })
    }    
  },
  //删除图片
  del_img:function(e){
    var self=this
    wx.showModal({
      title: '',
      content: '确定删除图片？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确认');
          var id = e.target.id.split('_')[1] - '0'
          var imgs=self.data.imgs
          imgs.splice(id, 1)
          self.setData({
            imgs:imgs
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //显示列表
  showlist: function () {
    var self = this
    if (self.data.imgs.length == 9) {
      wx.showToast({
        title: '最多只能上传9张图片',
        icon: 'none',
        duration: 2000
      })
    }
    else {
      wx.chooseImage({
        count: 9, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          var tempFilePaths = res.tempFilePaths //本地图片列表
          var temp_imgs = self.data.imgs  //原来的图片
          for (var i = 0; i < tempFilePaths.length; i++)
            temp_imgs.push(tempFilePaths[i])  //加到图片列表中

          self.setData({ imgs: temp_imgs })
        }
      })
    }
  },
  //提交表单
  submit_handler:function(e){
    wx.showLoading({
      title: '正在提交...',
      mask:true
    })

    var tableID = app.globalData.product_tableID//表格id
    var myfile = new wx.BaaS.File()  //实例化一个对象
    var item = this.data

    var item_info = {
      pname: item.item_title,
      types: item.item_type,
      bargain: item.item_ifbrg,
      photos: [],
      photosid:[],  //图片的id用于删除图片
      condition: item.item_cdt,
      amount:parseInt(item.item_amount),
      description: item.item_dsp,
      seller_id: app.globalData.userInfo.id,
      campus: item.item_cps,
      price: Number(item.item_price),
      openid:app.globalData.userInfo.openid
    }

    for (var i = 0; i < item.imgs.length; i++) {
      let filepath = { filePath: item.imgs[i] } //图片本地地址
    
      myfile.upload(filepath).then(res => {
        item_info.photos.push(res.data.path)//获得图片的云地址
        item_info.photosid.push(res.data.file.id)
        if (item_info.photos.length == item.imgs.length) {
          var tableobject = new wx.BaaS.TableObject(tableID) //创建TableObject对象
          var record = tableobject.create()  //本地创建一条空记录
          record.set(item_info).save().then(res => {
            wx.hideLoading()
            wx.showToast({
              title: '成功提交',
              icon: 'success',
              duration: 2000,
              success:function(){
              setTimeout(function(){
                wx.hideToast()
                wx.navigateBack({
                  delta: 1
                })
              },1500)    
              }
            })
          }, err => {
            wx.hideLoading()
            wx.showToast({
              title: '提交失败',
              icon: 'none',
              duration: 2000
            })
          })
        }
      }, err => {
        console.log('fail', err)
      })
    }
  },
  //返回
  back:function(){
      wx.navigateBack({
      delta:1
    })
  },
  //检查信息是否完善
  check:function(e){
    var item=this.data
    var self=this
  
    if (item.item_title != "" && item.types.indexOf(item.item_type) != -1 && item.item_price &&item.imgs)
      self.submit_handler(e)
    else{
      wx.showModal({
        title: '',
        content: '请确认信息已完善',
        showCancel:false
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    let myuser = new wx.BaaS.User()
    let userid = app.globalData.userInfo.id
    myuser.get(userid).then(res => {
      //查询用户是否已设置收款码
      if (!res.data.code){
        wx.showModal({
          title: '',
          content: '您还未设置收款码，确认继续发布吗？',
          success:function(res){
            if(res.cancel){
              wx.navigateBack({
                delta: 1
              })
            }
          }
        })
      }
    })
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