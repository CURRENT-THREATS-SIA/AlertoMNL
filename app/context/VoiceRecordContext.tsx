import React, { createContext, useContext, useState } from 'react';

export interface VoiceRecord {
  id: string;
  title: string;
  duration: string;
  date: string;
  uri: string;
}

interface VoiceRecordContextType {
  records: VoiceRecord[];
  addRecord: (record: VoiceRecord) => void;
}

const VoiceRecordContext = createContext<VoiceRecordContextType | undefined>(undefined);

export function VoiceRecordProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<VoiceRecord[]>([]);

  const addRecord = (record: VoiceRecord) => {
    setRecords(prevRecords => [record, ...prevRecords]);
  };

  return (
    <VoiceRecordContext.Provider value={{ records, addRecord }}>
      {children}
    </VoiceRecordContext.Provider>
  );
}

export function useVoiceRecords() {
  const context = useContext(VoiceRecordContext);
  if (context === undefined) {
    throw new Error('useVoiceRecords must be used within a VoiceRecordProvider');
  }
  return context;
}

export default VoiceRecordProvider; 