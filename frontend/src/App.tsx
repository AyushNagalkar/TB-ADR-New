import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Welcome } from './pages/Welcome';
import { Auth } from './pages/Auth';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Checkin } from './pages/Checkin';
import { Assessment } from './pages/Assessment';
import { Guidance } from './pages/Guidance';
import { Schedule } from './pages/Schedule';
import { Emergency } from './pages/Emergency';
import { Settings } from './pages/Settings';
import { RAGGuide } from './pages/RAGGuide';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages — no sidebar/header layout */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Authenticated pages — with AppLayout (sidebar + header) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/assessment/:id" element={<Assessment />} />
          <Route path="/guidance" element={<Guidance />} />
          <Route path="/rag-guide" element={<RAGGuide />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
