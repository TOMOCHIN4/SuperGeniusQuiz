import { Routes, Route } from 'react-router-dom';
import { Layout, AuthGuard } from '@/components/layout';
import { AuthProvider } from '@/contexts';
import { Login } from '@/features/login';
import { Dashboard } from '@/features/dashboard';
import { BookSelect } from '@/features/books';
import { Quiz } from '@/features/quiz';
import { Result } from '@/features/result';
import { History } from '@/features/history';
import { Settings } from '@/features/settings';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ログイン画面（認証不要） */}
        <Route path="/login" element={<Login />} />

        {/* 認証が必要なルート */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="books" element={<BookSelect />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="result" element={<Result />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
