import AppRoutes from './routes/Routes'
import { SyncProvider } from './contexts/SyncContext'

function App() {
  return (
    <SyncProvider>
      <AppRoutes />
    </SyncProvider>
  )
}

export default App
