import React from 'react';
import { Link } from 'react-router-dom'; // Link 임포트
import "./style/Landing.scss";

// 라우팅 방식으로 변경했기 때문에 App에서 받은 모든 props는 제거합니다.
const Landing = () => {

    return (
        <section className="landing">
            <div className="container">
                <div className="landing-hero">
                    <h1>포토메모</h1>
                    <p className="landing-sub">사진 한 장, 한 줄 메모. 태그 · 검색 · 공유까지.</p>
                    {/* ⬅️ "시작하기" 버튼 클릭 시 AuthPanel 페이지로 이동 */}
                    <Link to="/admin/login" className="btn primary">시작하기</Link>
                </div>

                <ul className="landing-features">
                    <li><h3>빠른 기록</h3><p>이미지 업로드 후 한 줄 메모로 즉시 저장.</p></li>
                    <li><h3>태그 & 검색</h3><p>태그로 묶고 검색으로 바로 찾기.</p></li>
                    <li><h3>간단 공유</h3><p>공유 링크로 가볍게 전달.</p></li>
                </ul>
            </div>
        </section>
    );
}

export default Landing;
