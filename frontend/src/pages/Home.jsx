import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import authAPI from "../api/authAPI";
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection



export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [loginForm, setLoginForm] = useState({
    emailOrPhone: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
  });

  const navigate = useNavigate(); // Initialize navigate for redirection

const handleLoginSubmit = async () => {
  try {
    const identifier = loginForm.emailOrPhone.trim();
    const password = loginForm.password;

    // KIỂM TRA RỖNG
    if (!identifier || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ email/số điện thoại và mật khẩu!');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    console.log('Gửi login:', { identifier, password }); // DEBUG

    const res = await authAPI.login({
      identifier,
      password,
    });

    const { token, user } = res.data;
    localStorage.setItem('token', token);
    console.log('Đăng nhập thành công:', user);

    if (user.role === 'admin') {
      navigate('/admin/homee');
    } else {
      navigate('/notfound');
    }

  } catch (err) {
    console.error('Login error:', err.response?.data);
    setErrorMessage(
      err.response?.data?.message || 'Đăng nhập thất bại! Vui lòng thử lại.'
    );
    setTimeout(() => setErrorMessage(''), 3000);
  }
};


  const handleRegisterSubmit = async () => {
  try {
    const payload = {
      name: registerForm.fullName,  // map lại nếu backend dùng name
      username: registerForm.username,
      email: registerForm.email,
      phone: registerForm.phone,
      password: registerForm.password,
    };

    const res = await authAPI.register(payload);
    console.log(res.data);
    setSuccessMessage('Đăng ký thành công! Vui lòng đăng nhập.');
    setActiveTab('login');
    setTimeout(() => setSuccessMessage(''), 3000);
  } catch (err) {
    console.error("❌ Register error:", err.response?.data || err.message);
    setErrorMessage('Đăng ký thất bại! Vui lòng thử lại.');
    setTimeout(() => setErrorMessage(''), 3000);
  }
};


  const handleGoogleLogin = () => {
    console.log('Đăng nhập bằng Google');
  };

  const handleFacebookLogin = () => {
    console.log('Đăng nhập bằng Facebook');
  };

  return (
    <>
      <div
        className="min-h-screen bg-cover bg-center flex flex-col justify-center items-center p-4"
        style={{ backgroundImage: "url('/src/assets/banner-lookbook.jpg')" }}
      >
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
          {/* ✅ Thông báo thành công / lỗi */}
          {successMessage && (
            <div className="mb-3 p-2 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm text-center">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
              {errorMessage}
            </div>
          )}

          {/* ✅ Tabs */}
          <div className="flex mb-6 relative">
            {['login', 'register'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 pb-2 text-lg font-medium transition-all duration-300 ${
                  activeTab === tab ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {tab === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            ))}
            <div
              className="absolute bottom-0 h-0.5 bg-gray-900 transition-all duration-300 ease-out"
              style={{
                width: '50%',
                left: activeTab === 'login' ? '0%' : '50%',
              }}
            />
          </div>

          {/* ✅ Form Đăng Nhập */}
          {activeTab === 'login' && (
            <div className="space-y-4 transition-all duration-300">
              <input
                type="text"
                value={loginForm.emailOrPhone}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, emailOrPhone: e.target.value })
                }
                className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:border-gray-400 focus:outline-none text-gray-900 placeholder-gray-400"
                placeholder="Email hoặc số điện thoại"
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:border-gray-400 focus:outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="text-right">
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  Quên mật khẩu?
                </button>
              </div>

              <button
                onClick={handleLoginSubmit}
                className="w-full bg-rose-400 hover:bg-rose-500 text-white font-medium py-2 rounded-full transition"
              >
                Đăng Nhập
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-gray-600 text-sm">Hoặc</span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleGoogleLogin}
                  className="w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <img
                    src="https://www.svgrepo.com/show/355037/google.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                </button>

                <button
                  onClick={handleFacebookLogin}
                  className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center shadow-md"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073C24 5.373 18.627 0 12 0S0 5.373 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ✅ Form Đăng Ký */}
          {activeTab === 'register' && (
            <div className="space-y-4 transition-all duration-300">
              {[
                { label: 'Họ và tên', key: 'fullName', type: 'text' },
                { label: 'Tên đăng nhập', key: 'username', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Số điện thoại', key: 'phone', type: 'tel' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={registerForm[field.key]}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        [field.key]: e.target.value,
                      })
                    }
                    className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:border-gray-400 focus:outline-none text-gray-900 placeholder-gray-400"
                    placeholder={`Nhập ${field.label.toLowerCase()}`}
                  />
                </div>
              ))}

              <div className="relative">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Mật khẩu
                </label>
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value,
                    })
                  }
                  className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:border-gray-400 focus:outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowRegisterPassword(!showRegisterPassword)
                  }
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showRegisterPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              <button
                onClick={handleRegisterSubmit}
                className="w-full bg-rose-400 hover:bg-rose-500 text-white font-medium py-2 rounded-full transition"
              >
                Đăng ký
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}