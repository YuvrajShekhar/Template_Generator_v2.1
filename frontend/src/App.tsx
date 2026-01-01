import './App.css'
import { Link, Route, Routes } from 'react-router-dom';
import DocManager_Main from './pages/docManager/docManager_main';
import DocValidator_Main from './pages/docValidator/docValidator_main';


function App() {
  return (
    <>
      <nav>
        <Link to="/docManager">docManager</Link>
        <Link to="/docValidator">docValidator</Link>
      </nav>
      <Routes>
        <Route path="/docManager" element={<DocManager_Main />} />
        <Route path="/docManager/:filename" element={<DocManager_Main />} />
        <Route path="/docManager/:filename/:provider" element={<DocManager_Main />} />
        <Route path="/docValidator" element={<DocValidator_Main />} />
      </Routes>
    </>
  )
}

export default App
