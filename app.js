App({
    globalData: {
      userInfo: null,
      hasUserInfo: false
    },

    onLaunch() {
      // 检查用户信息
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        this.globalData.userInfo = userInfo
        this.globalData.hasUserInfo = true
      }
    },

    // 全局退出方法
    logout() {
      // 只清除用户信息相关数据
      this.globalData.userInfo = null
      this.globalData.hasUserInfo = false
      
      // 只移除用户信息的存储
      wx.removeStorageSync('userInfo')
      
      // 不清除其他数据
      // wx.removeStorageSync('moodData')  // 注释掉，不清除心情数据
      // wx.clearStorageSync()  // 移除，不清除所有存储
    }
  })