import { useState, useContext } from "react";
import { login as apiLogin } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await apiLogin({ email, password });
            login(res.user, res.token);
            navigate("/notes");
        } catch (err) {
            setError(err.response?.data?.message || "로그인 실패");
        }
    };

    return (
        <div>
            <h2>로그인</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="submit">로그인</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default LoginPage;
