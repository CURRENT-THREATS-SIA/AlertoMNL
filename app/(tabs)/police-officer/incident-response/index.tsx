import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function IncidentResponseIndex() {
  const router = useRouter();
  const { alert_id } = useLocalSearchParams();

  useEffect(() => {
    if (alert_id) {
      router.replace(`/police-officer/incident-response/MapStep?alert_id=${alert_id}`);
    }
  }, [alert_id]);

  return null;
} 