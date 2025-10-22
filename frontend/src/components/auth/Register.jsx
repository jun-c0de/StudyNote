import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { register } from "../../api/axios";
import { Link } from "react-router-dom"; // Link import

const Register = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submit data:", { email, password, displayName });

        try {
            const res = await register({ email, password, displayName });
            login(res.user, res.token);
        } catch (err) {
            console.error(err.response);
            setError(err.response?.data?.message || "회원가입 오류");
        }
    };

    return (
        <div>
            <h2>회원가입</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="닉네임"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                />
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
                <button type="submit">회원가입</button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>

            {/* 로그인 링크 추가 */}
            <p style={{ marginTop: "1rem" }}>
                이미 계정이 있으신가요?{" "}
                <Link to="/login" style={{ color: "blue", textDecoration: "underline" }}>
                    로그인
                </Link>
            </p>
        </div>
    );
};

export default Register;
