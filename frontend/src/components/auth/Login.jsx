import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/auth/login", { email, password });
            login(res.data.user, res.data.token);
        } catch (err) {
            setError(err.response?.data?.message || "로그인 오류");
        }
    };

    return (
        <div>
            <h2>로그인</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">로그인</button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>

            <p>
                계정이 없으신가요?{" "}
                <Link to="/register">
                    회원가입
                </Link>
            </p>
        </div>
    );
};

export default Login;
