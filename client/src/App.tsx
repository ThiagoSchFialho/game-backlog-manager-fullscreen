import AppRoutes from './routes/Routes'
import Header from './components/Header/Header'

function App() {
  return (
    <>
      <Header />
      <div className="main-container">
        <AppRoutes />
      </div>
    </>
  )
}

export default App
