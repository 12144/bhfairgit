// pages/mystore/mystore.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: []
  },
  //进入商品详细页
  enter: function (e) {
    var self = this
    var id = e.currentTarget.dataset.index
    var tableID = app.globalData.product_tableID

    wx.navigateTo({
      url: "/pages/item/item?id=" + self.data.items[id].id,
      success: function () {
        console.log('success')
      },
      fail: function () {
        console.log('fail')
      }
    })
  },
  //商品下架
  del_product: function (e) {
    var self = this
    var tableID = app.globalData.product_tableID
    var id = e.currentTarget.dataset.index

    wx.showModal({
      title: '',
      content: '确认下架？',
      success: function (res) {
        if (res.confirm) {//点击确认删除
          let tableobject = new wx.BaaS.TableObject(tableID)
          let recordID = self.data.items[id].id //表是商品列表所以id即为商品id

          tableobject.get(recordID).then(res=>{
            let photosid=res.data.photosid    //要删除的图片的id
            tableobject.delete(recordID).then(res => {
              let temp = self.data.items
              temp.splice(id, 1)
              self.setData({
                items: temp
              })
              wx.showToast({
                title: '下架成功',
                icon: 'success',
                duration: 2000
              })
              // 将图片删除
              let myfile = new wx.BaaS.File()
              myfile.delete(photosid)
            }, err => {
              wx.showToast({
                title: '下架失败',
                icon: 'none',
                duration: 2000
              })
            })
          })
          
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this     //查询id为使用者id的商品
    let seller_id = app.globalData.userInfo.id    //使用者id
    let tableID = app.globalData.product_tableID    //商品列表
    
    let tableobject = new wx.BaaS.TableObject(tableID)
    let query = new wx.BaaS.Query()

    query.compare('seller_id', '=', seller_id)    //查询条件

    tableobject.setQuery(query).orderBy('-updated_at').find().then(res => {
      //将数据存入data中
      var item_info = self.data.items
      for (var i = 0; i < res.data.objects.length; i++) {
        var temp = res.data.objects[i]
        var key = 'short_dsp'
        var value = String(temp.description).substring(0, 12)
        temp[key] = value
        item_info.push(temp)  //把商品加进数组
      }

      self.setData({
        items: item_info,
      })
    }, err => {
      console.log('查询失败', err)
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