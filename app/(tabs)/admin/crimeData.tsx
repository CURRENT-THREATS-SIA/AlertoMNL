import { ChevronDown, Filter, RefreshCw, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AdminLayout from '../../components/AdminLayout';


// Add filter options
const crimeTypes = [
  'All Types',
  'Theft',
  'Robbery',
  'Assault',
  'Burglary',
  'Vandalism'
];

const severityLevels = [
  'All Severities',
  'Low',
  'Medium',
  'High',
];

// Update the interface
interface CrimeRecord {
  alertId: string;
  name: string;
  address: string;
  date: string;
  type: string;
  severity: string;
  respondedBy: string;
}

// Update the sample data
const crimeRecords: CrimeRecord[] = [
  {
    alertId: 'ALT001',
    name: 'John Doe',
    address: 'Manila City',
    date: '2024-06-09',
    type: 'Theft',
    severity: 'Medium',
    respondedBy: 'Off. Smith'
  },
  // Add more records as needed
];

// Add states in component
export default function CrimeData() {
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showSeverityModal, setShowSeverityModal] = useState(false);
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedSeverity, setSelectedSeverity] = useState('All Severities');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AdminLayout>
      <ScrollView style={styles.container}>
        {/* Update Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Crime Data Overview</Text>
            <View style={styles.searchContainer}>
              <Search size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        </View>

        {/* Filter and Export Section */}
        <View style={styles.filterContainer}>
          <View style={styles.filterGroup}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowTypeModal(true)}
            >
              <Filter width={16} height={16} color="#666" />
              <Text style={styles.filterButtonText}>{selectedType}</Text>
              <ChevronDown width={16} height={16} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowSeverityModal(true)}
            >
              <Filter width={16} height={16} color="#666" />
              <Text style={styles.filterButtonText}>{selectedSeverity}</Text>
              <ChevronDown width={16} height={16} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton}>
              <RefreshCw width={18} height={18} color="#e02323" />
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.exportGroup}>
            <TouchableOpacity style={styles.exportButton}>
              <Text style={styles.exportButtonText}>Export to Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton}>
              <Text style={styles.exportButtonText}>Export to PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Table */}
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.alertIdColumn]}>ALERT ID</Text>
            <Text style={[styles.headerCell, styles.nameColumn]}>NAME</Text>
            <Text style={[styles.headerCell, styles.addressColumn]}>ADDRESS</Text>
            <Text style={[styles.headerCell, styles.dateColumn]}>DATE</Text>
            <Text style={[styles.headerCell, styles.typeColumn]}>TYPE</Text>
            <Text style={[styles.headerCell, styles.severityColumn]}>CRIME SEVERITY</Text>
            <Text style={[styles.headerCell, styles.respondedByColumn]}>RESPONDED BY</Text>
          </View>

          {/* Table Content */}
          <FlatList
            data={crimeRecords}
            keyExtractor={(item) => item.alertId}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={[styles.cell, styles.alertIdColumn]}>{item.alertId}</Text>
                <Text style={[styles.cell, styles.nameColumn]}>{item.name}</Text>
                <Text style={[styles.cell, styles.addressColumn]}>{item.address}</Text>
                <Text style={[styles.cell, styles.dateColumn]}>{item.date}</Text>
                <Text style={[styles.cell, styles.typeColumn]}>{item.type}</Text>
                <Text style={[styles.cell, styles.severityColumn]}>{item.severity}</Text>
                <Text style={[styles.cell, styles.respondedByColumn]}>{item.respondedBy}</Text>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>

        {/* Pagination */}
        <View style={styles.pagination}>
          <Text style={styles.paginationText}>
            Showing 1-{crimeRecords.length} of {crimeRecords.length}
          </Text>
          <View style={styles.paginationControls}>
            <TouchableOpacity style={styles.pageButton}>
              <ChevronDown size={16} style={{ transform: [{ rotate: '90deg' }] }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.pageButton}>
              <ChevronDown size={16} style={{ transform: [{ rotate: '-90deg' }] }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Crime Type Modal */}
        <Modal
          visible={showTypeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTypeModal(false)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowTypeModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Crime Type</Text>
              {crimeTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.modalOption,
                    selectedType === type && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedType(type);
                    setShowTypeModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    selectedType === type && styles.modalOptionTextSelected
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>

        {/* Severity Modal */}
        <Modal
          visible={showSeverityModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSeverityModal(false)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowSeverityModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Severity</Text>
              {severityLevels.map((severity) => (
                <TouchableOpacity
                  key={severity}
                  style={[
                    styles.modalOption,
                    selectedSeverity === severity && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedSeverity(severity);
                    setShowSeverityModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    selectedSeverity === severity && styles.modalOptionTextSelected
                  ]}>
                    {severity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      </ScrollView>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#202224',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    width: 300,
    height: 44,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  searchInput: {
    marginLeft: 12,
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  exportButton: {
    backgroundColor: '#e02323',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3f3',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e02323',
  },
  exportGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eee',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#fcfcfc',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerCell: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cell: {
    fontSize: 14,
    color: '#444',
    paddingHorizontal: 8,
  },
  // Update column width styles for better alignment
  alertIdColumn: { width: '10%', flexShrink: 0 },
  nameColumn: { width: '15%', flexShrink: 0 },
  addressColumn: { width: '20%', flexShrink: 0 },
  dateColumn: { width: '10%', flexShrink: 0 },
  typeColumn: { width: '15%', flexShrink: 0 },
  severityColumn: { width: '15%', flexShrink: 0 },
  respondedByColumn: { width: '15%', flexShrink: 0 },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
  },
  paginationText: {
    fontSize: 14,
    color: '#666',
  },
  paginationControls: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  pageButton: {
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#202224',
    marginBottom: 16,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#fff3f3',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#444',
  },
  modalOptionTextSelected: {
    color: '#e02323',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
});