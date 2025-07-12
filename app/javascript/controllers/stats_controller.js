import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["display"]

  connect() {
    this.loadStats()
    // 5초마다 통계 정보 업데이트
    this.interval = setInterval(() => {
      this.loadStats()
    }, 5000)
  }

  disconnect() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  async loadStats() {
    try {
      const response = await fetch('/api/todos/stats')
      const stats = await response.json()
      this.renderStats(stats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  renderStats(stats) {
    this.displayTarget.innerHTML = `
      <div class="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
        <div class="text-3xl font-bold text-blue-600 mb-2">${stats.total}</div>
        <div class="text-gray-600 font-medium">전체 할일</div>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
        <div class="text-3xl font-bold text-green-600 mb-2">${stats.completed}</div>
        <div class="text-gray-600 font-medium">완료된 할일</div>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
        <div class="text-3xl font-bold text-yellow-600 mb-2">${stats.pending}</div>
        <div class="text-gray-600 font-medium">대기 중인 할일</div>
      </div>
    `
    
    // 완료율이 있는 경우에만 추가 (4개 이상의 통계가 있을 때)
    if (stats.completion_rate !== undefined) {
      this.displayTarget.innerHTML += `
        <div class="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
          <div class="text-3xl font-bold text-purple-600 mb-2">${stats.completion_rate}%</div>
          <div class="text-gray-600 font-medium">완료율</div>
        </div>
      `
    }
  }
} 