# 📝 Glass Todo (카카오 SSO 연동 Todo MVP)

> 카카오 1초 로그인(Kakao SSO)과 Supabase 클라우드 데이터베이스를 연동한 세련된 글래스모피즘 할 일 관리 웹 애플리케이션입니다.

---

## 🌟 주요 기능 (Key Features)

- **카카오 SSO 1초 로그인**: 노란색 `[카카오 1초 로그인]` 버튼으로 간편 인증 (`Supabase Auth Kakao Provider` 연동)
- **프로필 동기화**: 카카오 로그인 시 사용자의 카카오 프로필 아바타와 닉네임이 상단 헤더에 연동
- **Todo C.R.U.D**: 할 일 추가, 우선순위 (높음/보통/낮음) 설정, 마감 목표일 지정, 수정 및 삭제
- **실시간 프로그레스 바**: 할 일 완료 체크 시 오늘의 목표 달성률(%) 및 프로그레스 바 모션 실시간 계산
- **스마트 필터링**: 전체 / 진행 중 / 완료 탭 필터 및 제목 키워드 실시간 검색
- **글래스모피즘 UI**: 3D 앰비언트 글로우 애니메이션과 유리 질감 카드 디자인
- **LocalStorage & Supabase Cloud**: 브라우저 로컬 저장소 및 Supabase 클라우드 데이터베이스 완벽 연동

---

## 📁 프로젝트 구조 (Project Structure)

```text
todo-app/
├── index.html                    # Todo 앱 메인 레이아웃 & 카카오 SSO 로그인 바
├── styles.css                    # 글래스모피즘 다크 모드 & 카카오 시그니처 버튼 CSS
├── app.js                        # Todo C.R.U.D, 프로그레스 바, Supabase Auth 카카오 OAuth 로직
├── config.js                     # Supabase Cloud 자동 연동 설정 파일
├── vercel.json                   # Vercel 배포 설정
├── docs/                         # 요구사항 및 SQL 스크립트
│   ├── requirements.md           # 요구사항 정의서 (Markdown)
│   ├── requirements.doc          # 요구사항 정의서 (Word 문서)
│   └── todo_supabase_schema.sql  # Supabase todos 테이블 생성 SQL
└── README.md
```

---

## 🚀 실행 방법 (Getting Started)

별도의 백엔드 설치 없이 `index.html` 파일을 브라우저에서 열거나 정적 웹 서버를 통해 실행할 수 있습니다.

```bash
# Python으로 로컬 서버 실행 시
python -m http.server 8080 --directory c:\Users\USER\Documents\todo-app
```
접속 URL: `http://localhost:8080`
