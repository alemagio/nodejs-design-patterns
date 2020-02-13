const TASKS = [ task1, task2, task3 ]

function execute (tasks) {
  
  let completed = 0 

  for (let task of tasks) {
    task(() => {
      if (++completed === tasks.length) {
        console.log('All tasks have been completed')
      }
    })
  }

}

function task1 (callback) {
  console.log('sync task 1')

  setTimeout(() => {
    console.log('task 1')
    callback()
  }, 3000)
}

function task2 (callback) {
  console.log('sync task 2')

  setTimeout(() => {
    console.log('task 2')
    callback()
  }, 2000)
}

function task3 (callback) {
  console.log('sync task 3')

  setTimeout(() => {
    console.log('task 3')
    callback()
  }, 1000)
}

execute(TASKS)
