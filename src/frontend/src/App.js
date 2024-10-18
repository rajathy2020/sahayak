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


function App() {
  return (
    <div className="App">
      {/*<Counter/>*/}
      <Router>
        <Routes>
        <Route path="/" element={<HeroSection />} />
        // dynamic page 
        <Route path="/service/:id" element={<TaskForm />} />
        <Route path="/city/:city" element={<CityPage />} />
        <Route path="/service_providers" element={<ServiceProviderPage/>}  />
      </Routes>
      </Router>

    </div>
    
  );
}

export default App;
