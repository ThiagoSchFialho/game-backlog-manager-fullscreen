import AppRoutes from './routes/Routes'
import { SyncProvider } from './contexts/SyncContext'
import Header from './components/Header/Header'

function App() {
  return (
    <SyncProvider>
      <Header />
        <div className="main-container">
          <AppRoutes />
        </div>
    </SyncProvider>
  )
}

export default App
