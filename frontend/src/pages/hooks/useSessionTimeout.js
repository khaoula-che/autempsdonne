import { useEffect } from 'react';

function logoutUser() {
  localStorage.removeItem('accessToken');
  window.location.href = '/login';
}

export const useSessionTimeout = (timeout = 3600000) => {  
  useEffect(() => {
    const events = ['click', 'load', 'keydown'];
    let timer = setTimeout(logoutUser, timeout);

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(logoutUser, timeout);
    };

    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [timeout]);
};
