Page({
    data: {
      userInfo: null,
      hasUserInfo: false
    },
  
    onLoad() {
      this.checkUserInfo()
    },
  
    onShow() {
      this.checkUserInfo()
    },
  
    checkUserInfo() {
      var userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true
        })
      }
    },
  
    // 退出登录
    handleLogout() {
      var that = this
      wx.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: function(res) {
          if (res.confirm) {
            // 调用全局退出方法
            getApp().logout()
            
            // 更新当前页面状态
            that.setData({
              userInfo: null,
              hasUserInfo: false
            })

            // 显示提示
            wx.showToast({
              title: '已退出登录',
              icon: 'success',
              duration: 1500
            })

            // 延迟后重置并跳转
            setTimeout(function() {
              // 重置所有页面并跳转到首页
              wx.reLaunch({
                url: '/pages/index/index'
              })
            }, 1500)
          }
        }
      })
    },
  
    checkAuth() {
      var that = this
      wx.showModal({
        title: '温馨提示',
        content: '需要获取您的授权获取用户信息，如果拒绝授权，将无法使用本小程序',
        confirmText: '确定',
        success: function(res) {
          if (res.confirm) {
            that.getUserProfile()
          }
        }
      })
    },
  
    getUserProfile() {
      var that = this
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: function(res) {
          var userInfo = res.userInfo
          // 保存到全局数据
          getApp().globalData.userInfo = userInfo
          getApp().globalData.hasUserInfo = true
          // 保存到本地存储
          wx.setStorageSync('userInfo', userInfo)
          // 更新页面数据
          that.setData({
            userInfo: userInfo,
            hasUserInfo: true
          })
          wx.showToast({
            title: '授权成功',
            icon: 'success',
            duration: 2000
          })
        },
        fail: function(err) {
          console.error('获取用户信息失败：', err)
          wx.showToast({
            title: '需要授权才能使用',
            icon: 'none'
          })
          setTimeout(function() {
            that.checkAuth()
          }, 1500)
        }
      })
    }
  })