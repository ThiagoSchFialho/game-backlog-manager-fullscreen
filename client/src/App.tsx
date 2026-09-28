import { HashRouter } from 'react-router-dom';
import AppRoutes from './routes/Routes'
import Header from './components/Header/Header'
import { useDb } from './hooks/useDb';
import { useEffect, useState } from 'react';

function App() {
  const { syncPlaytime, syncRtimeLastPlayed } = useDb();
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const sync = async () => {
      try {
        await Promise.all([syncPlaytime(), syncRtimeLastPlayed()]);
      } finally {
        setSynced(true);
      }
    };

    void sync();
  }, []);

  return (
    <HashRouter>
      <Header />
      {synced ? <AppRoutes /> : <p>Sincronizando com a Steam...</p>}
    </HashRouter>
  )
}

export default App