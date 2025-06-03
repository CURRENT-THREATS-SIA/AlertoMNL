import { useLocalSearchParams } from 'expo-router';
import HistoryContent from '../HistoryContent';

export default function HistoryDetail() {
  const { id } = useLocalSearchParams();
  return <HistoryContent />;
} 