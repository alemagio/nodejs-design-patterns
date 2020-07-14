
function Logger (debug, info, warn, error) {
  this.debug = debug
  this.info = info
  this.warn = warn
  this.error = error
}

module.exports = {
  create: function () {
    const debug = process.env.NODE_ENV === 'development' ? console.log : () => {}
    return new Logger(debug, console.info, console.warn, console.error)
  }
}
