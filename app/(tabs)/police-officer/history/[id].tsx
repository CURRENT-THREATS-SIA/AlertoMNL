import { useLocalSearchParams } from 'expo-router';
import React from 'react';
// This imports the component from the parent directory
import HistoryContent from '../HistoryContent';

export default function HistoryDetailPage() {
  const { id } = useLocalSearchParams();
  
  // Expo router can sometimes pass the id as an array, this ensures it's a single value
  const historyId = Array.isArray(id) ? id[0] : id;

  // Render the actual content screen, passing the id as a prop
  return <HistoryContent historyId={historyId} />;
}
