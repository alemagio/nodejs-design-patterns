const TASKS = [ task1, task2, task3, task4, task5, task6 ]
const MAX_EXECUTION_TASKS = 2

function execute (tasks) {
  
  let completed = 0
  let running = 0
  let index = 0

  function run () {
    while (running < MAX_EXECUTION_TASKS && index < tasks.length) {
      tasks[index++]().then(() => {
        console.log(completed + 1)
        if (++completed === tasks.length) {
          return console.log('All tasks have been completed')
        }
        running--, completed++
        run()
      })
      running++
    }
  }

  return run()
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

function task4 () {
  return Promise.resolve()
    .then(() => console.log('task 4'))
}

function task5 () {
  return Promise.resolve()
    .then(() => console.log('task 5'))
}

function task6 () {
  return Promise.resolve()
    .then(() => console.log('task 6'))
}

execute(TASKS)
