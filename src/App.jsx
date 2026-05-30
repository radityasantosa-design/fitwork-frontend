import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/layout/Layout"
import Dashboard from "./pages/Dashboard"
import HealthMonitor from "./pages/HealthMonitor"
import AIAdvisor from "./pages/AIAdvisor"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="health-monitor" element={<HealthMonitor />} />
          <Route path="ai-advisor" element={<AIAdvisor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

