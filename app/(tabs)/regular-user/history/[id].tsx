import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import HistoryContent from '../HistoryContent';

export default function HistoryDetail() {
  const { id } = useLocalSearchParams();
  return <HistoryContent historyId={id as string} />;
} 