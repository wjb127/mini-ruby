# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# 샘플 할일 데이터 생성
Todo.create!([
  { title: "루비온 레일즈 학습하기", completed: false },
  { title: "Hotwire 튜토리얼 완료하기", completed: true },
  { title: "SQLite 데이터베이스 설정하기", completed: true },
  { title: "REST API 구현하기", completed: false },
  { title: "프론트엔드와 백엔드 연동하기", completed: false }
])

puts "샘플 할일 #{Todo.count}개가 생성되었습니다."
