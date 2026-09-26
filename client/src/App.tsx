import { HashRouter } from 'react-router-dom';
import AppRoutes from './routes/Routes'
import Header from './components/Header/Header'

function App() {
  return (
    <HashRouter>
      <Header />
      <AppRoutes />
    </HashRouter>
  )
}

export default App