import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "list"]

  connect() {
    this.loadTodos()
    this.isSubmitting = false  // 중복 실행 방지 플래그
    this.lastSubmittedText = ""  // 마지막 제출된 텍스트
    this.lastSubmitTime = 0  // 마지막 제출 시간
  }

  async loadTodos() {
    try {
      const response = await fetch('/api/todos')
      this.todos = await response.json()
      this.render()
    } catch (error) {
      console.error('Failed to load todos:', error)
      this.todos = []
    }
  }

  async add() {
    const todoText = this.inputTarget.value.trim()
    if (todoText === "") return

    // 중복 실행 방지 - 다중 조건 체크
    const now = Date.now()
    if (this.isSubmitting || 
        (todoText === this.lastSubmittedText && now - this.lastSubmitTime < 2000)) {
      console.log('중복 제출 방지됨')
      return
    }
    
    this.isSubmitting = true  // 플래그 설정
    this.lastSubmittedText = todoText  // 마지막 텍스트 저장
    this.lastSubmitTime = now  // 마지막 제출 시간 저장

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({
          todo: {
            title: todoText,
            completed: false
          }
        })
      })

      if (response.ok) {
        const newTodo = await response.json()
        this.todos.unshift(newTodo)
        this.inputTarget.value = ""
        this.lastSubmittedText = ""  // 성공 시 마지막 텍스트 초기화
        this.render()
        this.updateStats()
      } else {
        const error = await response.json()
        console.error('Failed to create todo:', error)
      }
    } catch (error) {
      console.error('Network error:', error)
    } finally {
      // 1초 후 플래그 해제 (더 긴 디바운싱)
      setTimeout(() => {
        this.isSubmitting = false
      }, 1000)
    }
  }

  async toggle(event) {
    const todoId = parseInt(event.target.dataset.todoId)
    const todo = this.todos.find(t => t.id === todoId)
    if (!todo) return

    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({
          todo: {
            completed: !todo.completed
          }
        })
      })

      if (response.ok) {
        const updatedTodo = await response.json()
        const index = this.todos.findIndex(t => t.id === todoId)
        this.todos[index] = updatedTodo
        this.render()
        this.updateStats()
      } else {
        console.error('Failed to update todo')
      }
    } catch (error) {
      console.error('Network error:', error)
    }
  }

  async remove(event) {
    const todoId = parseInt(event.target.dataset.todoId)
    
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
      })

      if (response.ok) {
        this.todos = this.todos.filter(t => t.id !== todoId)
        this.render()
        this.updateStats()
      } else {
        console.error('Failed to delete todo')
      }
    } catch (error) {
      console.error('Network error:', error)
    }
  }

  handleSubmit(event) {
    event.preventDefault()  // 폼 제출 기본 동작 방지
    this.add()
  }

  render() {
    this.listTarget.innerHTML = ""
    
    if (this.todos.length === 0) {
      const emptyMessage = document.createElement("li")
      emptyMessage.textContent = "할일이 없습니다. 새로운 할일을 추가해보세요!"
      emptyMessage.style.cssText = "text-align: center; color: #6c757d; font-style: italic; padding: 20px;"
      this.listTarget.appendChild(emptyMessage)
      return
    }
    
    this.todos.forEach(todo => {
      const li = document.createElement("li")
      li.style.cssText = "padding: 10px; margin: 5px 0; background: white; border-radius: 5px; display: flex; align-items: center; justify-content: space-between;"
      
      const textSpan = document.createElement("span")
      textSpan.textContent = todo.title
      textSpan.style.cssText = todo.completed ? "text-decoration: line-through; color: #6c757d;" : "color: #212529;"
      
      const buttonContainer = document.createElement("div")
      
      const toggleButton = document.createElement("button")
      toggleButton.textContent = todo.completed ? "완료 취소" : "완료"
      toggleButton.style.cssText = `background: ${todo.completed ? '#ffc107' : '#28a745'}; color: ${todo.completed ? '#212529' : 'white'}; border: none; padding: 5px 10px; margin-right: 5px; border-radius: 3px; cursor: pointer;`
      toggleButton.dataset.todoId = todo.id
      toggleButton.addEventListener("click", this.toggle.bind(this))
      
      const removeButton = document.createElement("button")
      removeButton.textContent = "삭제"
      removeButton.style.cssText = "background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;"
      removeButton.dataset.todoId = todo.id
      removeButton.addEventListener("click", this.remove.bind(this))
      
      buttonContainer.appendChild(toggleButton)
      buttonContainer.appendChild(removeButton)
      
      li.appendChild(textSpan)
      li.appendChild(buttonContainer)
      
      this.listTarget.appendChild(li)
    })
  }

  updateStats() {
    // 통계 컨트롤러에게 업데이트 요청
    const statsController = this.application.getControllerForElementAndIdentifier(
      document.querySelector('[data-controller*="stats"]'), 
      'stats'
    )
    if (statsController) {
      statsController.loadStats()
    }
  }
} 