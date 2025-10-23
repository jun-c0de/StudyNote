import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { register } from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

const RegisterPage = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await register({ email, password, displayName });
            login(res.user, res.token);
            navigate("/notes");
        } catch (err) {
            setError(err.response?.data?.message || "회원가입 오류");
        }
    };

    return (
        <div>
            <h2>회원가입</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="닉네임" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="submit">회원가입</button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
            <p>이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
        </div>
    );
};

export default RegisterPage;
