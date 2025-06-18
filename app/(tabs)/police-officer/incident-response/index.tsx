import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function IncidentResponseIndex() {
  const router = useRouter();
  const { alert_id } = useLocalSearchParams();

  useEffect(() => {
    if (alert_id) {
      router.replace({
        pathname: '/police-officer/incident-response/MapStep',
        params: { alert_id: String(alert_id) }
      });
    }
  }, [alert_id, router]);

  return null;
}