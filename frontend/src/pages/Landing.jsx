import React from 'react';
import { Link } from 'react-router-dom';
// 스타일 파일은 StudyLanding.scss를 사용한다고 가정합니다.
import '../pages/style/Landing.scss';

/**
 * 스터디노트 서비스의 랜딩 페이지 컴포넌트
 * 학습 관리 기능 소개 및 로그인/시작 버튼을 포함합니다.
 */
const StudyLanding = () => {
    return (
        <section className="landing">
            <div className="container">
                {/* 메인 히어로 섹션 */}
                <div className="landing-hero">
                    <h1>스터디노트 (StudyNote)</h1>
                    <p className="landing-sub">
                        효율적인 학습 관리의 시작! 필기 정리, 오답 분석, 시험 대비까지.
                        당신의 모든 공부 기록을 한 곳에서 완벽하게 관리하세요.
                    </p>

                    {/* 시작하기 버튼 (React Router Link 사용 가정) */}
                    <Link to="/login" className="btn primary">나만의 학습 시작하기</Link>
                </div>

                {/* 주요 기능 목록 섹션 */}
                <ul className="landing-features">
                    <li>
                        <h3>체계적인 필기 정리</h3>
                        <p>과목별, 날짜별로 정리하고 중요한 내용을 하이라이트하여 복습 효율을 높입니다.</p>
                    </li>
                    <li>
                        <h3>오답 노트 자동 생성</h3>
                        <p>틀린 문제를 자동으로 분류하고 비슷한 유형을 추천하여 약점을 집중적으로 보완합니다.</p>
                    </li>
                    <li>
                        <h3>시험 대비 플래너</h3>
                        <p>시험 일정을 입력하면, 남은 기간 동안의 학습 분량을 자동으로 계산하여 최적의 계획을 세워줍니다.</p>
                    </li>
                </ul>
            </div>
        </section>
    );
}

export default StudyLanding;