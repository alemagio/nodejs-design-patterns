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
