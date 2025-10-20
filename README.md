# StudyNote

## 설치
cd backend
npm install

## 환경변수 설정
- .env 파일을 프로젝트 루트에 생성하고 .env.example 내용을 채우세요.

## 실행
npm run dev

## API (기본)
- POST /api/auth/register  -> { email, password, displayName }
- POST /api/auth/login     -> { email, password }
- GET  /api/auth/profile   -> Authorization: Bearer <token>

- GET  /api/notes          -> (protected) get user's notes
- POST /api/notes          -> (protected) create note
- GET  /api/notes/:id      -> (protected) get single note (owner or admin)
- PUT  /api/notes/:id      -> (protected) update note (owner or admin)
- DELETE /api/notes/:id    -> (protected) delete note (owner or admin)
