# Introduction

To understand some of the concepts explained in this post you should know have a good knowledge of the event loop and how asynchronous programming works in Javascript, for brevity i will not cover these arguments in detail here so, if you want to a great explanation of how event loop works watch [this](https://www.youtube.com/watch?v=8aGhZQkoFbQ) video.


# The idea

Imagine we have a series of tasks (functions) we want to execute in a certain order:

```js
// index.js

function task1 () {
  console.log('task 1')
}

function task2 () {
  console.log('task 2')
}

function task3 () {
  console.log('task 3')
}

```

In our index file we have a function 'execute' which is responsible for the execution of all our tasks:

```js
// index.js

function execute () {
  task1()
  task2()
  task3()
}

execute()
```

Can you figure out what's the output in a shell?

```bash
$ node index.js

// output
task 1
task 2
task 3
```

Easy right?  
But what would happen with asynchronous tasks?  

```js
// index.js

function task1 () {
  setTimeout(() => {
    console.log('task 1')
  }, 3000)
}

function task2 () {
  setTimeout(() => {
    console.log('task 2')
  }, 2000)
}

function task3 () {
  setTimeout(() => {
    console.log('task 3')
  }, 1000)
}
```
  
In general we could need to wait for user input, wait for an API response, execute some database queries etc.  
We cannot know in advance how long these tasks take.  
In the example above the timeout simulates the time necessary for our operations to complete and, in our scenario, the output would be:

```bash
$ node index.js

// output
task 3
task 2
task 1
```

This, off course, is not what we want. We want the same output we had in the first example.  
We need to assure that our tasks are executed in the correct order even if the first one is the slowest.  
To achieve this goal a possible solution is to make each task responsible for the execution of the next one.  
This way when a task is completed it can call the next one:

```js
// index.js

function task1 () {
  setTimeout(() => {
    console.log('task 1')
    task2()
  }, 3000)
}

function task2 () {
  setTimeout(() => {
    console.log('task 2')
    task3()
  }, 2000)
}

function task3 () {
  setTimeout(() => {
    console.log('task 3')
  }, 1000)
}

function execute () {
  task1()
}

execute()

```

If we execute our program:

```bash
$ node index.js

// output
task 1
task 2
task 3
```

You can try to change the timers as you want and you will notice that the output will not change.  
Mission accomplished!  
Well not exactly.  
This pattern is very specific to this case, but, in general, we could have any number of tasks and we would like to be able to easily change the order of the tasks and maybe add a new task in a certain position without changing the body of the tasks.


# Sequential Iterator

The Sequential Iterator pattern solves exactly the problem explained before:

- we have a list of asynchronous tasks
- we want to execute our tasks in a certain order

Our task list will look like this:

```js
// index.js

const TASKS = [task1, task2, task3]

```

The Sequential Iterator pattern consists of a new recursive function we will put inside our 'execute' function:

```js
// index.js

function execute (tasks) {
  
  function iterate (index) {
    // tasks are finished
    if (index === tasks.length) {
      return
    }
  
    // set the current task
    const task = tasks[index]
  
    /* executes the current task passing the 'iterate' function as a callback, it will be called by the task itself */
    task(() => iterate(index + 1))
  }

  return iterate(0)

}

```

Now, the last thing to do is to make our tasks 'iterable':

```js

function task1 (callback) {
  setTimeout(() => {
    console.log('task 1')
    callback()
  }, 3000)
}

function task2 (callback) {
  setTimeout(() => {
    console.log('task 2')
    callback()
  }, 2000)
}

function task3 (callback) {
  setTimeout(() => {
    console.log('task 3')
    callback()
  }, 1000)
}

```

As you can see each task now takes a callback as parameter and, when it finishes, it executes that callback (our 'iterate' function passing it the next index).

Now we only need to invoke our 'execute' function passing 'TASKS' as argument and, as always, execute the 'index.js' script on a shell:

```bash

$ node index.js

// output
task 1
task 2
task 3

```

---
**Note**

This pattern is made for asynchronous functions and, even if it works with synchronous functions too, it might execute the 'iterate' function recursively a lot of times exceeding the call stack in that case. So, please, if you have synchronous tasks, consider using something more appropriate (like a for loop).

---

## Using Promises

In case our tasks would return a promise we can adjust our pattern to handle promises instead of callbacks.

Here is how our index file would be using promises:

```js
// index.js

const TASKS = [ task1, task2, task3 ]

function execute (tasks) {
  return tasks.reduce((prev, task) => prev.then(task), Promise.resolve())
}

function task1 () {
  return Promise.resolve()
    .then(() => console.log('task 1'))
}

function task2 () {
  return Promise.resolve()
    .then(() => console.log('task 2'))
}

function task3 () {
  return Promise.resolve()
    .then(() => console.log('task 3'))
}

execute(TASKS)

```

What is happening in the 'execute' function?  
Well, we are taking a starting point ('Promise.resolve()') and concatenating promises after that until we finish our tasks.  
I used the 'reduce' method but you could achieve the same goal by using a 'forEach'.  
The most important thing to notice in this case is that our tasks don't need a 'callback' parameter anymore. This is because, using promises, we don't need to invoke the next task inside the previous one, but we simply use the 'then' function to concatenate tasks (promises).

# Conclusion

In real world applications there are many cases where you have to create an elegant way to execute a sequence of tasks. Usually you start with one task, then, after some time, you need to add a second one... and a third and so on, until, finally, you are creating a pipeline. Here is where Sequential Iterator comes in.  
I don't like to refactor my code until I feel it is necessary, preemptive optimization is, in my opinion, a good way to create bad code.  
But, when you have more then 2 tasks you may consider refactoring your code using this pattern.  
A very common place where this pattern might be useful is when you create a development seed for your application (a simple command which gives you application a populated database for development).  
