const EventEmitter = require('events').EventEmitter

class MyService extends EventEmitter {
  init (arg) {
    this.emit('start')
  
    if(arg === 'error') {
      this.emit('error')
    }
  
    // more actions
  
    this.emit('end')
  }
}

module.exports = new MyService()
