# Ruby on Rails + SQLite + Hotwire 완전 강의

## 목차
1. [프로젝트 개요](#1-프로젝트-개요)
2. [프로젝트 구조 이해](#2-프로젝트-구조-이해)
3. [SQLite 데이터베이스 기초](#3-sqlite-데이터베이스-기초)
4. [ActiveRecord와 모델](#4-activerecord와-모델)
5. [Hotwire 기초 (Turbo + Stimulus)](#5-hotwire-기초-turbo--stimulus)
6. [실시간 인터랙션 구현](#6-실시간-인터랙션-구현)
7. [인증 시스템 (Sorcery)](#7-인증-시스템-sorcery)
8. [REST API 설계](#8-rest-api-설계)
9. [실습 및 데이터베이스 직접 조회](#9-실습-및-데이터베이스-직접-조회)
10. [핵심 개념 정리](#10-핵심-개념-정리)

---

## 1. 프로젝트 개요

### 기술 스택
- **Ruby on Rails 8.0.2**: 웹 애플리케이션 프레임워크
- **SQLite**: 경량 데이터베이스
- **Hotwire**: 현대적인 웹 인터랙션 (Turbo + Stimulus)
- **Sorcery**: 인증 시스템
- **Bootstrap 스타일**: 반응형 UI

### 주요 기능
- 사용자 인증 (회원가입, 로그인, 로그아웃)
- 개인 할일 관리 (CRUD)
- 실시간 통계 정보
- 페이지 새로고침 없는 인터랙션
- REST API 제공

### 프로젝트 실행
```bash
# 서버 시작
rails server --port=3002

# 브라우저에서 접속
http://localhost:3002
```

### 테스트 계정
- `test@example.com` / `password123`
- `demo@example.com` / `password123`

---

## 2. 프로젝트 구조 이해

### Rails MVC 패턴

Rails는 MVC (Model-View-Controller) 패턴을 따릅니다:

```
app/
├── models/          # 데이터 모델 및 비즈니스 로직
│   ├── user.rb      # 사용자 모델
│   └── todo.rb      # 할일 모델
├── views/           # 사용자 인터페이스 템플릿
│   ├── home/
│   ├── users/
│   └── sessions/
├── controllers/     # 요청 처리 및 응답 제어
│   ├── home_controller.rb
│   ├── users_controller.rb
│   ├── sessions_controller.rb
│   └── api/
│       └── todos_controller.rb
└── javascript/      # 클라이언트 사이드 JavaScript
    └── controllers/
        ├── counter_controller.js
        ├── todo_controller.js
        └── stats_controller.js
```

### 핵심 디렉토리 설명

- **app/models/**: ActiveRecord 모델들
- **app/views/**: ERB 템플릿 파일들
- **app/controllers/**: 요청을 처리하는 컨트롤러들
- **app/javascript/**: Stimulus 컨트롤러들
- **config/**: 애플리케이션 설정 파일들
- **db/**: 데이터베이스 마이그레이션 및 스키마
- **storage/**: SQLite 데이터베이스 파일들

---

## 3. SQLite 데이터베이스 기초

### 데이터베이스 설정

**config/database.yml**
```yaml
default: &default
  adapter: sqlite3
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  timeout: 5000

development:
  <<: *default
  database: storage/development.sqlite3

test:
  <<: *default
  database: storage/test.sqlite3

production:
  primary:
    <<: *default
    database: storage/production.sqlite3
```

### 데이터베이스 스키마

현재 데이터베이스는 두 개의 주요 테이블로 구성됩니다:

#### users 테이블
```sql
CREATE TABLE "users" (
  "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  "email" varchar NOT NULL,
  "crypted_password" varchar,
  "salt" varchar,
  "created_at" datetime(6) NOT NULL,
  "updated_at" datetime(6) NOT NULL
);
```

#### todos 테이블
```sql
CREATE TABLE "todos" (
  "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  "title" varchar,
  "completed" boolean,
  "created_at" datetime(6) NOT NULL,
  "updated_at" datetime(6) NOT NULL,
  "user_id" integer NOT NULL,
  FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);
```

### 마이그레이션 파일들

1. **Todo 테이블 생성**
```ruby
# db/migrate/20250711034033_create_todos.rb
class CreateTodos < ActiveRecord::Migration[8.0]
  def change
    create_table :todos do |t|
      t.string :title
      t.boolean :completed
      t.timestamps
    end
  end
end
```

2. **User 테이블 생성 (Sorcery)**
```ruby
# db/migrate/20250711034529_sorcery_core.rb
class SorceryCore < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :email,            null: false, index: { unique: true }
      t.string :crypted_password
      t.string :salt
      t.timestamps                null: false
    end
  end
end
```

3. **Todo에 User 관계 추가**
```ruby
# db/migrate/20250711034618_add_user_id_to_todos.rb
class AddUserIdToTodos < ActiveRecord::Migration[8.0]
  def change
    add_reference :todos, :user, null: false, foreign_key: true
  end
end
```

---

## 4. ActiveRecord와 모델

### User 모델

```ruby
# app/models/user.rb
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
```

### Todo 모델

```ruby
# app/models/todo.rb
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
```

### ActiveRecord 주요 개념

#### 1. 관계 (Associations)
- `has_many :todos`: User는 여러 Todo를 가질 수 있음
- `belongs_to :user`: Todo는 한 User에 속함
- `dependent: :destroy`: User 삭제 시 관련 Todo도 삭제

#### 2. 검증 (Validations)
- `presence: true`: 필수 필드
- `uniqueness: true`: 유니크 제약
- `length: { minimum: 6 }`: 길이 제한
- `format: { with: URI::MailTo::EMAIL_REGEXP }`: 이메일 형식 검증

#### 3. 스코프 (Scopes)
- `scope :completed`: 완료된 할일만 조회
- `scope :pending`: 미완료 할일만 조회

#### 4. 콜백 (Callbacks)
- `after_initialize`: 객체 초기화 후 실행
- `set_defaults`: 기본값 설정

---

## 5. Hotwire 기초 (Turbo + Stimulus)

### Hotwire란?

Hotwire는 **HTML Over The Wire**의 줄임말로, 페이지 새로고침 없이 동적인 웹 애플리케이션을 만들 수 있게 해주는 기술입니다.

#### 구성 요소
1. **Turbo**: 페이지 새로고침 없는 네비게이션
2. **Stimulus**: 가벼운 JavaScript 프레임워크

### Stimulus 컨트롤러 기본 구조

```javascript
// app/javascript/controllers/counter_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["count"]  // 타겟 정의

  connect() {                 // 컨트롤러 연결 시 실행
    this.count = 0
  }

  increment() {               // 액션 메서드
    this.count++
    this.updateDisplay()
  }

  updateDisplay() {           // 헬퍼 메서드
    this.countTarget.textContent = this.count
  }
}
```

### HTML에서 Stimulus 사용

```html
<!-- 컨트롤러 연결 -->
<div data-controller="counter">
  <!-- 타겟 정의 -->
  <span data-counter-target="count">0</span>
  
  <!-- 액션 연결 -->
  <button data-action="click->counter#increment">+1</button>
  <button data-action="click->counter#decrement">-1</button>
</div>
```

### 주요 Stimulus 개념

#### 1. 데이터 속성 (Data Attributes)
- `data-controller="name"`: 컨트롤러 연결
- `data-name-target="element"`: 타겟 요소 정의
- `data-action="event->controller#method"`: 이벤트 액션 연결

#### 2. 타겟 (Targets)
- JavaScript에서 DOM 요소에 쉽게 접근
- `this.nameTarget`: 단일 타겟
- `this.nameTargets`: 복수 타겟

#### 3. 액션 (Actions)
- 이벤트와 메서드 연결
- `click->counter#increment`: 클릭 시 increment 메서드 실행

---

## 6. 실시간 인터랙션 구현

### Todo 컨트롤러 (핵심 구현)

```javascript
// app/javascript/controllers/todo_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "list"]

  connect() {
    this.loadTodos()
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
        this.render()
        this.updateStats()
      }
    } catch (error) {
      console.error('Network error:', error)
    }
  }

  async toggle(event) {
    const todoId = parseInt(event.target.dataset.todoId)
    const todo = this.todos.find(t => t.id === todoId)
    
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
      }
    } catch (error) {
      console.error('Network error:', error)
    }
  }

  render() {
    this.listTarget.innerHTML = ""
    
    this.todos.forEach(todo => {
      const li = document.createElement("li")
      li.style.cssText = "padding: 10px; margin: 5px 0; background: white; border-radius: 5px; display: flex; align-items: center; justify-content: space-between;"
      
      const textSpan = document.createElement("span")
      textSpan.textContent = todo.title
      textSpan.style.cssText = todo.completed ? "text-decoration: line-through; color: #6c757d;" : "color: #212529;"
      
      // 버튼 생성 및 이벤트 연결
      const toggleButton = document.createElement("button")
      toggleButton.textContent = todo.completed ? "완료 취소" : "완료"
      toggleButton.dataset.todoId = todo.id
      toggleButton.addEventListener("click", this.toggle.bind(this))
      
      li.appendChild(textSpan)
      li.appendChild(toggleButton)
      this.listTarget.appendChild(li)
    })
  }
}
```

### 통계 컨트롤러

```javascript
// app/javascript/controllers/stats_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["display"]

  connect() {
    this.loadStats()
    this.startPolling()
  }

  disconnect() {
    this.stopPolling()
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
      <div style="background: white; padding: 15px; border-radius: 5px;">
        <h4 style="margin: 0 0 10px 0; color: #0c5460;">전체: ${stats.total}</h4>
      </div>
      <div style="background: white; padding: 15px; border-radius: 5px;">
        <h4 style="margin: 0 0 10px 0; color: #155724;">완료: ${stats.completed}</h4>
      </div>
      <div style="background: white; padding: 15px; border-radius: 5px;">
        <h4 style="margin: 0 0 10px 0; color: #721c24;">대기: ${stats.pending}</h4>
      </div>
      <div style="background: white; padding: 15px; border-radius: 5px;">
        <h4 style="margin: 0 0 10px 0; color: #0c5460;">완료율: ${stats.completion_rate}%</h4>
      </div>
    `
  }

  startPolling() {
    this.pollingInterval = setInterval(() => {
      this.loadStats()
    }, 5000) // 5초마다 업데이트
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }
  }
}
```

### Turbo Frame 사용 예시

```erb
<!-- app/views/home/index.html.erb -->
<%= turbo_frame_tag "dynamic_content" do %>
  <div id="time-display">
    <p>현재 시간: <%= Time.current.strftime("%Y-%m-%d %H:%M:%S") %></p>
    <%= link_to "시간 업데이트", update_time_path %>
  </div>
<% end %>
```

---

## 7. 인증 시스템 (Sorcery)

### Sorcery 설정

**Gemfile**
```ruby
gem "sorcery"
gem "bcrypt", "~> 3.1.7"
```

### 사용자 컨트롤러

```ruby
# app/controllers/users_controller.rb
class UsersController < ApplicationController
  skip_before_action :require_login, only: [:new, :create]
  
  def new
    @user = User.new
  end

  def create
    @user = User.new(user_params)
    
    if @user.save
      auto_login(@user)
      redirect_to root_path, notice: "회원가입이 완료되었습니다!"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def show
    @user = current_user
  end
  
  private
  
  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end
end
```

### 세션 컨트롤러

```ruby
# app/controllers/sessions_controller.rb
class SessionsController < ApplicationController
  skip_before_action :require_login, only: [:new, :create]
  
  def new
    # 로그인 폼
  end

  def create
    @user = login(params[:email], params[:password])
    
    if @user
      redirect_to root_path, notice: "로그인되었습니다!"
    else
      flash.now[:alert] = "이메일 또는 비밀번호가 잘못되었습니다."
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    logout
    redirect_to login_path, notice: "로그아웃되었습니다."
  end
end
```

### 애플리케이션 컨트롤러

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  before_action :require_login
  
  protected
  
  def not_authenticated
    redirect_to login_path, alert: "로그인이 필요합니다."
  end
  
  def current_user_todos
    current_user&.todos || Todo.none
  end
  
  helper_method :current_user_todos
end
```

### 인증 관련 뷰

**로그인 폼**
```erb
<!-- app/views/sessions/new.html.erb -->
<div class="container">
  <h2>로그인</h2>
  
  <%= form_with url: login_path, local: true do |form| %>
    <div class="form-group">
      <%= form.label :email, "이메일" %>
      <%= form.email_field :email, required: true, class: "form-control" %>
    </div>
    
    <div class="form-group">
      <%= form.label :password, "비밀번호" %>
      <%= form.password_field :password, required: true, class: "form-control" %>
    </div>
    
    <%= form.submit "로그인", class: "btn btn-primary" %>
  <% end %>
</div>
```

**회원가입 폼**
```erb
<!-- app/views/users/new.html.erb -->
<div class="container">
  <h2>회원가입</h2>
  
  <%= form_with model: @user, url: signup_path, local: true do |form| %>
    <div class="form-group">
      <%= form.label :email, "이메일" %>
      <%= form.email_field :email, required: true, class: "form-control" %>
    </div>
    
    <div class="form-group">
      <%= form.label :password, "비밀번호" %>
      <%= form.password_field :password, required: true, class: "form-control" %>
    </div>
    
    <div class="form-group">
      <%= form.label :password_confirmation, "비밀번호 확인" %>
      <%= form.password_field :password_confirmation, required: true, class: "form-control" %>
    </div>
    
    <%= form.submit "회원가입", class: "btn btn-success" %>
  <% end %>
</div>
```

---

## 8. REST API 설계

### API 컨트롤러

```ruby
# app/controllers/api/todos_controller.rb
class Api::TodosController < ApplicationController
  before_action :set_todo, only: [:show, :update, :destroy]
  
  # GET /api/todos
  def index
    @todos = current_user ? current_user.todos.order(created_at: :desc) : []
    render json: @todos
  end
  
  # GET /api/todos/stats
  def stats
    user_todos = current_user ? current_user.todos : Todo.none
    total_count = user_todos.count
    completed_count = user_todos.completed.count
    pending_count = user_todos.pending.count
    completion_rate = total_count > 0 ? (completed_count.to_f / total_count * 100).round(1) : 0
    
    render json: {
      total: total_count,
      completed: completed_count,
      pending: pending_count,
      completion_rate: completion_rate
    }
  end
  
  # POST /api/todos
  def create
    @todo = current_user ? current_user.todos.build(todo_params) : Todo.new(todo_params)
    
    if @todo.save
      render json: @todo, status: :created
    else
      render json: { errors: @todo.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/todos/1
  def update
    if @todo.update(todo_params)
      render json: @todo
    else
      render json: { errors: @todo.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/todos/1
  def destroy
    @todo.destroy
    head :no_content
  end
  
  private
  
  def set_todo
    @todo = current_user ? current_user.todos.find(params[:id]) : Todo.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Todo not found' }, status: :not_found
  end
  
  def todo_params
    params.require(:todo).permit(:title, :completed)
  end
end
```

### 라우팅 설정

```ruby
# config/routes.rb
Rails.application.routes.draw do
  # 인증 관련 라우트
  get 'login', to: 'sessions#new'
  post 'login', to: 'sessions#create'
  delete 'logout', to: 'sessions#destroy'
  get 'signup', to: 'users#new'
  post 'signup', to: 'users#create'
  get 'profile', to: 'users#show'
  
  # API 라우트
  namespace :api do
    resources :todos, only: [:index, :show, :create, :update, :destroy] do
      collection do
        get :stats
      end
    end
  end
  
  # 기본 라우트
  root "home#index"
end
```

### API 엔드포인트 정리

| HTTP 메서드 | 경로 | 설명 | 응답 |
|-------------|------|------|------|
| GET | /api/todos | 할일 목록 조회 | JSON 배열 |
| GET | /api/todos/stats | 통계 정보 조회 | JSON 객체 |
| POST | /api/todos | 새 할일 생성 | 생성된 할일 JSON |
| PATCH | /api/todos/:id | 할일 수정 | 수정된 할일 JSON |
| DELETE | /api/todos/:id | 할일 삭제 | 204 No Content |

---

## 9. 실습 및 데이터베이스 직접 조회

### 1. SQLite 명령어 사용

```bash
# 데이터베이스 접속
sqlite3 storage/development.sqlite3

# 테이블 목록 보기
.tables

# 스키마 보기
.schema todos
.schema users

# 데이터 조회
SELECT * FROM todos;
SELECT * FROM users;

# JOIN 쿼리
SELECT users.email, todos.title, todos.completed 
FROM todos JOIN users ON todos.user_id = users.id;

# 통계 쿼리
SELECT 
  users.email,
  COUNT(todos.id) as total_todos,
  SUM(CASE WHEN todos.completed = 1 THEN 1 ELSE 0 END) as completed_todos
FROM users 
LEFT JOIN todos ON users.id = todos.user_id 
GROUP BY users.id;
```

### 2. Rails 콘솔 사용

```ruby
# Rails 콘솔 실행
rails console

# 기본 조회
User.all
Todo.all

# 관계 조회
user = User.find_by(email: 'test@example.com')
user.todos
user.todos.completed
user.todos.pending

# 통계 정보
Todo.count
Todo.completed.count
Todo.pending.count

# 복잡한 쿼리
User.joins(:todos).group('users.id').count('todos.id')
```

### 3. Rails Runner 사용

```bash
# 한 줄 스크립트 실행
rails runner "puts User.count"
rails runner "puts Todo.joins(:user).pluck(:title, 'users.email')"

# 복잡한 스크립트 실행
rails runner "
  puts 'Users:'
  User.all.each { |u| puts \"- #{u.email} (ID: #{u.id})\" }
  puts 'Todos:'
  Todo.all.each { |t| puts \"- #{t.title} (User: #{t.user.email}, Completed: #{t.completed})\" }
"
```

### 4. 샘플 데이터 생성

```ruby
# db/seeds.rb
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

# 샘플 할일 생성
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
```

```bash
# 샘플 데이터 실행
rails db:seed
```

---

## 10. 핵심 개념 정리

### 1. MVC 패턴의 이해

**Model (모델)**
- 데이터와 비즈니스 로직을 담당
- ActiveRecord를 통한 데이터베이스 연동
- 검증, 관계, 콜백 등의 기능 제공

**View (뷰)**
- 사용자 인터페이스 담당
- ERB 템플릿을 통한 동적 HTML 생성
- 부분 템플릿과 레이아웃 활용

**Controller (컨트롤러)**
- 요청 처리 및 응답 제어
- 모델과 뷰 사이의 중재자 역할
- 인증, 권한 체크 등의 필터 적용

### 2. ActiveRecord 핵심 개념

**관계 (Associations)**
```ruby
# 일대다 관계
has_many :todos, dependent: :destroy
belongs_to :user

# 다대다 관계 (예시)
has_many :user_roles
has_many :roles, through: :user_roles
```

**검증 (Validations)**
```ruby
validates :email, presence: true, uniqueness: true
validates :password, length: { minimum: 6 }
validates :title, presence: true, length: { maximum: 255 }
```

**스코프 (Scopes)**
```ruby
scope :completed, -> { where(completed: true) }
scope :recent, -> { order(created_at: :desc) }
scope :by_user, ->(user) { where(user: user) }
```

### 3. Hotwire의 핵심 가치

**페이지 새로고침 없는 인터랙션**
- Turbo를 통한 부분 페이지 업데이트
- Stimulus를 통한 클라이언트 사이드 로직
- 서버 사이드 렌더링 유지

**HTML 우선 접근법**
- JavaScript 최소화
- 서버에서 HTML 생성
- 클라이언트는 인터랙션만 담당

### 4. 현대적 웹 개발 패턴

**API 우선 설계**
- RESTful API 엔드포인트
- JSON 응답 형식
- 프론트엔드와 백엔드 분리

**보안 고려사항**
- CSRF 토큰 사용
- 사용자 인증 및 권한 체크
- SQL 인젝션 방지 (ActiveRecord 사용)

**성능 최적화**
- 데이터베이스 인덱스 활용
- N+1 쿼리 방지 (includes 사용)
- 캐싱 전략 적용

### 5. 실무 적용 팁

**코드 구조화**
- 관심사 분리 (Separation of Concerns)
- DRY 원칙 (Don't Repeat Yourself)
- 테스트 가능한 코드 작성

**데이터베이스 설계**
- 정규화 vs 비정규화 균형
- 인덱스 최적화
- 마이그레이션 관리

**사용자 경험 개선**
- 로딩 상태 표시
- 에러 처리 및 피드백
- 반응형 디자인

---

## 결론

이 프로젝트는 현대적인 Rails 애플리케이션 개발의 핵심 개념들을 모두 포함하고 있습니다:

- **Rails 8.0.2**의 최신 기능 활용
- **SQLite**를 통한 간단한 데이터베이스 관리
- **Hotwire**를 통한 현대적 웹 인터랙션
- **Sorcery**를 통한 안전한 인증 시스템
- **REST API** 설계 및 구현

이러한 기술들을 조합하여 페이지 새로고침 없이 동작하는 실시간 할일 관리 애플리케이션을 구현했습니다. 이 패턴들은 실무에서 바로 활용할 수 있는 현대적인 웹 애플리케이션 개발 방법론을 보여줍니다.

### 추가 학습 방향

1. **테스트 작성**: RSpec, Capybara를 활용한 테스트 주도 개발
2. **배포**: Docker, Heroku, AWS를 통한 프로덕션 배포
3. **성능 최적화**: Redis 캐싱, 데이터베이스 최적화
4. **고급 기능**: WebSocket, 실시간 알림, 파일 업로드

이 튜토리얼을 통해 Ruby on Rails의 강력함과 Hotwire의 혁신적인 접근법을 경험해보시기 바랍니다! 