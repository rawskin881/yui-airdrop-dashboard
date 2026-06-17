import React from 'react';
import OTPLogin from '../components/OTPLogin';

interface LoginProps {
  requestOTP: (telegramId: string) => Promise<boolean>;
  verifyOTP: (telegramId: string, otp: string) => Promise<boolean>;
  verifyBotOTP: (otp: string) => Promise<boolean>;
  error: string | null;
  loading: boolean;
}

export const Login: React.FC<LoginProps> = ({
  requestOTP,
  verifyOTP,
  verifyBotOTP,
  error,
  loading
}) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 relative bg-gradient-to-tr from-yui-pink via-yui-purple to-yui-blue dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden transition-colors duration-300">
      
      {/* Decorative blurred background shapes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-pink-400/20 dark:bg-pink-900/10 blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-400/20 dark:bg-purple-900/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-10 right-10 w-48 h-48 rounded-full bg-blue-400/20 dark:bg-sky-950/10 blur-3xl"></div>

      {/* Login Card Wrapper */}
      <div className="relative z-10 w-full max-w-4xl">
        <OTPLogin
          requestOTP={requestOTP}
          verifyOTP={verifyOTP}
          verifyBotOTP={verifyBotOTP}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  );
};
export default Login;
