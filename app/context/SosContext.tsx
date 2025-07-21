import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export type SOSState = 'idle' | 'countdown' | 'active' | 'received' | 'arrived' | 'resolved';

interface SosContextType {
  sosState: SOSState;
  setSosState: React.Dispatch<React.SetStateAction<SOSState>>;
  location: Location.LocationObject | null;
  locationAddress: string;
  isRecording: boolean;
  isSendingSOS: boolean;
  countdown: number | null;
  setCountdown: React.Dispatch<React.SetStateAction<number | null>>;
  startSOS: () => Promise<void>;
  stopSOS: () => Promise<void>;
  startManualRecording: () => Promise<void>;
  stopManualRecording: () => Promise<void>;
}

const SosContext = createContext<SosContextType | undefined>(undefined);

export const SosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sosState, setSosState] = useState<SOSState>('idle');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('Fetching location...');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isSendingSOS, setIsSendingSOS] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [manualRecording, setManualRecording] = useState<Audio.Recording | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelCountdownRef = useRef(false);

  // Location logic (simplified)
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
        setLocation(loc);
        const addresses = await Location.reverseGeocodeAsync(loc.coords);
        if (addresses && addresses[0]) {
          const address = addresses[0];
          const formatted = [address.street, address.district, address.city].filter(Boolean).join(', ');
          setLocationAddress(formatted || 'Location found');
        }
      } catch {
        setLocationAddress('Location unavailable');
      }
    };
    getLocation();
  }, []);

  // SOS handlers (simplified)
  const startSOS = async () => {
    setIsSendingSOS(true);
    setSosState('countdown');
    setCountdown(3);
    for (let i = 3; i > 0; i--) {
      await new Promise(res => setTimeout(res, 1000));
      setCountdown(i - 1);
    }
    setSosState('active');
    setIsSendingSOS(false);
    // ...send alert, start polling, etc...
  };

  const stopSOS = async () => {
    setSosState('idle');
    setIsSendingSOS(false);
    setCountdown(null);
    // ...stop polling, stop recording, etc...
  };

  // Recording handlers (simplified)
  const startManualRecording = async () => {
    setIsRecording(true);
    const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    setManualRecording(recording);
  };
  const stopManualRecording = async () => {
    if (!manualRecording) return;
    await manualRecording.stopAndUnloadAsync();
    setManualRecording(null);
    setIsRecording(false);
  };

  return (
    <SosContext.Provider value={{
      sosState, setSosState, location, locationAddress, isRecording, isSendingSOS, countdown, setCountdown,
      startSOS, stopSOS, startManualRecording, stopManualRecording
    }}>
      {children}
    </SosContext.Provider>
  );
};

export const useSos = () => {
  const context = useContext(SosContext);
  if (!context) throw new Error('useSos must be used within a SosProvider');
  return context;
}; 