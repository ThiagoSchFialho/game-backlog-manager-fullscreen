import { HashRouter } from 'react-router-dom';
import AppRoutes from './routes/Routes'
import Header from './components/Header/Header'
import { useDb } from './hooks/useDb';
import { useEffect } from 'react';

function App() {
  const { syncPlaytime,syncRtimeLastPlayed } = useDb();

  useEffect(() => {
    const sync = async () => {
      await syncPlaytime();
      await syncRtimeLastPlayed();
    };

    void sync();
  }, []);
  
  return (
    <HashRouter>
      <Header />
      <AppRoutes />
    </HashRouter>
  )
}

export default App