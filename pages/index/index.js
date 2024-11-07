const calendar = require('../../utils/lunar-calendar.js');

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    dateList: [],
    moodData: {},
    selectedDate: null,
    selectedDateKey: '',
    selectedMood: '',
    currentMemo: '',
    showMoodPicker: false,
    moods: [
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
    ]
  },

  onLoad() {
    console.log('onLoad')
    this.checkUserInfo()
  },

  onShow() {
    console.log('onShow')
    this.loadMoodData()
    this.checkUserInfo()
  },

  checkUserInfo() {
    // 检查全局状态
    var app = getApp()
    if (!app.globalData.hasUserInfo) {
      // 清除页面数据
      this.setData({
        userInfo: null,
        hasUserInfo: false,
        dateList: [],
        moodData: {},
        holidays: {},
        lunarDates: {}
      })
      // 显示授权提示
      this.checkAuth()
    } else {
      // 有用户信息则加载数据
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      this.generateDateList()
    }
  },

  checkAuth() {
    var that = this
    wx.showModal({
      title: '温馨提示',
      content: '需要授权获取用户信息登录才能使用，如果拒绝授权，将无法使用本小程序',
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
        console.log('获取到的微信用户信息:', res.userInfo)
        var userInfo = res.userInfo
        // 立即更新页面显示
        that.setData({
          userInfo: userInfo,
          hasUserInfo: true
        })
        // 保存到全局数据
        getApp().globalData.userInfo = userInfo
        getApp().globalData.hasUserInfo = true
        // 保存到本地存储
        wx.setStorageSync('userInfo', userInfo)
        
        wx.showToast({
          title: '授权成功',
          icon: 'success',
          duration: 2000
        })
        
        // 加载日历数据
        that.generateDateList()
      },
      fail: function(err) {
        console.error('获取用户信息失败：', err)
        wx.showToast({
          title: '需要授权获取用户信息登录才能使用，如果拒绝授权，将无法使用本小程序',
          icon: 'none'
        })
        setTimeout(function() {
          that.checkAuth()
        }, 1500)
      }
    })
  },

  onDatePickerChange(e) {
    const value = e.detail.value;
    const [year, month] = value.split('-').map(Number);
    
    this.setData({
      year,
      month
    }, () => {
      this.generateDateList();
    });
  },

  generateDateList() {
    const { year, month } = this.data;
    const dateList = [];
    const moodData = this.data.moodData || {};
    
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // 上月日期
    const prevMonthDays = new Date(year, month - 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
      const date = prevMonthDays - firstDay + i + 1;
      const prevMonth = month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const actualMonth = prevMonth === 0 ? 12 : prevMonth;
      const formattedMonth = actualMonth.toString().padStart(2, '0');
      const formattedDate = date.toString().padStart(2, '0');
      const dateKey = `${prevYear}-${formattedMonth}-${formattedDate}`;
      
      dateList.push({
        date,
        month: actualMonth,
        year: prevYear,
        isCurrentMonth: false,
        isWeekend: (i % 7 === 0 || i % 7 === 6),
        dateKey
      });
    }
    
    // 当月日期
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const dayOfWeek = (firstDay + i - 1) % 7;
      const isToday = year === today.getFullYear() && 
                      month === (today.getMonth() + 1) && 
                      i === today.getDate();
      const formattedMonth = month.toString().padStart(2, '0');
      const formattedDate = i.toString().padStart(2, '0');
      const dateKey = `${year}-${formattedMonth}-${formattedDate}`;
      
      const dayMood = moodData[dateKey]?.mood || '';
      const moodIcon = this.data.moods.find(m => m.value === dayMood)?.icon || '';
      
      dateList.push({
        date: i,
        month,
        year,
        isCurrentMonth: true,
        isWeekend: (dayOfWeek === 0 || dayOfWeek === 6),
        isToday,
        dateKey,
        mood: dayMood,
        moodIcon: moodIcon
      });
    }
    
    // 下月日期
    const remainingDays = 42 - dateList.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonth = month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const actualMonth = nextMonth === 13 ? 1 : nextMonth;
      const formattedMonth = actualMonth.toString().padStart(2, '0');
      const formattedDate = i.toString().padStart(2, '0');
      const dateKey = `${nextYear}-${formattedMonth}-${formattedDate}`;
      
      dateList.push({
        date: i,
        month: actualMonth,
        year: nextYear,
        isCurrentMonth: false,
        isWeekend: ((firstDay + daysInMonth + i - 1) % 7 === 0 || 
                    (firstDay + daysInMonth + i - 1) % 7 === 6),
        dateKey
      });
    }

    this.setData({ dateList }, () => {
      this.loadLunarData();
      this.loadMoodData();
    });
  },

  loadLunarData() {
    const { dateList } = this.data;
    const lunarDates = {};
    const holidays = {};
    
    dateList.forEach(item => {
      const { year, month, date, dateKey } = item;
      const lunarInfo = calendar.solar2lunar(year, month, date);
      
      lunarDates[dateKey] = lunarInfo.IDayCn;
      
      if (lunarInfo.festival) {
        holidays[dateKey] = lunarInfo.festival;
      } else if (lunarInfo.Term) {
        holidays[dateKey] = lunarInfo.Term;
      }
    });
    
    this.setData({ 
      lunarDates,
      holidays
    });
  },

  loadMoodData() {
    const moodData = wx.getStorageSync('moodData') || {}
    this.setData({ moodData }, () => {
      // 重新生成日历以显示最新数据
      this.generateDateList()
    })
  },

  saveMoodData(date, mood, memo) {
    let moodData = wx.getStorageSync('moodData') || {}
    moodData[date] = {
      mood: mood,
      memo: memo
    }
    wx.setStorageSync('moodData', moodData)
    
    // 更新页面数据
    this.setData({ moodData }, () => {
      this.generateDateList()
    })
  },

  onDayClick(e) {
    const { year, month, date } = e.currentTarget.dataset
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    const dayData = this.data.moodData[dateKey] || {}

    this.setData({
      selectedDate: { year, month, date },
      selectedDateKey: dateKey,
      selectedMood: dayData.mood || '',
      currentMemo: dayData.memo || '',
      showMoodPicker: true
    })
  },

  onMoodSelect(e) {
    console.log('mood select event:', e.currentTarget.dataset);
    const mood = e.currentTarget.dataset.mood;
    if (!mood) {
      console.error('未获取到心情数据');
      return;
    }
    
    this.setData({
      selectedMood: mood
    });
  },

  onMemoInput(e) {
    this.setData({
      currentMemo: e.detail.value
    })
  },

  onSaveAll() {
    const { selectedDateKey, selectedMood, currentMemo } = this.data
    if (!selectedMood) {
      wx.showToast({
        title: '请选择心情',
        icon: 'none'
      })
      return
    }

    // 获取现有数据
    let moodData = wx.getStorageSync('moodData') || {}
    
    // 更新数据
    moodData[selectedDateKey] = {
      mood: selectedMood,
      memo: currentMemo,
      updateTime: new Date().getTime()
    }

    // 保存到本地存储
    wx.setStorageSync('moodData', moodData)

    // 更新页面数据并关闭弹窗
    this.setData({
      moodData: moodData,
      showMoodPicker: false,
      selectedMood: '',
      currentMemo: ''
    }, () => {
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
    })
  },

  onCloseMoodPicker() {
    this.setData({
      showMoodPicker: false,
      selectedMood: '',
      currentMemo: ''
    })
  },

  getWeekDayText(weekDay) {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekDays[weekDay];
  },

  onShow() {
    const app = getApp()
    if (app.globalData.needRefresh) {
      // 重新加载数据
      this.loadCalendarData() // 确保这个方法会重新加载心情数据
      app.globalData.needRefresh = false
    }
  },

  loadCalendarData() {
    // 获取当前展示的年月
    const { year, month } = this.data
    
    // 获取所有心情数据
    const moodData = wx.getStorageSync('moodData') || {}
    
    // 更新日历数据
    const days = this.generateDays(year, month)
    days.forEach(day => {
      if (day.date) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`
        const dayData = moodData[dateStr]
        if (dayData) {
          day.mood = dayData.mood
          day.memo = dayData.memo
        }
      }
    })
    
    this.setData({ days })
  },

  changeMonth(e) {
    // ... 现有的月份切换逻辑 ...
    
    // 切换月份后重新加载数据
    this.loadCalendarData()
  },

  // 切换到前一天
  switchToPreDay() {
    const { selectedYear, selectedMonth, selectedDay } = this.data
    const currentDate = new Date(selectedYear, selectedMonth - 1, selectedDay)
    currentDate.setDate(currentDate.getDate() - 1)
    
    this.updateSelectedDate(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      currentDate.getDate()
    )
  },

  // 切换到后一天
  switchToNextDay() {
    const { selectedYear, selectedMonth, selectedDay } = this.data
    const currentDate = new Date(selectedYear, selectedMonth - 1, selectedDay)
    currentDate.setDate(currentDate.getDate() + 1)
    
    this.updateSelectedDate(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      currentDate.getDate()
    )
  },

  // 更新选中日期并加载据
  updateSelectedDate(year, month, day) {
    // 格式化日期字符串
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    // 获取该日期的心情和备忘数据
    const moodData = wx.getStorageSync('moodData') || {}
    const dayData = moodData[dateStr] || {}
    
    this.setData({
      selectedYear: year,
      selectedMonth: month,
      selectedDay: day,
      currentMood: dayData.mood || '',
      memo: dayData.memo || ''
    })
  },

  // 修改原有的 showMemoModal 方法
  showMemoModal(e) {
    const { year, month, day } = e.currentTarget.dataset
    this.updateSelectedDate(year, month, day)
    this.setData({ showMemo: true })
  }
});