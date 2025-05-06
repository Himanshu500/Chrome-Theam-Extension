// Task management widget
class TaskManager {
  constructor() {
    this.tasksList = document.getElementById('tasks-list');
    this.newTaskInput = document.getElementById('new-task');
    this.addTaskButton = document.getElementById('add-task-btn');
    this.tasks = [];
    
    this.init();
  }
  
  init() {
    // Load tasks from storage
    this.loadTasks();
    
    // Add event listeners
    this.addTaskButton.addEventListener('click', () => this.addNewTask());
    this.newTaskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addNewTask();
      }
    });
    
    // Delegate event for task checkboxes and delete buttons
    this.tasksList.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        this.toggleTaskCompletion(e.target);
      }
    });
    
    this.tasksList.addEventListener('click', (e) => {
      // Check if the clicked element or its parent is the delete button
      const deleteButton = e.target.closest('.task-delete');
      if (deleteButton) {
        const taskItem = deleteButton.closest('.task-item');
        if (taskItem && taskItem.dataset.id) {
          this.deleteTask(taskItem.dataset.id);
        }
      }
    });
  }
  
  loadTasks() {
    chrome.storage.sync.get(['tasks'], (result) => {
      if (result.tasks && Array.isArray(result.tasks)) {
        this.tasks = result.tasks;
      } else {
        // Initialize with a sample task if no tasks exist
        this.tasks = [
          {
            id: 'task-' + Date.now(),
            text: 'Initialize task list',
            completed: false,
            createdAt: new Date().toISOString()
          }
        ];
        this.saveTasks();
      }
      
      // Render tasks
      this.renderTasks();
    });
  }
  
  saveTasks() {
    chrome.storage.sync.set({ tasks: this.tasks });
  }
  
  renderTasks() {
    // Clear existing tasks
    this.tasksList.innerHTML = '';
    
    // Sort tasks: uncompleted first, then by creation date
    const sortedTasks = [...this.tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // Create task elements
    sortedTasks.forEach(task => {
      const taskItem = document.createElement('li');
      taskItem.className = 'task-item';
      taskItem.dataset.id = task.id;
      
      // Create checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = task.id;
      checkbox.checked = task.completed;
      
      // Create label
      const label = document.createElement('label');
      label.htmlFor = task.id;
      label.textContent = task.text;
      
      // Create delete button
      const deleteButton = document.createElement('span');
      deleteButton.className = 'task-delete';
      deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      
      // Append elements
      taskItem.appendChild(checkbox);
      taskItem.appendChild(label);
      taskItem.appendChild(deleteButton);
      
      // Add to list
      this.tasksList.appendChild(taskItem);
      
      // Add entrance animation
      setTimeout(() => {
        taskItem.style.opacity = '1';
        taskItem.style.transform = 'translateY(0)';
      }, 10);
    });
    
    // Add CSS for fade-in animation
    const style = document.createElement('style');
    style.textContent = `
      .task-item {
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      
      .task-delete {
        cursor: pointer;
        color: var(--text-secondary);
        margin-left: auto;
        opacity: 0.5;
        transition: all 0.2s ease;
      }
      
      .task-delete:hover {
        color: var(--danger-color);
        opacity: 1;
        transform: scale(1.2);
      }
    `;
    
    // Add style to document if not already added
    if (!document.querySelector('style[data-for="tasks"]')) {
      style.dataset.for = 'tasks';
      document.head.appendChild(style);
    }
  }
  
  addNewTask() {
    const taskText = this.newTaskInput.value.trim();
    
    if (taskText) {
      // Create new task object
      const newTask = {
        id: 'task-' + Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
      };
      
      // Add to tasks array
      this.tasks.unshift(newTask);
      
      // Save and render
      this.saveTasks();
      this.renderTasks();
      
      // Clear input
      this.newTaskInput.value = '';
      this.newTaskInput.focus();
    }
  }
  
  toggleTaskCompletion(checkbox) {
    // Find task in array
    const taskId = checkbox.id;
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
      // Update task completion status
      this.tasks[taskIndex].completed = checkbox.checked;
      
      // Save and render
      this.saveTasks();
      
      // Animate the label
      const label = checkbox.nextElementSibling;
      if (checkbox.checked) {
        label.style.transition = 'all 0.3s ease';
        label.style.textDecoration = 'line-through';
        label.style.color = 'rgba(87, 199, 204, 0.6)';
      } else {
        label.style.transition = 'all 0.3s ease';
        label.style.textDecoration = 'none';
        label.style.color = '';
      }
      
      // Re-render after animation for proper sorting
      setTimeout(() => this.renderTasks(), 500);
    }
  }
  
  deleteTask(taskId) {
    // Find task item element
    const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
    
    if (taskItem) {
      // Add exit animation
      taskItem.style.opacity = '0';
      taskItem.style.transform = 'translateY(-10px)';
      
      // Remove from DOM and array after animation
      setTimeout(() => {
        // Remove from array
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        
        // Save and render
        this.saveTasks();
        this.renderTasks();
      }, 300);
    }
  }
  
  // Clear completed tasks
  clearCompletedTasks() {
    // Filter out completed tasks
    this.tasks = this.tasks.filter(task => !task.completed);
    
    // Save and render
    this.saveTasks();
    this.renderTasks();
  }
}

// Initialize task manager on page load
window.addEventListener('DOMContentLoaded', () => {
  window.taskManager = new TaskManager();
}); 