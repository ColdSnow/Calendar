Component({
    properties: {
      show: {
        type: Boolean,
        value: false
      },
      mood: {
        type: Object,
        value: null
      },
      date: {
        type: Object,
        value: null
      },
      initialText: {
        type: String,
        value: ''
      }
    },
  
    data: {
      text: ''
    },
  
    observers: {
      'show': function(show) {
        if (show) {
          this.setData({ text: this.properties.initialText });
        }
      }
    },
  
    methods: {
      onInput(e) {
        this.setData({
          text: e.detail.value
        });
      },
  
      onSave() {
        const { text } = this.data;
        this.triggerEvent('save', { text });
      },
  
      onClose() {
        this.triggerEvent('close');
      },
  
      preventDefault() {
        return;
      }
    }
  });