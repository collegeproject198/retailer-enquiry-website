import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Sidebar from "../src/components/Sidebaar";
import DealerForm from "./pages/DealerForm";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Attendance from "./pages/Attendents";
import Tracker from "./pages/Tracker";

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto flex flex-col">
          <main className="p-4 md:p-6 flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dealer-form" element={<DealerForm />} />
              <Route path="/tracker" element={<Tracker />} />
              <Route path="/history" element={<History />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/attendance" element={<Attendance />} />
            </Routes>
          </main>
          <footer className="p-2 text-center text-xs text-gray-500 border-t">
            Powered By-{" "}
            <a
              href="https://www.botivate.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline"
            >
              Botivate
            </a>
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;
