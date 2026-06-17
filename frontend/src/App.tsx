import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const { 
    user, 
    isAuthenticated, 
    requestOTP, 
    verifyOTP, 
    verifyBotOTP, 
    error, 
    loading, 
    authLoading,
    logout 
  } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-tr from-yui-pink/20 via-yui-purple/20 to-yui-blue/20 dark:from-slate-950 dark:to-slate-900">
        <div className="w-12 h-12 border-4 border-yui-pink-dark border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 italic animate-pulse">
          🌸 Yui sedang mempersiapkan halaman login...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Login
        requestOTP={requestOTP}
        verifyOTP={verifyOTP}
        verifyBotOTP={verifyBotOTP}
        error={error}
        loading={authLoading}
      />
    );
  }

  return (
    <Dashboard 
      user={user} 
      logout={logout} 
    />
  );
}

export default App;
