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
      tasks[index++](() => {
        completed++, running--
        run()
      })
      running++
    }
  }

  run()
}

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
  }, 3000)
}

function task3 (callback) {
  setTimeout(() => {
    console.log('task 3')
    callback()
  }, 3000)
}

function task4 (callback) {
  setTimeout(() => {
    console.log('task 4')
    callback()
  }, 3000)
}

function task5 (callback) {
  setTimeout(() => {
    console.log('task 5')
    callback()
  }, 3000)
}

function task6 (callback) {
  setTimeout(() => {
    console.log('task 6')
    callback()
  }, 3000)
}

execute(TASKS)
