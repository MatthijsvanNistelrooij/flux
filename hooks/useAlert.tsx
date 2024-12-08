import { useState } from 'react';

const useAlert = () => {
  const [alert, setAlert] = useState({ show: false, text: '', type: 'danger' });

  const showAlert = ({ text, type = 'danger', show } : {text: string, type: string, show: boolean}) => setAlert({ show: true, text, type });
  const hideAlert = ({ show } : { show: boolean}) => setAlert({ show: false, text: '', type: 'danger' });

  return { alert, showAlert, hideAlert };
};

export default useAlert;
