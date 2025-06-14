import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import MyNav from './components/Nav.jsx';
import Register from './components/modals/Register.jsx';
import Login from './components/modals/Login.jsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Movies from './pages/Movies.jsx';
import People from './pages/People.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {

  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const toggleRegister = () => setRegisterOpen(!registerOpen);
  const toggleLogin = () => setLoginOpen(!loginOpen);

  return (
    <>
      <Router>
        <div>
          <h1>movie browser</h1>
          <div>
            <MyNav toggleRegister={toggleRegister} toggleLogin={toggleLogin}/>
          </div>
          <Register isOpen={registerOpen} toggle={toggleRegister}/>
          <Login isOpen={loginOpen} 
                  toggle={toggleLogin} />
        </div>
        <div style={{ padding: '15px' }}>
          <Routes>
              <Route path="/" element={<Home/>} />
              <Route path="/movies" element={<Movies/>} />
              <Route path="/movies/:id" element={<Movies/>} />
              <Route path="/people/:id" element={<People/>} />
              <Route path="*" element={<NotFound/>} />
          </Routes>
        </div>
        <div>
          <p className="info">
            Jayden Weaver - n10807144 - April 2025
          </p>
        </div>
      </Router>
    </>
  );
};

export const API_URL = 'http://4.237.58.241:3000';
export default App
