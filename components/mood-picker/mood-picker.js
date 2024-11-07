Component({
    properties: {
      show: {
        type: Boolean,
        value: false
      }
    },
  
    data: {
      moods: [
        { emoji: '😊', name: '开心', value: 'happy' },
        { emoji: '🎉', name: '激动', value: 'excited' },
        { emoji: '❤️', name: '恋爱', value: 'love' },
        { emoji: '😐', name: '一般', value: 'normal' },
        { emoji: '😪', name: '疲惫', value: 'tired' },
        { emoji: '😢', name: '难过', value: 'sad' },
        { emoji: '😠', name: '生气', value: 'angry' },
        { emoji: '🤒', name: '生病', value: 'sick' },
        { emoji: '📚', name: '忙碌', value: 'busy' },
        { emoji: '😌', name: '放松', value: 'relax' }
      ]
    },
  
    methods: {
      onMoodSelect(e) {
        const { mood } = e.currentTarget.dataset;
        this.triggerEvent('select', mood);
      },
  
      onClose() {
        this.triggerEvent('close');
      },
  
      // 防止点击内容区域时关闭
      preventDefault() {
        return;
      }
    }
  });