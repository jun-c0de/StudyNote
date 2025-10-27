import React from 'react';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
    const { user } = useAuth();

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2>{user?.displayName || user?.email}님 환영합니다!</h2>
            <p>이곳은 일반 사용자 대시보드입니다. 이제 메모와 관련된 기능을 구현해 보세요.</p>
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h3>TODO: 메모 리스트 컴포넌트 추가</h3>
                <p>API에서 노트를 불러오고, 새로운 노트를 추가하며, 태그별 검색 기능을 구현합니다.</p>
            </div>
        </div>
    );
};

export default UserDashboard;
