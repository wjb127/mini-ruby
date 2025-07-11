# Fly.io 배포 가이드

## 개요

이 문서는 Ruby on Rails + SQLite + Hotwire 애플리케이션을 Fly.io에 배포하는 방법을 설명합니다.

## 사전 준비

### 1. Fly.io CLI 설치

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows
iwr https://fly.io/install.ps1 -useb | iex
```

### 2. Fly.io 계정 로그인

```bash
fly auth login
```

## 배포 과정

### 1. 애플리케이션 초기화

```bash
# Fly.io 앱 생성 (이미 생성된 경우 생략)
fly apps create mini-ruby

# 볼륨 생성 (SQLite 데이터베이스용)
fly volumes create data --region nrt --size 1
```

### 2. 환경 변수 설정

```bash
# Rails 마스터 키 설정
fly secrets set RAILS_MASTER_KEY=$(cat config/master.key)

# 기타 환경 변수 (필요시)
fly secrets set RAILS_ENV=production
fly secrets set RAILS_SERVE_STATIC_FILES=true
fly secrets set RAILS_LOG_TO_STDOUT=true
```

### 3. 배포 실행

```bash
# 간단한 배포
fly deploy

# 또는 배포 스크립트 사용
./bin/fly-deploy
```

## 주요 설정 파일

### fly.toml
- Fly.io 애플리케이션 설정
- 포트, 환경 변수, 볼륨 마운트 설정

### Dockerfile
- 포트 8080에서 0.0.0.0으로 바인딩
- 프로덕션 환경 최적화

### config/database.yml
- 프로덕션 데이터베이스를 `/data` 볼륨에 저장
- 영구 데이터 보존

### config/environments/production.rb
- 정적 파일 서빙 활성화
- 호스트 허용 설정 (*.fly.dev)
- SSL 강제 활성화

## 배포 후 확인

### 1. 애플리케이션 상태 확인

```bash
# 앱 상태 확인
fly status -a mini-ruby

# 로그 확인
fly logs -a mini-ruby

# 실시간 로그 모니터링
fly logs -a mini-ruby -f
```

### 2. 데이터베이스 초기화

```bash
# 데이터베이스 마이그레이션 (자동 실행됨)
fly ssh console -a mini-ruby
cd /rails && ./bin/rails db:migrate db:seed
```

### 3. 애플리케이션 접속

```bash
# 브라우저에서 앱 열기
fly open -a mini-ruby

# 또는 직접 접속
# https://mini-ruby.fly.dev
```

## 문제 해결

### 1. 연결 거부 오류

```
instance refused connection. is your app listening on 0.0.0.0:8080?
```

**해결 방법:**
- Dockerfile에서 `CMD` 명령어가 올바른지 확인
- 포트 8080, 바인딩 0.0.0.0으로 설정되어 있는지 확인

### 2. 데이터베이스 오류

```
SQLite3::ReadOnlyException: attempt to write a readonly database
```

**해결 방법:**
- 볼륨이 올바르게 마운트되었는지 확인
- 데이터베이스 파일 권한 확인

### 3. 정적 파일 404 오류

**해결 방법:**
- `config.public_file_server.enabled = true` 설정 확인
- 애셋 프리컴파일이 올바르게 실행되었는지 확인

## 유용한 명령어

```bash
# 앱 재시작
fly restart -a mini-ruby

# 스케일링
fly scale count 2 -a mini-ruby

# SSH 접속
fly ssh console -a mini-ruby

# 볼륨 정보 확인
fly volumes list -a mini-ruby

# 앱 정보 확인
fly info -a mini-ruby

# 배포 히스토리
fly releases -a mini-ruby
```

## 테스트 계정

배포 후 다음 계정으로 로그인할 수 있습니다:

- **이메일**: test@example.com
- **비밀번호**: password123

- **이메일**: demo@example.com  
- **비밀번호**: password123

## 비용 관리

- **무료 티어**: 월 5달러 크레딧 제공
- **자동 정지**: 트래픽이 없을 때 자동으로 머신 정지
- **볼륨 비용**: 1GB당 월 0.15달러

## 보안 고려사항

1. **HTTPS 강제**: 모든 트래픽이 HTTPS로 리디렉션
2. **비밀 키 관리**: Rails 마스터 키는 Fly.io 시크릿으로 관리
3. **호스트 검증**: 허용된 호스트만 접근 가능
4. **CSRF 보호**: 기본적으로 활성화

## 모니터링

```bash
# 메트릭 확인
fly metrics -a mini-ruby

# 머신 상태 확인
fly machine list -a mini-ruby

# 이벤트 로그
fly logs -a mini-ruby --json
```

이 가이드를 따라 성공적으로 배포하셨다면, https://mini-ruby.fly.dev 에서 애플리케이션을 확인할 수 있습니다! 