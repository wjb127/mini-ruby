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
      <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="font-size: 24px; font-weight: bold; color: #0c5460;">${stats.total}</div>
        <div style="font-size: 14px; color: #6c757d;">전체 할일</div>
      </div>
      <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="font-size: 24px; font-weight: bold; color: #28a745;">${stats.completed}</div>
        <div style="font-size: 14px; color: #6c757d;">완료된 할일</div>
      </div>
      <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="font-size: 24px; font-weight: bold; color: #ffc107;">${stats.pending}</div>
        <div style="font-size: 14px; color: #6c757d;">대기 중인 할일</div>
      </div>
      <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="font-size: 24px; font-weight: bold; color: #007bff;">${stats.completion_rate}%</div>
        <div style="font-size: 14px; color: #6c757d;">완료율</div>
      </div>
    `
  }
} 