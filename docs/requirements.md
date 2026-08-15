# 카카오 SSO 연동 Todo MVP 웹 애플리케이션 요구사항 명세서

**작성일시**: 2026-08-15  
**상태**: 최종 확정 (Approved)

---

## 1. 프로젝트 개요 (Overview)
본 프로젝트는 사용자가 카카오 계정 1초 로그인(Kakao SSO)을 통해 할 일(Todo) 목록을 실시간으로 관리하고 기기 간 동기화할 수 있는 세련된 글래스모피즘 기반 Todo MVP 웹 애플리케이션 개발을 목표로 합니다.

---

## 2. 핵심 기능 요구사항 (Core Features)

### 2.1 카카오 SSO 로그인 (Kakao Single Sign-On)
- **1초 간편 인증**: 노란색 `[카카오 1초 로그인]` 버튼 제공 (`Supabase Auth Kakao Provider` 기반)
- **프로필 동기화**: 로그인 성공 시 카카오 닉네임과 아바타 사진이 상단 헤더에 자동 연결
- **유저별 데이터 스코핑**: 로그인한 카카오 사용자 고유 `user_id`를 기준으로 할 일 목록 격리 보관

### 2.2 Todo MVP C.R.U.D 기능
- **할 일 추가**: 제목, 우선순위 (높음 🔴 / 보통 🟡 / 낮음 🟢), 마감 목표일 입력
- **완료 처리 토글**: 체크박스 클릭 시 즉시 취소선 및 투명도 변경 애니메이션 + 오늘의 달성률 프로그레스 바 실시간 반영
- **할 일 수정**: 팝업 모달을 통해 제목, 우선순위, 마감 목표일 수정 지원
- **할 일 삭제 및 정리**: 개별 항목 삭제 및 `[완료항목 정리]` 일괄 정리 버튼 제공

### 2.3 필터링 & 검색 & 반응형 UI
- **탭 필터**: 전체 / 진행 중 / 완료됨 탭을 통한 상태별 필터링
- **실시간 검색**: 키워드 입력 시 제목 기반 즉시 필터링
- **글래스모피즘 UI**: 3D 앰비언트 글로우 애니메이션, 유리 질감 카드, 네온 파플/옐로우 아비티 포인트

---

## 3. 데이터베이스 스키마 (Database Schema)

```sql
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. 실행 환경 사양 (Deployment Specifications)
- **웹 호스팅**: Vercel (`cleanUrls: true`)
- **데이터베이스 / 인증**: Supabase Auth (Kakao OAuth) + Supabase Cloud PostgreSQL
