# Mini Ruby - Rails Hello World 애플리케이션

Ruby on Rails 8.0.2를 사용하여 구현한 완전한 웹 애플리케이션입니다. Hotwire, SQLite, Sorcery 인증을 포함한 모던 Rails 개발의 핵심 기능들을 모두 포함하고 있습니다.

## 🚀 주요 기능

### 1. 기본 웹 애플리케이션
- **Hello World 페이지**: Rails 기본 구조와 뷰 렌더링
- **반응형 디자인**: 모던하고 깔끔한 UI/UX
- **인라인 스타일링**: 즉시 적용되는 스타일

### 2. Hotwire 인터랙티브 기능
- **Stimulus 카운터**: 실시간 카운터 (+1, -1, 리셋)
- **Turbo Frame**: 페이지 새로고침 없는 시간 업데이트
- **실시간 할일 관리**: 즉시 반영되는 CRUD 작업

### 3. SQLite 데이터베이스
- **Todo 모델**: 제목, 완료상태, 사용자 연결
- **User 모델**: 이메일, 암호화된 비밀번호
- **관계 설정**: User has_many Todos, Todo belongs_to User
- **마이그레이션**: 체계적인 데이터베이스 스키마 관리

### 4. REST API
- `GET /api/todos` - 사용자별 할일 목록 조회
- `POST /api/todos` - 새 할일 생성
- `PATCH /api/todos/:id` - 할일 수정
- `DELETE /api/todos/:id` - 할일 삭제
- `GET /api/todos/stats` - 사용자별 통계 정보

### 5. Sorcery 인증 시스템
- **회원가입**: 이메일/비밀번호 검증
- **로그인/로그아웃**: 세션 기반 인증
- **사용자별 데이터 분리**: 개인 할일 관리
- **인증 상태별 UI**: 로그인 여부에 따른 화면 변화

## 🛠 기술 스택

- **Backend**: Ruby on Rails 8.0.2
- **Database**: SQLite3
- **Frontend**: Hotwire (Turbo + Stimulus)
- **Authentication**: Sorcery
- **Styling**: Inline CSS (Bootstrap-like design)

## 📁 프로젝트 구조

```
mini-ruby/
├── app/
│   ├── controllers/
│   │   ├── application_controller.rb    # 기본 컨트롤러 + 인증
│   │   ├── home_controller.rb          # 메인 페이지
│   │   ├── users_controller.rb         # 회원가입/프로필
│   │   ├── sessions_controller.rb      # 로그인/로그아웃
│   │   └── api/
│   │       └── todos_controller.rb     # REST API
│   ├── models/
│   │   ├── user.rb                     # 사용자 모델 + 검증
│   │   └── todo.rb                     # 할일 모델 + 관계
│   ├── views/
│   │   ├── home/
│   │   │   ├── index.html.erb          # 메인 페이지
│   │   │   └── update_time.html.erb    # Turbo Frame 뷰
│   │   ├── users/
│   │   │   ├── new.html.erb            # 회원가입 폼
│   │   │   └── show.html.erb           # 프로필 페이지
│   │   └── sessions/
│   │       └── new.html.erb            # 로그인 폼
│   └── javascript/
│       └── controllers/
│           ├── counter_controller.js    # 카운터 Stimulus
│           ├── todo_controller.js       # 할일 Stimulus + API 연동
│           └── stats_controller.js      # 통계 Stimulus
├── config/
│   ├── routes.rb                       # 라우팅 설정
│   └── initializers/
│       └── sorcery.rb                  # Sorcery 설정
├── db/
│   ├── migrate/                        # 데이터베이스 마이그레이션
│   └── seeds.rb                        # 샘플 데이터
└── Gemfile                             # 의존성 관리
```

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/wjb127/mini-ruby.git
cd mini-ruby
```

### 2. 의존성 설치
```bash
bundle install
```

### 3. 데이터베이스 설정
```bash
rails db:create
rails db:migrate
rails db:seed
```

### 4. 서버 실행
```bash
rails server --port=3002
```

### 5. 브라우저에서 확인
http://localhost:3002

## 👤 테스트 계정

샘플 데이터로 생성된 테스트 계정:

1. **계정 1**
   - 이메일: `test@example.com`
   - 비밀번호: `password123`

2. **계정 2**
   - 이메일: `demo@example.com`
   - 비밀번호: `password123`

## 🎯 사용법

### 1. 회원가입/로그인
- 메인 페이지에서 "회원가입" 또는 "로그인" 클릭
- 테스트 계정으로 로그인하거나 새 계정 생성

### 2. 할일 관리
- 로그인 후 할일 입력 필드에 새 할일 입력
- 엔터키 또는 "추가" 버튼으로 할일 추가
- "완료" 버튼으로 상태 변경
- "삭제" 버튼으로 할일 제거

### 3. 통계 확인
- 실시간으로 업데이트되는 할일 통계
- 전체/완료/대기 할일 수와 완료율 표시

### 4. 기타 기능
- 카운터: +1, -1, 리셋 버튼으로 숫자 조작
- 시간 업데이트: "시간 업데이트" 버튼으로 현재 시간 갱신
- 프로필: 계정 정보 및 개인 통계 확인

## 🔧 API 사용법

### 인증이 필요한 API
모든 API는 로그인된 사용자의 데이터만 접근 가능합니다.

```bash
# 할일 목록 조회
curl -H "Cookie: session_cookie" http://localhost:3002/api/todos

# 새 할일 생성
curl -X POST -H "Content-Type: application/json" \
     -H "Cookie: session_cookie" \
     -d '{"todo":{"title":"새 할일","completed":false}}' \
     http://localhost:3002/api/todos

# 할일 수정
curl -X PATCH -H "Content-Type: application/json" \
     -H "Cookie: session_cookie" \
     -d '{"todo":{"completed":true}}' \
     http://localhost:3002/api/todos/1

# 할일 삭제
curl -X DELETE -H "Cookie: session_cookie" \
     http://localhost:3002/api/todos/1

# 통계 정보
curl -H "Cookie: session_cookie" http://localhost:3002/api/todos/stats
```

## 🎨 주요 특징

### 1. 모던 Rails 8.0.2
- 최신 Rails 기능 활용
- Hotwire 기본 탑재
- 개선된 성능과 보안

### 2. 완전한 인증 시스템
- Sorcery gem 활용
- 세션 기반 인증
- 사용자별 데이터 분리

### 3. 실시간 UI 업데이트
- Turbo Frame으로 부분 업데이트
- Stimulus로 인터랙티브 기능
- 페이지 새로고침 없는 UX

### 4. RESTful API
- 표준 HTTP 메서드 사용
- JSON 응답 형식
- 에러 처리 포함

### 5. 반응형 디자인
- 모바일 친화적 UI
- 직관적인 네비게이션
- 일관된 디자인 시스템

## 📝 개발 과정

1. **기본 Rails 앱 생성** - Hello World 페이지
2. **Hotwire 통합** - Stimulus 컨트롤러와 Turbo Frame
3. **데이터베이스 설계** - Todo 모델과 API 구현
4. **인증 시스템** - Sorcery 통합과 사용자 관리
5. **UI/UX 개선** - 반응형 디자인과 사용자 경험

## 🔗 관련 링크

- [GitHub 저장소](https://github.com/wjb127/mini-ruby)
- [Ruby on Rails 가이드](https://guides.rubyonrails.org/)
- [Hotwire 문서](https://hotwired.dev/)
- [Sorcery 문서](https://github.com/Sorcery/sorcery)

---

**개발자**: 이 프로젝트는 Ruby on Rails의 핵심 기능들을 학습하고 실습하기 위해 만들어졌습니다.
