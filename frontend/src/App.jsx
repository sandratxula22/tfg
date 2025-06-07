import { Outlet } from 'react-router-dom';
import Header from './components/Header/HeaderComponent';
import Footer from './components/Footer/FooterComponent';

function App() {
    return (
        <div className="d-flex flex-column min-vh-100 App">
            <Header></Header>
            <div className="flex-grow-1">
                <Outlet></Outlet>
            </div>
            <Footer></Footer>
        </div>
    );
}

export default App;