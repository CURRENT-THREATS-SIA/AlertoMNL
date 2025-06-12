import {
    ChevronDown,
    ChevronDown as ChevronDownIcon,
    Edit as EditIcon,
    Filter,
    RefreshCw,
    Search
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import AdminLayout from '../../components/AdminLayout';


// Add station options
const stationOptions = [
    'All Stations',
    'Station 1',
    'Station 2',
    'Station 3',
    'Station 4',
    'Station 5',
    'Station 14'
];

// Add sort options
const sortOptions = [
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' },
    { label: 'Station', value: 'station' },
    { label: 'ID', value: 'id' }
];

// Add sample data (you should replace this with your actual data source)
interface PoliceOfficer {
    id: string;
    firstName: string;
    lastName: string;
    station: string;
    badge: string;
    phone: string;
    email: string;
    password: string;
}

const officersData: PoliceOfficer[] = [
    {
        id: "PO001",
        firstName: "John",
        lastName: "Doe",
        station: "Station 1",
        badge: "B001",
        phone: "123-456-7890",
        email: "john.doe@police.gov",
        password: "••••••••"
    },
    // Add more sample data as needed
];

export default function PoliceOfficers() {
    const [search, setSearch] = useState('');
    const [selectedStation, setSelectedStation] = useState('All Stations');
    const [sortBy, setSortBy] = useState('name_asc');
    const [showStationModal, setShowStationModal] = useState(false);
    const [showSortModal, setShowSortModal] = useState(false);

    // Enhanced filter function
    const filtered = useMemo(() => {
        let result = [...officersData];

        // Apply search filter
        if (search.trim()) {
            result = result.filter((o) =>
                [o.id, o.firstName, o.lastName, o.station].some((field) =>
                    field.toLowerCase().includes(search.trim().toLowerCase())
                )
            );
        }

        // Apply station filter
        if (selectedStation !== 'All Stations') {
            result = result.filter(o => o.station === selectedStation);
        }

        // Apply sorting
        switch (sortBy) {
            case 'name_asc':
                result.sort((a, b) => `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`));
                break;
            case 'name_desc':
                result.sort((a, b) => `${b.lastName}${b.firstName}`.localeCompare(`${a.lastName}${a.firstName}`));
                break;
            case 'station':
                result.sort((a, b) => a.station.localeCompare(b.station));
                break;
            case 'id':
                result.sort((a, b) => a.id.localeCompare(b.id));
                break;
        }

        return result;
    }, [search, selectedStation, sortBy]);

    const handleResetFilters = () => {
        setSearch('');
        setSelectedStation('All Stations');
        setSortBy('name_asc');
    };

    return (
        <AdminLayout>
            <View style={styles.container}>
                {/* Enhanced Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text style={styles.title}>Police Officers</Text>
                        <View style={styles.searchContainer}>
                            <Search width={20} height={20} color="#666" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search by ID, name, or station..."
                                value={search}
                                onChangeText={setSearch}
                                placeholderTextColor="#666"
                            />
                        </View>
                    </View>

                    {/* Enhanced Filters Section */}
                    <View style={styles.filtersContainer}>
                        <View style={styles.filterGroup}>
                            <TouchableOpacity 
                                style={styles.filterButton}
                                onPress={() => setShowStationModal(true)}
                            >
                                <Filter width={18} height={18} color="#666" />
                                <Text style={styles.filterButtonText}>
                                    {selectedStation}
                                </Text>
                                <ChevronDown width={16} height={16} color="#666" />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.filterButton}
                                onPress={() => setShowSortModal(true)}
                            >
                                <Text style={styles.filterButtonText}>
                                    {sortOptions.find(opt => opt.value === sortBy)?.label}
                                </Text>
                                <ChevronDown width={16} height={16} color="#666" />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.resetButton}
                                onPress={handleResetFilters}
                            >
                                <RefreshCw width={18} height={18} color="#e02323" />
                                <Text style={styles.resetText}>Reset</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.resultCount}>
                            {filtered.length} officers found
                        </Text>
                    </View>
                </View>

                {/* Station Filter Modal */}
                <Modal
                    visible={showStationModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowStationModal(false)}
                >
                    <Pressable 
                        style={styles.modalOverlay}
                        onPress={() => setShowStationModal(false)}
                    >
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Station</Text>
                            {stationOptions.map((station) => (
                                <TouchableOpacity
                                    key={station}
                                    style={[
                                        styles.modalOption,
                                        selectedStation === station && styles.modalOptionSelected
                                    ]}
                                    onPress={() => {
                                        setSelectedStation(station);
                                        setShowStationModal(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalOptionText,
                                        selectedStation === station && styles.modalOptionTextSelected
                                    ]}>
                                        {station}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Pressable>
                </Modal>

                {/* Sort Modal */}
                <Modal
                    visible={showSortModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowSortModal(false)}
                >
                    <Pressable 
                        style={styles.modalOverlay}
                        onPress={() => setShowSortModal(false)}
                    >
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Sort By</Text>
                            {sortOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.modalOption,
                                        sortBy === option.value && styles.modalOptionSelected
                                    ]}
                                    onPress={() => {
                                        setSortBy(option.value);
                                        setShowSortModal(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalOptionText,
                                        sortBy === option.value && styles.modalOptionTextSelected
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Pressable>
                </Modal>

                {/* Officers Table */}
                <View style={styles.tableContainer}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, styles.idColumn]}>POLICE ID</Text>
                        <Text style={[styles.headerCell, styles.firstNameColumn]}>FIRST NAME</Text>
                        <Text style={[styles.headerCell, styles.lastNameColumn]}>LAST NAME</Text>
                        <Text style={[styles.headerCell, styles.stationColumn]}>STATION</Text>
                        <Text style={[styles.headerCell, styles.badgeColumn]}>POLICE BADGE</Text>
                        <Text style={[styles.headerCell, styles.phoneColumn]}>PHONE NO.</Text>
                        <Text style={[styles.headerCell, styles.emailColumn]}>EMAIL</Text>
                        <Text style={[styles.headerCell, styles.passwordColumn]}>PASSWORD</Text>
                        <Text style={[styles.headerCell, styles.actionColumn]}>ACTION</Text>
                    </View>

                    {/* Table Content */}
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.tableRow}>
                                <Text style={[styles.cell, styles.idColumn]}>{item.id}</Text>
                                <Text style={[styles.cell, styles.firstNameColumn]}>{item.firstName}</Text>
                                <Text style={[styles.cell, styles.lastNameColumn]}>{item.lastName}</Text>
                                <Text style={[styles.cell, styles.stationColumn]}>{item.station}</Text>
                                <Text style={[styles.cell, styles.badgeColumn]}>{item.badge}</Text>
                                <Text style={[styles.cell, styles.phoneColumn]}>{item.phone}</Text>
                                <Text style={[styles.cell, styles.emailColumn]}>{item.email}</Text>
                                <Text style={[styles.cell, styles.passwordColumn]}>{item.password}</Text>
                                <View style={[styles.cell, styles.actionColumn]}>
                                    <TouchableOpacity style={styles.actionButton}>
                                        <EditIcon size={20} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                </View>

                {/* Pagination */}
                <View style={styles.pagination}>
                    <Text style={styles.paginationText}>
                        Showing 1-{filtered.length} of {officersData.length}
                    </Text>
                    <View style={styles.paginationControls}>
                        <TouchableOpacity style={styles.pageButton}>
                            <ChevronDownIcon size={16} style={{ transform: [{ rotate: '90deg' }] }} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.pageButton}>
                            <ChevronDownIcon size={16} style={{ transform: [{ rotate: '-90deg' }] }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
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
    },
    searchInput: {
        marginLeft: 12,
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
    filtersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    filterGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
        borderWidth: 1,
        borderColor: '#e5e5e5',
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
    },
    resetText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#e02323',
    },
    resultCount: {
        fontSize: 14,
        color: '#666',
    },
    tableContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
        flex: 1,
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
    actionButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#f8f9fa',
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
    },
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
    // Column width styles
    idColumn: { width: '10%' },
    firstNameColumn: { width: '12%' },
    lastNameColumn: { width: '12%' },
    stationColumn: { width: '12%' },
    badgeColumn: { width: '10%' },
    phoneColumn: { width: '15%' },
    emailColumn: { width: '15%' },
    passwordColumn: { width: '8%' },
    actionColumn: { width: '6%', alignItems: 'center' },
});
