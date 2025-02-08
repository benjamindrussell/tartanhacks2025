import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RootLayout } from './layouts/RootLayout'
import { Home } from './pages/Home'
import { Workflows } from './pages/Workflows'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="workflows" element={<Workflows />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
