import { HashRouter } from 'react-router-dom';
import AppRoutes from './routes/Routes'
import Header from './components/Header/Header'

function App() {
  return (
    <HashRouter>
      <Header />
      <div className="main-container">
        <AppRoutes />
      </div>
    </HashRouter>
  )
}

export default App