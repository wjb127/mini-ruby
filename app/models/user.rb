class User < ApplicationRecord
  authenticates_with_sorcery!
  
  # 검증
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, if: -> { new_record? || changes[:crypted_password] }
  validates :password, confirmation: true, if: -> { new_record? || changes[:crypted_password] }
  validates :password_confirmation, presence: true, if: -> { new_record? || changes[:crypted_password] }
  
  # 관계
  has_many :todos, dependent: :destroy
  
  def full_name
    "#{email.split('@').first.capitalize}"
  end
end
