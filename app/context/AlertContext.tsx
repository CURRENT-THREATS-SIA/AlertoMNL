import { Audio } from 'expo-av';
import React, { createContext, useCallback, useContext, useState } from 'react';

const AlertContext = createContext(null);

export const AlertProvider = ({ children }: any) => {
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [currentAlertId, setCurrentAlertId] = useState<number | null>(null);
  const [soundObject, setSoundObject] = useState<Audio.Sound | null>(null);

  const showAlert = useCallback(async (alertId: number) => {
    if (alertId === currentAlertId) return;
  
    setCurrentAlertId(alertId);
    setIsAlertVisible(true);
  
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/EMERGENCY.mp3'),
        { shouldPlay: true, isLooping: true } // 🔁 Loop until dismissed
      );
      setSoundObject(sound);
    } catch (error) {
      console.error('Failed to play alert sound:', error);
    }
  }, [currentAlertId]);
  

  const hideAlert = useCallback(async () => {
    setIsAlertVisible(false);
    setCurrentAlertId(null);

    if (soundObject) {
      try {
        await soundObject.stopAsync();
        await soundObject.unloadAsync();
        setSoundObject(null);
      } catch (error) {
        console.error('Failed to stop/unload sound:', error);
      }
    }
  }, [soundObject]);

  return (
    <AlertContext.Provider value={{ isAlertVisible, showAlert, hideAlert, currentAlertId }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);