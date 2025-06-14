import { Clock, Gavel, Shield, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AdminLayout from '../../components/AdminLayout';

// Update the crimeStats data structure
const crimeStats = [
  { 
    title: 'Total Crime', 
    value: '40,689', 
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

// Add sample data
const crimeRecords = [
  { id: '#CR001', name: 'John Doe', address: 'Manila City', date: '2024-06-09', type: 'Theft', respondedBy: 'Off. Smith' },
  { id: '#CR002', name: 'Jane Smith', address: 'Quezon City', date: '2024-06-08', type: 'Assault', respondedBy: 'Off. Johnson' },
  { id: '#CR003', name: 'Mike Brown', address: 'Makati City', date: '2024-06-08', type: 'Robbery', respondedBy: 'Off. Davis' },
];

export default function Dashboard() {
  return (
    <AdminLayout>
      <ScrollView style={styles.container}>
        <Text style={styles.dashboardTitle}>Dashboard Overview</Text>
        
        {/* Stats Cards Container */}
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

        {/* Table */}
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>Recent Crime Reports</Text>
          
          {/* Table Headers */}
          <View style={[styles.tableRow, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerCell]}>ID</Text>
            <Text style={[styles.cell, styles.headerCell]}>Name</Text>
            <Text style={[styles.cell, styles.headerCell]}>Address</Text>
            <Text style={[styles.cell, styles.headerCell]}>Date</Text>
            <Text style={[styles.cell, styles.headerCell]}>Type</Text>
            <Text style={[styles.cell, styles.headerCell]}>Responded By</Text>
          </View>

          {crimeRecords.map((record, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.cell}>{record.id}</Text>
              <Text style={styles.cell}>{record.name}</Text>
              <Text style={styles.cell}>{record.address}</Text>
              <Text style={styles.cell}>{record.date}</Text>
              <Text style={styles.cell}>{record.type}</Text>
              <Text style={styles.cell}>{record.respondedBy}</Text>
            </View>
          ))}
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
    gap: 4,
    marginBottom: 32,
  },
  card: { 
    width: '20%', // Adjust based on your layout needs
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
    padding: 24,
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
  headerRow: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  headerCell: {
    fontWeight: '600',
    color: '#4a4a4a',
    fontSize: 14,
  },
  tableRow: { 
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  cell: { 
    flex: 1,
    fontSize: 14,
    color: '#666666',
    paddingHorizontal: 8,
  },
});