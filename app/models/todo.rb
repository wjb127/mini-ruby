class Todo < ApplicationRecord
  belongs_to :user
  
  validates :title, presence: true, length: { minimum: 1, maximum: 255 }
  validates :completed, inclusion: { in: [true, false] }
  validates :user_id, presence: true
  
  # 기본값 설정
  after_initialize :set_defaults
  
  scope :completed, -> { where(completed: true) }
  scope :pending, -> { where(completed: false) }
  
  private
  
  def set_defaults
    self.completed ||= false
  end
end
