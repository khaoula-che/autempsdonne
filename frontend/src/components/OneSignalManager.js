import { useEffect } from 'react';

const OneSignalManager = () => {
  useEffect(() => {
    const OneSignal = window.OneSignal || [];
    OneSignal.push(function() {
      OneSignal.init({
        appId: "7d113a0f-985f-4f5e-a56a-313a98c193e7",
        safari_web_id: "web.onesignal.auto.458f9dc8-6677-4788-b5a2-9d66a9d7a179",
        notifyButton: {
          enable: true,
        },
      });
    });
  }, []);

  return null;  // Pas de rendu visuel
};

export default OneSignalManager;
