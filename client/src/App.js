import './App.scss';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login/Login';
import ChatRoom from './components/ChatRoom/ChatRoom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
            <Route path='/' element={<ChatRoom />}></Route>
        </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
