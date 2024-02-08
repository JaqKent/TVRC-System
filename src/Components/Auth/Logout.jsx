import React, { useEffect } from 'react';
import { notify } from 'react-notify-toast';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();
  console.log(navigate);

  useEffect(() => {
    console.log('Logout component mounted');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    notify.show('Te has deslogueado con éxito!', 'success');
    navigate('/');
    return () => console.log('Logout component unmounted');
  }, [navigate]);

  return (
    <div>
      <h1>Cerrando sesión...</h1>
    </div>
  );
}

export default Logout;
