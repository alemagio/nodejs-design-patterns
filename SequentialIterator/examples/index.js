const TASKS = [ task1, task2, task3 ]

function execute (tasks) {
  
  function iterate (index) {
    if (index === tasks.length) {
      return
    }
  
    const task = tasks[index]
  
    task(() => iterate(index + 1))
  }

  return iterate(0)

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
  }, 2000)
}

function task3 (callback) {
  setTimeout(() => {
    console.log('task 3')
    callback()
  }, 1000)
}

execute(TASKS)
