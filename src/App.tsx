import { ToastProvider } from './context/ToastContext';
import { ReaderPage } from './pages/ReaderPage';

export default function App() {
  return (
    <ToastProvider>
      <ReaderPage />
    </ToastProvider>
  );
}
