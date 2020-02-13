# Introduction

So, we reached out part 3 of our journey through some Node design patterns. In the first two parts we focused on Observer Pattern (one of the most important design pattern not only in Node but in all Javascript applications) and Sequential Iterator (useful to handle some tasks we want to be sure are executed in a certain order).  
In this post we will analyze a new pattern which has some parts in common with Sequential Iterator but it is very important to understand the differences between the two.  
Again, as explained in part 2, I'll assume you have a good knowledge of Javascript and event loop in particular, if you don't feel comfortable with asynchronous code i suggested a good resource on part 2 of this series.

Finally, be ready to code, because in this post we will write a lot of code!

# The idea

In this case the idea is very similar to part 2, with only one difference: we want to execute some asynchronous tasks in parallel.  
Why should I execute tasks in parallel instead on sequentially?  
Well, the answer is pretty simple: performance.  
Imagine you have a certain number of tasks, 3 for example, and you want to execute them in any order.  
You might think to execute them one after the other... and you'll be right!  
Everything will be fine, but, if you want to move a little bit forward and try to make your code a bit more optimized you might consider executing those tasks at the same time, or at least make them start as soon as possible (I'll explain this later).

---
**Note**

Important! Tasks should be unrelated, which means that you won't have any control on which one will finish before the others. So, if you need to complete one or more tasks before the others please consider using another pattern.

---

You may find this code familiar:

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

In this example timers don't matter so feel free to change them as you like.  

So the idea is: we want to execute any number of tasks without a specific order and (why not?) being notified when all tasks are completed. 

Let's dive into the pattern!

# Parallel Execution

The Parallel Execution pattern doesn't execute tasks at the same time... yeah, i'm not crazy but let me explain what it means.  
What we will do, in fact, is simply execute each task like this:

```js
// index.js

function execute (tasks) {
  
  let completed = 0 

  for (let task of tasks) {
    task(() => {
      /*Only the last task will make this condition be true and so we will
       have notified when the last task finishes*/
      if (++completed === tasks.length) {
        console.log('All tasks have been completed')
      }
    })
  }

}
```

```bash

$ node index.js

// output
task 3
task 2
task 1
All tasks have been completed

```

In Node, or in general in Javascript, you don't have a way to execute at the same time multiple tasks.  
What you can do, instead, is you can execute the synchronous part of each task and "push" the asynchronous part of them to the event loop.  
To fully understand what is happening inside our code let's make a little change to our tasks:

```js
// index.js

function task1 () {
  console.log('sync task 1')
  
  setTimeout(() => {
    console.log('task 1')
  }, 3000)
}

function task2 () {
  console.log('sync task 2')
  
  setTimeout(() => {
    console.log('task 2')
  }, 2000)
}

function task3 () {
  console.log('sync task 3')

  setTimeout(() => {
    console.log('task 3')
  }, 1000)
}
```

Each task will now log its synchronous part separately:

```bash

$ node index.js

// output
sync task 1
sync task 2
sync task 3
task 3
task 2
task 1
All tasks have been completed

```

As you will notice the sync parts will be printed almost immediately while the async ones will appear after, respectively, 1, 2 or 3 seconds.
So here is a step by step explanation of what is happening:

- in the for loop we are executing each task one by one
- the sync part of each task is completed immediately like if you were doing this:
  
  ```js
  for (let i = 1; i <= tasks.length; i++) {
    console.log(`task ${i}`)
  }
  ```
- after executing the sync part the remaining part of a task still remains what's inside the setTimeout, which is the async part. This part cannot be execute immediately, because it is asynchronous. So it is sent in the event loop.
- after the established amount of time set in the setTimeout function each task will be put in a queue
- at every clock, the event loop will look into the queue and, if present, will find an instruction (our tasks) and execute it

---
**Note**

This is a really simple explanation of what is happening, but, again, it is not the purpose of this post to explain how the event loop works.

---

## Using Promises

Promises have a really useful function called 'Promise.all' we can use:

```js
// index.js

const TASKS = [ task1, task2, task3 ]

function execute (tasks) {
  return Promise.all(tasks.map((task) => task()))
    .then(() => console.log('All tasks have been completed'))
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

This function returns a promise which resolves if all the promises in the array parameter resolve.  

## Limited Parallel Execution

Imagine you have more than 3 tasks, like 100 or 1000.  
Now, consider this tasks being, for example, api calls.  
Using one of the previous algorithms might cause some troubles like being blocked by the api because making too many requests.  
Even without any kind of limit from the target api it is a good practice to limit the number of tasks you want to run at the same time.  
Here it comes an improved version of the Parallel Execution pattern called Limited Parallel Execution.  

Let's start with the callback version:

```js
//index.js

/* Here I added more tasks to make it clear in the output which one is being executed */
const TASKS = [ task1, task2, task3, task4, task5, task6 ]
const MAX_EXECUTION_TASKS = 2

function execute (tasks) {
  
  let completed = 0
  let running = 0
  let index = 0

  function run () {
    /* If it was the last one print the message */
    if (++completed === tasks.length) {
      console.log('All tasks have been completed')
    }
    while (running < MAX_EXECUTION_TASKS && index < tasks.length) {
      /* Execute tasks until you rich the limit on max running tasks */
      tasks[index++](() => {
        /* The task is completed */
        completed++, running--
        run()
      })
      running++
    }
  }

  run()
}
```

Basically what is happening is:

- the first time we execute the function we start task1 and task2 (running = 2, completed = 0, index = 1)
- as soon as one the tasks (for example task1) completes we go inside its callback (completed = 1, running = 1, index = 1) and run is executed again
- this time we are starting just task3 because running is equal to 1, so, after that, we will have: running = 2, completed = 1, index = 2

The execution will continue like this until it reaches the end of the last task (notice that we cannot be sure the last task to be completed is task6, changing timers will change the order of the output off course).

## Limited Parallel Execution Promise version

Promise version of this pattern, again, is similar to the callback one:

```js
//index.js

const TASKS = [ task1, task2, task3, task4, task5, task6 ]
const MAX_EXECUTION_TASKS = 2

function execute (tasks) {
  
  let completed = 0
  let running = 0
  let index = 0

  function run () {
    if (completed === tasks.length) {
      return console.log('All tasks have been completed')
    }
    while (running < MAX_EXECUTION_TASKS && index < tasks.length) {
      tasks[index++]().then(() => {
        running--, completed++
        run()
      })
      running++
    }
  }

  return run()
}
```

---
**Note**

This implementation is different from the one proposed in the book the series is inspired to. I preferred keeping the algorithm more similar to the callback one without introducing other services. 

---

Once again, using 'then' instead of callbacks will do the magic.

# Conclusion

Understanding how this pattern works is, in my opinion, a good way to clarify how asynchronous code works in Javascript and why is useful to have asynchronous code, why some instructions are not executed directly but, instead, their execution is demanded to the event loop.  
Try to change timers to get different results.  

