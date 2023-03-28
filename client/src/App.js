import './App.scss';
import Login from './components/Login/Login';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
            <Route path='/' element={<Login />}></Route>
        </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
