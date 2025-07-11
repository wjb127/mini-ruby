# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# 샘플 사용자 생성
user1 = User.create!(
  email: "test@example.com",
  password: "password123",
  password_confirmation: "password123"
)

user2 = User.create!(
  email: "demo@example.com", 
  password: "password123",
  password_confirmation: "password123"
)

# 샘플 할일 데이터 생성 (사용자별)
user1.todos.create!([
  { title: "루비온 레일즈 학습하기", completed: false },
  { title: "Hotwire 튜토리얼 완료하기", completed: true },
  { title: "SQLite 데이터베이스 설정하기", completed: true }
])

user2.todos.create!([
  { title: "REST API 구현하기", completed: false },
  { title: "프론트엔드와 백엔드 연동하기", completed: false },
  { title: "Sorcery 인증 구현하기", completed: true }
])

puts "샘플 사용자 #{User.count}명과 할일 #{Todo.count}개가 생성되었습니다."
