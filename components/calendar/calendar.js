Component({
  properties: {
    currentYear: {
      type: Number,
      value: new Date().getFullYear()
    },
    currentMonth: {
      type: Number,
      value: new Date().getMonth() + 1
    },
    moodData: {
      type: Object,
      value: {}
    }
  },

  data: {
    weeks: ['日', '一', '二', '三', '四', '五', '六'],
    days: [],
    selectedDate: null
  },

  lifetimes: {
    attached() {
      this.generateCalendar();
    }
  },

  methods: {
    generateCalendar() {
      const { currentYear, currentMonth } = this.properties;
      const days = [];
      
      // 获取当月第一天
      const firstDay = new Date(currentYear, currentMonth - 1, 1);
      // 获取当月最后一天
      const lastDay = new Date(currentYear, currentMonth, 0);
      // 获取第一天是星期几
      const firstDayWeek = firstDay.getDay();
      
      // 补充上个月的日期
      for (let i = 0; i < firstDayWeek; i++) {
        const prevDate = new Date(firstDay);
        prevDate.setDate(prevDate.getDate() - (firstDayWeek - i));
        days.push({
          date: prevDate.getDate(),
          month: prevDate.getMonth() + 1,
          year: prevDate.getFullYear(),
          isCurrentMonth: false
        });
      }
      
      // 添加当月日期
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({
          date: i,
          month: currentMonth,
          year: currentYear,
          isCurrentMonth: true
        });
      }
      
      // 补充下个月的日期
      const remainingDays = 42 - days.length; // 保持6行
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          date: i,
          month: currentMonth + 1,
          year: currentYear,
          isCurrentMonth: false
        });
      }
      
      this.setData({ days });

      // 添加当月日期时添加心情数据
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const dateKey = `${currentYear}-${currentMonth}-${i}`;
        const moodInfo = this.properties.moodData[dateKey];
        
        days.push({
          date: i,
          month: currentMonth,
          year: currentYear,
          isCurrentMonth: true,
          mood: moodInfo ? moodInfo.emoji : null
        });
      }
    },

    onDayClick(e) {
      const { date, month, year } = e.currentTarget.dataset;
      if (month === this.properties.currentMonth) {
        this.triggerEvent('dayclick', { date, month, year });
      }
    }
  }
});