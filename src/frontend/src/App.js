import logo from './logo.svg';
import './App.css';
import Counter from './learning';
import AboutLove from './about';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import CityBanner from './sahayak';
import HeroSection from './home_page';
import CityPage from './cityPage';
import ServiceProviderPage from './serviceProvider';
import TaskForm from './taskForm';
import CheckoutPage from './checkout';
import MyBookingsPage from './myBookings';
import Header from './header';


function App() {
  const headers = {
    home: {
      title: "SAHAYAK",
      buttons: [
        { label: 'About', path:'/#about'},
        { label: 'services', path: '/#services'},
        { label: 'contact', path: '/#contact'},
        { label: 'Me', path: '/my_bookings' }
      ]
    },
    service_providers: {
      title: "",
      buttons: []

    },
    other: {
      title: "Pay to Sahayak",
      buttons: [
        { label: 'Home', path: '/' },
        { label: 'Contact Us', path: '/contact' },
        { label: 'Support', path: '/support' }
      ]
    }
  };
  return (
    <div className="App">
      
      <Router>
        <Routes>
        <Route path="/" element={ <>
        <Header title={headers.home.title} links={headers.home.buttons}/>
        <HeroSection />
           </>} />
        // dynamic page 
        <Route path="/service/:id" element={<>
              <Header title={headers.home.title} links={headers.home.buttons} />
              <TaskForm />
            </> } />
        <Route path="/service_providers" element={<>
          <Header title={headers.home.title} links={headers.home.buttons}/>
          <ServiceProviderPage/>
          </>}  />
        <Route path="/checkout" element={<CheckoutPage/>}/>
        <Route path="/my_bookings" element={<>
        <Header title={headers.home.title} links={headers.home.buttons}/>
        <MyBookingsPage />
           </>}></Route>
      </Routes>
      </Router>

    </div>
    
  );
}

export default App;
