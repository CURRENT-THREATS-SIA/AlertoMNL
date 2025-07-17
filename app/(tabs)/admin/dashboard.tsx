// THE FIX: ActivityIndicator is now correctly imported from 'react-native'.
import { Clock, Gavel, Shield, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import AdminLayout from '../../components/AdminLayout';

// The interface for a single crime record
interface CrimeRecord {
    alertId: string;
    name: string | null;
    address: string | null;
    date: string;
    type: string | null;
    severity: string | null;
    respondedBy: string;
    status?: string | null; // Add status field
}

// Helper functions for formatting data
const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        // Parse the date string as UTC, then convert to PH time
        const date = new Date(dateString.replace(' ', 'T') + 'Z');
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleString('en-PH', {
            timeZone: 'Asia/Manila',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    } catch {
        return 'N/A';
    }
};

const formatAddress = (address: string | null) => {
    if (!address) return 'N/A';
    const parts = address.split(',');
    return parts.slice(0, 2).join(',').trim();
};

export default function Dashboard() {
    const [recentCrimes, setRecentCrimes] = useState<CrimeRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resolvedCount, setResolvedCount] = useState<number>(0); // New state for total resolved crimes

    useEffect(() => {
        const fetchRecentCrimes = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch('http://mnl911.atwebpages.com/fetch_crime_data.php');
                if (!res.ok) throw new Error('Failed to fetch data');

                const json = await res.json();
                if (json.success && Array.isArray(json.records)) {
                    // 1. Sort records by date to get the most recent ones first
                    const sortedRecords = json.records.sort((a: CrimeRecord, b: CrimeRecord) => {
                         // Replace space with 'T' for robust date parsing
                        const dateA = new Date(a.date.replace(' ', 'T')).getTime();
                        const dateB = new Date(b.date.replace(' ', 'T')).getTime();
                        return dateB - dateA;
                    });
                    
                    // 2. THE FIX: Remove duplicates by alertId, keeping the most recent entry
                    const uniqueRecords = Array.from(
                        new Map(sortedRecords.map((record: CrimeRecord) => [record.alertId, record])).values()
                    ) as CrimeRecord[];
                    
                    // 3. Set the state with the top 5 most recent unique crimes
                    setRecentCrimes(uniqueRecords.slice(0, 5));

                    // Set resolved count from backend
                    setResolvedCount(json.resolvedCount || 0);
                } else {
                    throw new Error(json.message || 'Invalid data format');
                }
            } catch (err: any) {
                setError(err.message);
                console.error("Fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecentCrimes();
    }, []);

    const BASE_TOTAL_CRIME = 40689; // your static base value

    // Use BASE_TOTAL_CRIME + resolvedCount for Total Crime stat
    const crimeStats = [
        { 
            title: 'Total Crime', 
            value: (BASE_TOTAL_CRIME + resolvedCount).toLocaleString(), // base + new resolved
            period: 'from 2021 to present', 
            icon: <Shield size={24} color="#e02323" />, 
            bgColor: '#fff' 
        },
        { 
            title: 'Highest Crime', 
            value: 'Theft', 
            period: 'from 2021 to present',
            icon: <TrendingUp size={24} color="#e02323" />,
            bgColor: '#FFF9E7'
        },
        { 
            title: 'Index', 
            value: '84.41%', 
            period: 'from 2021 to present',
            icon: <Gavel size={24} color="#e02323" />,
            bgColor: '#F0FDF4'
        },
        { 
            title: 'Non-Index', 
            value: '505.40%', 
            period: 'from 2021 to present',
            icon: <Clock size={24} color="#e02323" />,
            bgColor: '#FFF1F2'
        },
    ];

    return (
        <AdminLayout>
            <ScrollView style={styles.container}>
                <Text style={styles.dashboardTitle}>Dashboard Overview</Text>
                
                <View style={styles.statsWrapper}>
                    {crimeStats.map((stat, index) => (
                        <View key={index} style={[styles.card, { backgroundColor: stat.bgColor }]}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.statTitle}>{stat.title}</Text>
                                <View style={styles.iconContainer}>
                                    {stat.icon}
                                </View>
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statPeriod}>{stat.period}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.tableCard}>
                    <Text style={styles.tableTitle}>Recent Crime Reports</Text>
                    
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, { flex: 1.5 }]}>ALERT ID</Text>
                        <Text style={[styles.headerCell, { flex: 2 }]}>NAME</Text>
                        <Text style={[styles.headerCell, { flex: 3 }]}>ADDRESS</Text>
                        <Text style={[styles.headerCell, { flex: 3 }]}>DATE</Text>
                        <Text style={[styles.headerCell, { flex: 2 }]}>TYPE</Text>
                        <Text style={[styles.headerCell, { flex: 2 }]}>RESPONDED BY</Text>
                        <Text style={[styles.headerCell, { flex: 1.5 }]}>STATUS</Text>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator style={{ marginVertical: 20 }} size="large" color="#e02323" />
                    ) : error ? (
                        <Text style={styles.errorText}>Error: {error}</Text>
                    // THE FIX: Check if recentCrimes array is empty and display a message
                    ) : recentCrimes.length === 0 ? (
                        <Text style={styles.noDataText}>No recent crime reports found.</Text>
                    ) : (
                        recentCrimes.map((record, index) => (
                            // Using record.alertId as the key is now safe because we have removed duplicates
                            <View key={record.alertId} style={[styles.tableRow, index === recentCrimes.length -1 && styles.lastRow]}>
                                <Text style={[styles.cell, { flex: 1.5 }]}>{record.alertId}</Text>
                                <Text style={[styles.cell, { flex: 2 }]}>{record.name || 'N/A'}</Text>
                                <Text style={[styles.cell, { flex: 3 }]}>{formatAddress(record.address)}</Text>
                                <Text style={[styles.cell, { flex: 3 }]}>{formatDate(record.date)}</Text>
                                <Text style={[styles.cell, { flex: 2 }]}>{record.type || 'N/A'}</Text>
                                <Text style={[styles.cell, { flex: 2 }]}>{record.respondedBy}</Text>
                                <Text style={[styles.cell, { flex: 1.5 }]}>{
    record.status
        ? (record.status.toLowerCase() === 'resolved' ? 'Responded' : record.status.charAt(0).toUpperCase() + record.status.slice(1))
        : 'N/A'
}</Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    dashboardTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 24,
        marginTop: 8,
    },
    statsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 32,
    },
    card: { 
        flex: 1,
        minWidth: 280,
        borderRadius: 16,
        padding: 24,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 3,
    },
    cardHeader: { 
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(224, 35, 35, 0.1)',
    },
    statTitle: { 
        fontSize: 16,
        fontWeight: '600',
        color: '#4a4a4a',
    },
    statValue: { 
        fontSize: 32,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    statPeriod: { 
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    tableCard: { 
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 16,
        elevation: 3,
    },
    tableTitle: { 
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 24,
    },
    tableHeader: { 
        flexDirection: 'row', 
        backgroundColor: '#fcfcfc', 
        paddingVertical: 16, 
        paddingHorizontal: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: '#eee' 
    },
    headerCell: { 
        fontSize: 12, 
        fontWeight: '600', 
        color: '#666', 
        paddingHorizontal: 4, 
        textAlign: 'center' 
    },
    tableRow: { 
        flexDirection: 'row', 
        paddingVertical: 16, 
        paddingHorizontal: 16, 
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    lastRow: {
        borderBottomWidth: 0,
    },
    cell: { 
        fontSize: 14, 
        color: '#444', 
        paddingHorizontal: 4, 
        textAlign: 'center' 
    },
    errorText: {
        textAlign: 'center',
        padding: 20,
        color: '#e02323',
        fontWeight: '500',
    },
    // Style for the "no data" message
    noDataText: {
        textAlign: 'center',
        paddingVertical: 32,
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
    }
});
