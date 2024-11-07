const calendar = {
  lunarInfo: [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557
  ],

  solarMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  
  Gan: ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"],
  Zhi: ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"],
  Animals: ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"],
  
  solarTerm: ["小寒", "大寒", "立春", "雨水", "惊蛰", "春分",
              "清明", "谷雨", "立夏", "小满", "芒种", "夏至",
              "小暑", "大暑", "立秋", "处暑", "白露", "秋分",
              "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"],
  
  nStr1: ["日", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
  nStr2: ["初", "十", "廿", "卅"],
  
  festivals: {
    '1-1': '春节',
    '1-15': '元宵节',
    '5-5': '端午节',
    '7-7': '七夕节',
    '8-15': '中秋节',
    '9-9': '重阳节',
    '12-8': '腊八节',
    '12-30': '除夕'
  },

  solarFestivals: {
    '1-1': '元旦',
    '2-14': '情人节',
    '3-8': '妇女节',
    '3-12': '植树节',
    '4-1': '愚人节',
    '5-1': '劳动节',
    '5-4': '青年节',
    '6-1': '儿童节',
    '7-1': '建党节',
    '8-1': '建军节',
    '9-10': '教师节',
    '10-1': '国庆节',
    '12-24': '平安夜',
    '12-25': '圣诞节'
  },

  /**
   * 返回农历日期
   */
  solar2lunar: function(year, month, day) {
    // 输入的月份减1处理
    month = parseInt(month) - 1;
    
    // 用于存储农历日期信息
    let lunar = {
      year: 0,
      month: 0,
      day: 0,
      isLeap: false,
      // 中文日期
      IMonthCn: '',
      IDayCn: '',
      // 节日信息
      festival: '',
      Term: ''
    };

    // 用于计算农历日期
    let temp = 0;
    let i;
    
    // 计算日期对应的农历年
    let offset = (Date.UTC(year, month, day) - Date.UTC(1900, 0, 31)) / 86400000;
    
    for(i = 1900; i < 2101 && offset > 0; i++) {
      temp = this.lYearDays(i);
      offset -= temp;
    }
    
    if(offset < 0) {
      offset += temp;
      i--;
    }
    
    lunar.year = i;
    
    // 计算农历月份和日期
    let isLeap = false;
    let leap = this.leapMonth(lunar.year);
    
    for(i = 1; i < 13 && offset > 0; i++) {
      if(leap > 0 && i === (leap + 1) && !isLeap) {
        --i;
        isLeap = true;
        temp = this.leapDays(lunar.year);
      } else {
        temp = this.monthDays(lunar.year, i);
      }
      
      if(isLeap && i === (leap + 1)) {
        isLeap = false;
      }
      
      offset -= temp;
    }
    
    if(offset === 0 && leap > 0 && i === leap + 1) {
      if(isLeap) {
        isLeap = false;
      } else {
        isLeap = true;
        --i;
      }
    }
    
    if(offset < 0) {
      offset += temp;
      --i;
    }
    
    lunar.month = i;
    lunar.day = offset + 1;
    lunar.isLeap = isLeap;
    
    // 生成中文日期
    lunar.IMonthCn = (lunar.isLeap ? "闰" : '') + this.toChinaMonth(lunar.month);
    lunar.IDayCn = this.toChinaDay(lunar.day);
    
    // 获取节日信息
    let festivalKey = `${lunar.month}-${lunar.day}`;
    lunar.festival = this.festivals[festivalKey] || '';
    
    // 获取节气信息
    let term = this.getTerm(year, month * 2 + 1);
    if(day === term) {
      lunar.Term = this.solarTerm[month * 2];
    }
    term = this.getTerm(year, month * 2 + 2);
    if(day === term) {
      lunar.Term = this.solarTerm[month * 2 + 1];
    }
    
    return lunar;
  },

  /**
   * 传入农历年份，获取该年总天数
   */
  lYearDays: function(year) {
    let i, sum = 348;
    for(i = 0x8000; i > 0x8; i >>= 1) {
      sum += (this.lunarInfo[year - 1900] & i) ? 1 : 0;
    }
    return sum + this.leapDays(year);
  },

  /**
   * 传入农历年份，获取闰月天数
   */
  leapDays: function(year) {
    if(this.leapMonth(year)) {
      return (this.lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
    }
    return 0;
  },

  /**
   * 传入农历年份，获取闰月月份，不存在返回0
   */
  leapMonth: function(year) {
    return this.lunarInfo[year - 1900] & 0xf;
  },

  /**
   * 传入农历年月，获取该月天数
   */
  monthDays: function(year, month) {
    return (this.lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29;
  },

  /**
   * 农历月份转中文
   */
  toChinaMonth: function(month) {
    if(month > 12 || month < 1) return -1;
    let s = this.nStr3[month - 1];
    s += "月";
    return s;
  },

  /**
   * 农历日期转中文
   */
  toChinaDay: function(day) {
    let s;
    switch(day) {
      case 10:
        s = '初十';
        break;
      case 20:
        s = '二十';
        break;
      case 30:
        s = '三十';
        break;
      default:
        s = this.nStr2[Math.floor(day / 10)];
        s += this.nStr1[day % 10];
    }
    return s;
  },

  /**
   * 获取某年某月第n个节气为几日
   */
  getTerm: function(year, n) {
    // 简化版，实际项目中建议使用更准确的节气计算方法
    return 0;
  },

  nStr3: ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
};

module.exports = calendar;