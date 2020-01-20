const myService = require('./myService')

myService.on('start', () => console.log('start'))
myService.on('end', () => console.log('end'))

try {
  myService.init(process.argv[2])
} catch(err) {
  console.error('error')
}
