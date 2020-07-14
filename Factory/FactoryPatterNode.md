# Introduction

So here we are for part 4 of our Node Design Patterns series.  
I took a little brake from the series to write another little article about file watchers and hot reload ([Implement your own hot-reload](https://dev.to/alemagio/implement-your-own-hot-reload-2435)).

But now, here I am to to try explaining another design pattern.
The pattern I'm talking about is the Factory Pattern. One the most common patterns in every language probably.

We have several examples of very famous libraries which make wide use of this pattern:

- JQuery, just writing ```$('#my_element_id')``` we are invoking a function called '$' which creates a JQuery object.
- Node itself uses Factory Pattern in its 'http' module, for example, when we use ```http.createServer()``` we are, in fact, creating a Server object.  

In this post I will focus more on the "why" instead of the "how" simply because I believe this pattern is pretty easy to understand and there are several implementations while the main thing to understand is, in my opinion, the reason why such pattern is so useful.


---
**Note**

This pattern is simple to implement and one of the more documented, so in this post I tried to focus more on the reason behind this pattern and when it is particularly useful instead of the implementation itself.

---


Let's start with the explanation.

# The idea

Imagine you want a logger for your application.  
For this example let's just use our good old friend the console's log.  

It is not uncommon to log something different basing on your current environment.  
For example if you are in `development` environment you might want to log some debug informations, but, in production, these informations might be useless or even dangerous for security reasons.  

So, to achieve this goal, what you can do something like this:  

```js
// index.js

// some code

if (process.env.NODE_ENV === 'development') {
  console.log('hello')
}

// other code
```

And yes, it works.  
While in `development` mode you'll see your detailed logs, in `production`, instead, you will not.  
So, where is the problem?  
Let me ask you something: **do you really want this `if` statements all around your code?**  
Probably you don't.  

So, how can we create a logger which behaves differently in `development` and `production` environments?  

First of all let's separate our logger from the rest of our code by simply creating a service for it:

```js
// logger.js

class Logger {
  constructor () {
    this.debug = console.log
    this.info = console.info
    this.warn = console.warn
    this.error = console.error
  }
}

module.exports = Logger
```

As you can see I created different type of logs, nothing too fancy, just wrapping the usual `console` functions.  
The important thing to understand is that probably you want to have all these log functions both in `development` and in `production`, except for the `debug` one.  

So, our application might look like this:

```js
// index.js
const Logger = require('./logger')

const logger = new Logger()

// some code

logger.info('Informations')

// some other code

if (err) {
  logger.error(err)
}

// more code

if (process.env.NODE_ENV === 'development') {
  logger.debug('debug')
}
```

Well nothing changed, we still have the same `if` statement we would like to get rid of.  

A possible way to handle this is to move the logic inside the logger itself:

```js
// logger.js

class Logger {
  constructor () {
    this.debug = process.env.NODE_ENV === 'development' ? console.log : () => {}
    this.info = console.info
    this.warn = console.warn
    this.error = console.error
  }
}

module.exports = Logger
```

This way in our application we don't need to add the `if` statement since it is already been made when the logger is created.  

The last line of `index.js` will look like this:

```js
// index.js
logger.debug('debug')
```

And we don't need to worry about the environment since that function will be an empty one in `production`.

Done right?  
No more `if` around our code, all the logic of the logger is centralized in the Logger itself.  
Well, in the constructor actually... is that ok?  

The constructor is a function that should initialize a new instance of a class, a new object basically.  
But, as good programmers, we know the [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle), so our constructor should just initialize a new object. Nothing else.  
Having that logic inside our constructor is a side effect, something that, in more complicated scenarios, might introduce bugs or behaviors hard to understand without looking at the implementation of the Logger.  

Our Logger service should not contain logic related to the application where it is used, it should only do its job: logging informations at different levels.

Logger's constructor should look like this:

```js
// logger.js

class Logger {
  constructor (debug, info, warn, error) {
    this.debug = debug
    this.info = info
    this.warn = warn
    this.error = error
  }
}

module.exports = Logger
```

This way the constructor is no more responsible for the behavior of any of the logger's methods, it just takes them as parameters and initializes a new Logger using them.

So, who should be responsible to define the `debug` function basing on the environment? The Factory function.  

# The Factory Pattern

The Factory Pattern just means that, when creating a new instance of an object, we won't use the constructor directly but we will use, instead, a `create` function.  
This way we can separate the structure of such object (defined in the constructor) and some logic which might depend on the environment or some other events.

Our `logger` service will look like this:

```js
// logger.js

function Logger () {
  this.debug = console.log
  this.info = console.info
  this.warn = console.warn
  this.error = console.error
}

module.exports = {
  create: function () {
    const debug = process.env.NODE_ENV === 'development' ? console.log : () => {}
    return new Logger(debug, console.info, console.warn, console.error)
  }
}
```

While in our index file we will have:

```js
// index.js

const LoggerFactory = require('./logger')

// process.env.NODE_ENV = 'production'
process.env.NODE_ENV = 'development'

const logger = LoggerFactory.create()

logger.debug('debug')
logger.info('info')
logger.warn('warn')
logger.error('error')
```

That's it!  

I told you the implementation was simple.  

But please just focus on some important things:

- the service does not export the constructor method, so the only way to create a new logger it by using the `create` function. This is important because you may have a third party library which does not expose a constructor method sometimes and using a Factory to wrap that dependency is a very clean way to locate the relationship between your code and the dependency, so, if one day you want to replace it, you only need to modify the Factory
- it is very simple and clean, if necessary, to modify the Factory function to create a Singleton of a service
- the structure of the `Logger` service is completely separated from its behavior in different environments

# Conclusion

The Factory Pattern is probably one the most common, I used it several times in my fulltime job and in my side projects in different languages.  
As I said in the Introduction it is simple to implement but the reasons why it is so important are a bit tricky to get.  
I think I did not realize the real meaning of this pattern since I read it in the book `Node Design Patterns`.  

I really hope you find this post useful and if you have any question don't hesitate to comment below or send me a DM.
