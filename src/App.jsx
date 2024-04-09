import React from 'react';
import { Container } from 'react-bootstrap';
import Notifications from 'react-notify-toast';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import moment from 'moment';
import 'moment/locale/es';

import Home from './Components/Home';
import NavigationBar from './Components/Layout/NavigationBar';
import Login from './Components/Auth/Login';
import Logout from './Components/Auth/Logout';
import ListClientsBaja from './Components/Clients/ListClientsBaja';
import DetailClients from './Components/Clients/DetailClients';
import BillScreen from './Components/Bills/BillScreens';
import PhysicalBill from './Components/Bills/Printing/PhisicalBill';
import BatchPrinting from './Components/Bills/Printing/BatchPrinting';
import ListClients from './Components/Clients/ListClients';
import './styles/main.css';
import UserBill from './Components/UserSide/UserBill';

moment.locale('es');

function App() {
  const token = localStorage.getItem('token');

  return (
    <>
      <Notifications options={{ zIndex: 9000 }} />
      <Router>
        <NavigationBar token={token} />
        <Container>
          <Routes>
            {/* Auth routes */}
            <Route path='/login' element={<Login />} />
            <Route path='/logout' element={<Logout />} />
            <Route path='/' element={<Home />} />

            {/* Client routes */}
            <Route path='/clients/list' element={<ListClients />} />
            <Route path='/clients/list-baja' element={<ListClientsBaja />} />
            <Route path='/clients/details/:id' element={<DetailClients />} />

            {/* Bills routes */}
            <Route path='/bills/list/' element={<BillScreen />} />
            <Route path='/bills/print/:id' element={<PhysicalBill />} />

            <Route path='/bills/printAll' element={<BatchPrinting />} />

            {/*User PDF Bill*/}
            <Route path='/userBill/:id' element={<UserBill />} />
          </Routes>
        </Container>
      </Router>
    </>
  );
}

export default App;
