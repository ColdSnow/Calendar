const calendar = require('../../utils/lunar-calendar.js')
const app = getApp()

Page({
  data: {
    currentDate: '', // 格式：YYYY-MM-DD
    solarDate: '',
    lunarDate: '',
    festival: '',
    almanac: {
      suitable: '',
      avoid: ''
    },
    currentMood: '',
    memo: '',
    moodList: [
      { value: 'happy', label: '开心', icon: '😊' },
      { value: 'excited', label: '激动', icon: '🎉' },
      { value: 'love', label: '恋爱', icon: '❤️' },
      { value: 'normal', label: '一般', icon: '😐' },
      { value: 'tired', label: '疲惫', icon: '😪' },
      { value: 'difficult', label: '难过', icon: '😫' },
      { value: 'angry', label: '生气', icon: '😠' },
      { value: 'sick', label: '生病', icon: '😷' },
      { value: 'busy', label: '忙碌', icon: '📚' },
      { value: 'relax', label: '放松', icon: '😌' }
    ],
    isPickerTouched: false
  },

  onLoad(options) {
    // 获取当前日期
    const now = new Date()
    const dateStr = this.formatDate(now)
    this.setData({ currentDate: dateStr })
    
    // 初始化日期信息
    this.updateDateInfo(now)
  },

  // 格式化日期为 YYYY-MM-DD
  formatDate(date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 日期选择器改变事件
  onDateChange(e) {
    const dateStr = e.detail.value
    this.setData({ currentDate: dateStr })
    
    // 解析选择的日期
    const [year, month, day] = dateStr.split('-').map(Number)
    const selectedDate = new Date(year, month - 1, day)
    
    // 更新日期信息
    this.updateDateInfo(selectedDate)
    
    // 获取选中日期的心情和备忘
    this.getMoodAndMemo(dateStr)
  },

  // 更新日期相关信息
  updateDateInfo(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    const lunarInfo = calendar.solar2lunar(year, month, day)
    
    this.setData({
      solarDate: `${year}年${month}月${day}日`,
      lunarDate: `${lunarInfo.IMonthCn}${lunarInfo.IDayCn}`,
      festival: lunarInfo.festival || lunarInfo.lunarFestival || '',
      almanac: {
        suitable: `宜：${lunarInfo.suitable || '无'}`,
        avoid: `忌：${lunarInfo.avoid || '无'}`
      }
    })
  },

  getMoodAndMemo(dateStr) {
    const moodData = wx.getStorageSync('moodData') || {}
    const dayData = moodData[dateStr] || {}
    
    this.setData({
      currentMood: dayData.mood || '',
      memo: dayData.memo || ''
    })
  },

  saveMoodAndMemo() {
    const { currentDate, currentMood, memo } = this.data
    
    // 获取现有数据
    let moodData = wx.getStorageSync('moodData') || {}
    
    // 更新数据
    moodData[currentDate] = {
      mood: currentMood,
      memo: memo
    }
    
    // 保存到本地存储
    wx.setStorageSync('moodData', moodData)
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })
    
    // 触发全局事件，通知首页更新数据
    app.globalData.needRefresh = true
  },

  // 添加触摸开始事件
  onTouchStart() {
    this.setData({
      isPickerTouched: true
    })
  },

  // 添加触摸结束事件
  onTouchEnd() {
    this.setData({
      isPickerTouched: false
    })
  }
})