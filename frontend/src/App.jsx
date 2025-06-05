import { Outlet } from 'react-router-dom';
import Header from './components/Header/HeaderComponent';
import Footer from './components/Footer/FooterComponent';

function App() {
    return (
        <div className="App">
            <Header></Header>
            <Outlet></Outlet>
            <Footer></Footer>
        </div>
    );
}

export default App;