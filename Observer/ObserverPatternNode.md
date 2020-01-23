# Before you start

This post is the first of a series of posts where we will explore some of the most used design patterns in Node.  
I am not a professional Node developer, I am doing this series to improve my knowledge of Node and, possibly, to understand a bit more how it works under the hood.  
This series is widely inspired by the book ['Node.js Design Patterns'](nodejsdesignpatterns.com) by Mario Casciaro and Luciano Mammino, so I strongly recommend you to read the book to dive deeper into all the patterns we will focus on. 

# The idea

Let's say we have a single service with a single method 'init'.  
This service can do a lot of things, but for this example we don't need to know what exactly.  
The only thing we need to know is that this service should print 3 things:
- the moment it starts
- if an error occurred (when we pass the string 'error' as argument in this example)
- the moment it ends

```js
// myService.js
class MyService {
  init (arg) {
    console.log('start')

    if (arg !== 'error') {
      console.log('error')
    }

    // more actions

    console.log('end')
  }
}

module.exports = new MyService()
```

a simple index file to try it:

```js
// index.js
const myService = require('./myService')

myService.init('hello')
```

To test our code we simply run this command in a shell:

```bash
$ node index.js 

// output
start
end
```

To make it a bit more configurable we can do something like this:

```js
// index.js
const myService = require('./myService')

myService.init(process.argv[2])
```

so the first argument passed to the command will be the parameter of the 'init' function: 

```bash
$ node index.js hello

// output
start
end
```

or, if we want to trigger an error

```bash
$ node index.js error 

// output
start
error
end
```

If your are debugging your service printing this 3 events might be useful, but in a real world application, probably, you could need to perform different kind of actions depending on the event.
You may need to notify another service when one or more of those events occur.  
So what we actually want is our service to simply be able to notify the 3 events:
- start
- error
- end

And we want to be able to react when these events occur all around our application.  
It would be great if we could do this without adding more complexity to our service off course.

# The Observer Pattern

The Observer pattern solves exactly this problem.  
It is composed by 2 parts:
- subject: an element capable of notifying when its state changes
- observers: some elements which can listen to the subject notifications

In Node to make an element 'observable' (our subject) we need it to extend the 'EventEmitter' class.
This way, our service, will get exactly the methods it needs:
- emit(eventName[, arg1, arg2, ...]): to emit an event named 'eventName' with some optional arguments
- on(eventName, callback): to listen to an event and react with a callback which will get event's arguments if any.

So, let's change our previous example to use the Observer pattern:

```js
// myService.js

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
```

```js
// index.js

const myService = require('./myService')

myService.on('start', () => console.log('start'))
myService.on('error', () => console.log('error'))
myService.on('end', () => console.log('end'))
```

Let's try it:

```bash
$ node index.js hello

// output
start
end
```

As you can see the output is the same as in the first example, but in the index file we could have pass any callback instead of just 'console.log' actions.  
Same for the error:

```bash
$ node index.js error 

// output
start
error
end
```

---
**Note**  
This is not the only way to implement Observer pattern in Node but it is, in my opinion, the more natural and a very clean one and it is the same used inside Node.

---
## About the error event 
EventEmitter class cannot just throw an Error because, if it occurs asynchronously, it would be lost in the event loop.
So the convention used by Node is to emit a special event named 'error' and to pass to the 'emit' function an instance of the 'Error' class as second argument.
Because of this we can change our index file like this:

```js
// index.js
const myService = require('./myService')

myService.on('start', () => console.log('start'))
myService.on('end', () => console.log('end'))

try {
  myService.init(process.argv[2])
} catch(err) {
  console.error('error')
}
```

```bash
$ node index.js error 

// output
start
error
```

The 'end' event wont happen because we are throwing the error so the execution is stopped.

# Conclusion

Observer pattern is, in my opinion, a good way to keep track of what is happening in your application. All you have to do is to look at when an event is emitted and who is listening for that event.Even a simple search on your IDE by event name will do the trick.
Javascript allows this pattern to be really clean and natural on both frontend and backend applications. In large codebase sometimes it's easier to keep track of events instead of method function calls. 
A lot of frameworks and libraries make large use of this pattern so it is probably one the most important one we need to know.
