import { ChevronDown, Filter, RefreshCw, Search } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import AdminLayout from '../../components/AdminLayout';

const stationOptions = ['All Stations', 'Station 1', 'Station 2', 'Station 3', 'Station 4', 'Station 5', 'Station 6', 'Station 7', 'Station 8', 'Station 9', 'Station 10', 'Station 11', 'Station 12', 'Station 13', 'Station 14'];
const sortOptions = [{ label: 'Name (A-Z)', value: 'name_asc' }, { label: 'Name (Z-A)', value: 'name_desc' }, { label: 'Station', value: 'station' }, { label: 'ID', value: 'id' }];
const statusOptions = [
    { label: 'Verification', value: 'P.Verification' },
    { label: 'Active', value: 'P.Active' },
    { label: 'Suspended', value: 'P.Suspended' },
    { label: 'Terminated', value: 'P.Terminated' },
];

interface PoliceOfficer {
    id: string;
    firstName: string;
    lastName: string;
    station: string;
    badge: string;
    phone: string;
    email: string;
    password: string;
    securityQuestion: string;
    securityAnswer: string;
    account_status?: string;
    suspension_end_date?: string | null;
}

// Helper function for status color
const getStatusStyle = (status?: string | null): { color: string; fontWeight: "600" } => {
    switch (status) {
        case 'P.Active':
            return { color: '#28a745', fontWeight: '600' }; // Green
        case 'P.Suspended':
            return { color: '#ff7675', fontWeight: '600' }; // Light Red
        case 'P.Terminated':
            return { color: '#d63031', fontWeight: '600' }; // Dark Red
        case 'P.Verification':
        default:
            return { color: '#212529', fontWeight: '600' }; // Black
    }
};

// Helper function to format status text for display
const formatStatusDisplay = (status?: string | null) => {
    if (!status) return 'Verification';
    return status.replace('P.', '');
};

const formatPhoneNumber = (phoneStr: string) => {
    if (!phoneStr) return '';
    const cleaned = ('' + phoneStr).replace(/\D/g, '');
    if (cleaned.length === 11) { const match = cleaned.match(/^(\d{4})(\d{3})(\d{4})$/); if (match) return `${match[1]}-${match[2]}-${match[3]}`; }
    if (cleaned.length === 10) { const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/); if (match) return `${match[1]}-${match[2]}-${match[3]}`; }
    return phoneStr;
};

// THE FIX: Modified HighlightText to accept and pass down numberOfLines and ellipsizeMode props.
const HighlightText = ({ text = '', highlight = '', style, numberOfLines, ellipsizeMode }: { text: string; highlight: string; style?: object, numberOfLines?: number, ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip' }) => {
    if (!highlight.trim()) {
        return <Text style={style} numberOfLines={numberOfLines} ellipsizeMode={ellipsizeMode}>{text}</Text>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);

    return (
        <Text style={style} numberOfLines={numberOfLines} ellipsizeMode={ellipsizeMode}>
            {parts.filter(part => part).map((part, i) => (
                regex.test(part) ? (
                    <Text key={i} style={styles.highlightedText}>
                        {part}
                    </Text>
                ) : (
                    <Text key={i}>{part}</Text>
                )
            ))}
        </Text>
    );
};

export default function PoliceOfficers() {
    const [officers, setOfficers] = useState<PoliceOfficer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [selectedStation, setSelectedStation] = useState('All Stations');
    const [sortBy, setSortBy] = useState('id');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [showStationDropdown, setShowStationDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [hoveredStation, setHoveredStation] = useState<string | null>(null);
    const [hoveredSortOption, setHoveredSortOption] = useState<string | null>(null);

    const [statusModal, setStatusModal] = useState<{visible: boolean, officer: PoliceOfficer | null, newStatus: string | null}>({visible: false, officer: null, newStatus: null});
    const [suspendDays, setSuspendDays] = useState<number>(7);
    const [isUpdating, setIsUpdating] = useState(false);
    const [terminationReason, setTerminationReason] = useState('');

    useEffect(() => {
        const fetchOfficers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch('http://mnl911.atwebpages.com/fetch_police_users.php');
                if (!res.ok) throw new Error('Network response was not ok.');
                const data = await res.json();
                if (data.success && data.officers) {
                    setOfficers(data.officers);
                } else {
                    throw new Error(data.message || 'Failed to parse officer data.');
                }
            } catch (err: any) {
                setError(err.message);
                console.error("Fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOfficers();
    }, []);

    useEffect(() => { setCurrentPage(1); }, [search, sortBy, selectedStation]);

    const filtered = useMemo(() => {
        let result = [...officers];
        const q = search.trim().toLowerCase();

        if (q) {
            result = result.filter(o => 
                o.id.toLowerCase().includes(q) ||
                o.firstName.toLowerCase().includes(q) ||
                o.lastName.toLowerCase().includes(q) ||
                o.station.toLowerCase().includes(q) ||
                o.badge.toLowerCase().includes(q) ||
                formatPhoneNumber(o.phone).includes(q) ||
                o.email.toLowerCase().includes(q)
            );
        }

        if (selectedStation !== 'All Stations') {
            result = result.filter(o => o.station === selectedStation);
        }
        
        switch (sortBy) {
            case 'name_asc': result.sort((a, b) => a.firstName.localeCompare(b.firstName)); break;
            case 'name_desc': result.sort((a, b) => b.firstName.localeCompare(a.firstName)); break;
            case 'station': result.sort((a, b) => { const numA = parseInt(a.station.replace('Station ', ''), 10); const numB = parseInt(b.station.replace('Station ', ''), 10); return numA - numB; }); break;
            case 'id': result.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10)); break;
        }
        return result;
    }, [search, selectedStation, sortBy, officers]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filtered.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, filtered]);

    const handleResetFilters = () => { setSearch(''); setSelectedStation('All Stations'); setSortBy('id'); };
    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    const startItem = filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, filtered.length);
    const totalItems = filtered.length;

    const handleCloseDropdowns = () => {
        setShowStationDropdown(false);
        setShowSortDropdown(false);
    };

    const toggleStationDropdown = () => {
        setShowSortDropdown(false);
        setShowStationDropdown(prev => !prev);
    };

    const toggleSortDropdown = () => {
        setShowStationDropdown(false);
        setShowSortDropdown(prev => !prev);
    };

    return (
        <AdminLayout>
            <Pressable style={styles.container} onPress={handleCloseDropdowns}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text style={styles.title}>Police Officers</Text>
                        <View style={styles.searchContainer}>
                            <Search width={20} height={20} color="#666" />
                            <TextInput style={styles.searchInput} placeholder="Search..." value={search} onChangeText={setSearch} placeholderTextColor="#666" />
                        </View>
                    </View>
                    <View style={styles.filtersContainer}>
                        <View style={styles.filterGroup}>
                            <Pressable onPress={(e) => e.stopPropagation()}>
                                <View>
                                    <TouchableOpacity style={styles.filterButton} onPress={toggleStationDropdown}>
                                        <Filter width={18} height={18} color="#666" />
                                        <Text style={styles.filterButtonText}>{selectedStation}</Text>
                                        <ChevronDown width={16} height={16} color="#666" />
                                    </TouchableOpacity>
                                    {showStationDropdown && (
                                        <View style={[styles.dropdown, { width: 180 }]}>
                                            <FlatList
                                                data={stationOptions}
                                                keyExtractor={(item) => item}
                                                renderItem={({ item: station }) => (
                                                    <TouchableOpacity
                                                        style={styles.dropdownItem}
                                                        onPress={() => { setSelectedStation(station); setShowStationDropdown(false); }}
                                                    >
                                                        <Text style={[styles.dropdownItemText, hoveredStation === station && styles.dropdownItemTextHovered, selectedStation === station && styles.dropdownItemTextSelected]}>
                                                            {station}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )}
                                            />
                                        </View>
                                    )}
                                </View>
                            </Pressable>
                            <Pressable onPress={(e) => e.stopPropagation()}>
                                <View>
                                    <TouchableOpacity style={styles.filterButton} onPress={toggleSortDropdown}>
                                        <Text style={styles.filterButtonText}>{sortOptions.find(opt => opt.value === sortBy)?.label}</Text>
                                        <ChevronDown width={16} height={16} color="#666" />
                                    </TouchableOpacity>
                                    {showSortDropdown && (
                                        <View style={[styles.dropdown, { width: 150 }]}>
                                            {sortOptions.map(option => (
                                                <TouchableOpacity
                                                    key={option.value}
                                                    style={styles.dropdownItem}
                                                    onPress={() => { setSortBy(option.value); setShowSortDropdown(false); }}
                                                >
                                                    <Text style={[styles.dropdownItemText, hoveredSortOption === option.value && styles.dropdownItemTextHovered, sortBy === option.value && styles.dropdownItemTextSelected]}>
                                                        {option.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </Pressable>
                            <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters}>
                                <RefreshCw width={18} height={18} color="#e02323" />
                                <Text style={styles.resetText}>Reset</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.resultCount}>{totalItems} officers found</Text>
                    </View>
                </View>

                {isLoading ? (
                    <View style={styles.centeredMessage}><ActivityIndicator size="large" color="#e02323" /></View>
                ) : error ? (
                    <View style={styles.centeredMessage}><Text style={styles.errorText}>Error: {error}</Text></View>
                ) : (
                    <>
                        <View style={styles.tableContainer}>
                            <FlatList
                                data={paginatedData}
                                keyExtractor={(item) => item.id}
                                ListHeaderComponent={<View style={styles.tableHeader}><Text style={[styles.headerCell, styles.idColumn]}>POLICE ID</Text><Text style={[styles.headerCell, styles.firstNameColumn]}>FIRST NAME</Text><Text style={[styles.headerCell, styles.lastNameColumn]}>LAST NAME</Text><Text style={[styles.headerCell, styles.stationColumn]}>STATION</Text><Text style={[styles.headerCell, styles.badgeColumn]}>BADGE</Text><Text style={[styles.headerCell, styles.phoneColumn]}>PHONE</Text><Text style={[styles.headerCell, styles.emailColumn]}>EMAIL</Text><Text style={[styles.headerCell, styles.passwordColumn]}>PASS</Text><Text style={[styles.headerCell, styles.secQuestionColumn]}>SEC. Q</Text><Text style={[styles.headerCell, styles.secAnswerColumn]}>SEC. A</Text><Text style={[styles.headerCell, styles.actionColumn]}>STATUS</Text></View>}
                                renderItem={({ item }) => (
                                    <View style={styles.tableRow}>
                                        <HighlightText style={[styles.cell, styles.idColumn]} text={item.id} highlight={search} />
                                        <HighlightText style={[styles.cell, styles.firstNameColumn]} text={item.firstName} highlight={search} />
                                        <HighlightText style={[styles.cell, styles.lastNameColumn]} text={item.lastName} highlight={search} />
                                        <HighlightText style={[styles.cell, styles.stationColumn]} text={item.station} highlight={search} />
                                        <HighlightText style={[styles.cell, styles.badgeColumn]} text={item.badge} highlight={search} />
                                        <HighlightText style={[styles.cell, styles.phoneColumn]} text={formatPhoneNumber(item.phone)} highlight={search} />
                                        <HighlightText style={[styles.cell, styles.emailColumn]} text={item.email} highlight={search} numberOfLines={1} ellipsizeMode="tail" />
                                        <Text style={[styles.cell, styles.passwordColumn]}>{item.password}</Text>
                                        <Text style={[styles.cell, styles.secQuestionColumn]} numberOfLines={1} ellipsizeMode="tail">{item.securityQuestion}</Text>
                                        <Text style={[styles.cell, styles.secAnswerColumn]} numberOfLines={1} ellipsizeMode="tail">{item.securityAnswer}</Text>
                                        <View style={[styles.cell, styles.actionColumn]}>
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => setStatusModal({visible: true, officer: item, newStatus: item.account_status || 'P.Verification'})}
                                            >
                                                <Text style={getStatusStyle(item.account_status)}>{formatStatusDisplay(item.account_status)}</Text>
                                                <ChevronDown width={16} height={16} color="#666" />
                                            </TouchableOpacity>
                                            {item.account_status === 'P.Suspended' && item.suspension_end_date && (
                                                <Text style={{fontSize: 10, color: '#ff7675', marginTop: 4}}>Until: {item.suspension_end_date.split(' ')[0]}</Text>
                                            )}
                                        </View>
                                    </View>
                                )}
                                ItemSeparatorComponent={() => <View style={styles.separator} />}
                                ListEmptyComponent={<View style={styles.centeredMessage}><Text>No officers found.</Text></View>}
                            />
                        </View>
                        
                        <View style={{ flex: 1 }} />

                        {paginatedData.length > 0 && (
                            <View style={styles.pagination}><Text style={styles.paginationText}>Showing {startItem}-{endItem} of {totalItems}</Text><View style={styles.paginationControls}><TouchableOpacity style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]} onPress={handlePrevPage} disabled={currentPage === 1}><Text style={[styles.pageButtonText, currentPage === 1 && styles.pageButtonTextDisabled]}>Previous</Text></TouchableOpacity><TouchableOpacity style={[styles.pageButton, currentPage >= totalPages && styles.pageButtonDisabled]} onPress={handleNextPage} disabled={currentPage >= totalPages}><Text style={[styles.pageButtonText, currentPage >= totalPages && styles.pageButtonTextDisabled]}>Next</Text></TouchableOpacity></View></View>
                        )}
                    </>
                )}
            </Pressable>

            {statusModal.visible && statusModal.officer && (
                <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center', zIndex: 100}}>
                    <View style={{backgroundColor: '#fff', borderRadius: 12, padding: 24, width: 320, alignItems: 'center'}}>
                        <Text style={{fontSize: 18, fontWeight: '700', marginBottom: 16}}>Change Status</Text>
                        {statusOptions.map(opt => (
                            <TouchableOpacity
                                key={opt.value}
                                style={{padding: 10, width: '100%', alignItems: 'center', backgroundColor: statusModal.newStatus === opt.value ? '#f8f9fa' : '#fff'}}
                                onPress={() => {
                                    setStatusModal(sm => ({...sm, newStatus: opt.value}));
                                    // Reset reason when changing status
                                    if (opt.value !== 'P.Terminated') {
                                        setTerminationReason('');
                                    }
                                }}
                            >
                                <Text style={{color: opt.value === 'P.Terminated' ? '#e02323' : '#222', fontWeight: statusModal.newStatus === opt.value ? '700' : '400'}}>{opt.label}</Text>
                            </TouchableOpacity>
                        ))}
                        {statusModal.newStatus === 'P.Suspended' && (
                            <View style={{marginTop: 16, alignItems: 'center'}}>
                                <Text style={{fontSize: 14, marginBottom: 8}}>Suspension Duration (days):</Text>
                                <View style={{flexDirection: 'row', gap: 8}}>
                                    {[7, 15, 30].map(days => (
                                        <TouchableOpacity key={days} style={{padding: 8, backgroundColor: suspendDays === days ? '#e02323' : '#eee', borderRadius: 6, marginHorizontal: 4}} onPress={() => setSuspendDays(days)}>
                                            <Text style={{color: suspendDays === days ? '#fff' : '#222'}}>{days}d</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                        {statusModal.newStatus === 'P.Terminated' && (
                            <View style={{marginTop: 16, width: '100%'}}>
                                <Text style={{fontSize: 14, marginBottom: 8, textAlign: 'center'}}>Reason for Termination (Optional):</Text>
                                <TextInput
                                    style={styles.reasonInput}
                                    placeholder="e.g., Violation of policy"
                                    value={terminationReason}
                                    onChangeText={setTerminationReason}
                                />
                            </View>
                        )}
                        <View style={{flexDirection: 'row', marginTop: 24, gap: 12}}>
                            <TouchableOpacity
                                style={{backgroundColor: '#e02323', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8}}
                                disabled={isUpdating}
                                onPress={async () => {
                                    if (!statusModal.officer || !statusModal.newStatus) return;
                                    setIsUpdating(true);
                                    let body: any = {
                                        police_id: parseInt(statusModal.officer.id, 10),
                                        account_status: statusModal.newStatus
                                    };
                                    if (statusModal.newStatus === 'P.Suspended') {
                                        const now = new Date();
                                        now.setDate(now.getDate() + suspendDays);
                                        const yyyy = now.getFullYear();
                                        const mm = String(now.getMonth() + 1).padStart(2, '0');
                                        const dd = String(now.getDate()).padStart(2, '0');
                                        const hh = String(now.getHours()).padStart(2, '0');
                                        const min = String(now.getMinutes()).padStart(2, '0');
                                        const ss = String(now.getSeconds()).padStart(2, '0');
                                        body.suspension_end_date = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
                                    }
                                    if (statusModal.newStatus === 'P.Terminated') {
                                        body.termination_reason = terminationReason;
                                    }
                                    try {
                                        const res = await fetch('http://mnl911.atwebpages.com/update_police_status.php', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(body)
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            // Refresh officers
                                            setOfficers(prev => prev.map(o => o.id === statusModal.officer?.id ? { ...o, account_status: statusModal.newStatus || undefined, suspension_end_date: body.suspension_end_date || undefined } : o));
                                            setStatusModal({visible: false, officer: null, newStatus: null});
                                        } else {
                                            alert(data.message || 'Failed to update status');
                                        }
                                    } catch (err) {
                                        alert('Network error');
                                    } finally {
                                        setIsUpdating(false);
                                    }
                                }}
                            >
                                <Text style={{color: '#fff', fontWeight: '700'}}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{backgroundColor: '#eee', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8}}
                                disabled={isUpdating}
                                onPress={() => setStatusModal({visible: false, officer: null, newStatus: null})}
                            >
                                <Text style={{color: '#222', fontWeight: '700'}}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { 
        padding: 20, 
        paddingBottom: 24,
        backgroundColor: '#f8f9fa', 
        zIndex: 10,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 24, fontWeight: '700', color: '#202224' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, width: 300, height: 44 },
    searchInput: { marginLeft: 12, flex: 1, fontSize: 15, color: '#333' },
    filtersContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    filterGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderWidth: 1, borderColor: '#e5e5e5' },
    filterButtonText: { fontSize: 14, fontWeight: '500', color: '#444' },
    resetButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff3f3', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    resetText: { fontSize: 14, fontWeight: '600', color: '#e02323' },
    resultCount: { fontSize: 14, color: '#666' },
    tableContainer: { 
        marginHorizontal: 20,
        backgroundColor: '#fff', 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: '#eee',
        flexShrink: 1,
    },
    tableHeader: { flexDirection: 'row', backgroundColor: '#fcfcfc', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerCell: { fontSize: 12, fontWeight: '600', color: '#666', paddingHorizontal: 4, textAlign: 'center' },
    tableRow: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 16, alignItems: 'center', backgroundColor: '#fff' },
    cell: { fontSize: 14, color: '#444', paddingHorizontal: 4, textAlign: 'center' },
    actionButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: '#f8f9fa',
        width: '100%',
    },
    separator: { height: 1, backgroundColor: '#eee' },
    // THE FIX: Adjusted flex values for better alignment and changed actionColumn to a fixed width.
    idColumn: { flex: 1 },
    firstNameColumn: { flex: 1.5 },
    lastNameColumn: { flex: 1.5 },
    stationColumn: { flex: 1.5 },
    badgeColumn: { flex: 1 },
    phoneColumn: { flex: 2 },
    emailColumn: { flex: 2.5 },
    passwordColumn: { flex: 1 },
    secQuestionColumn: { flex: 2.5 },
    secAnswerColumn: { flex: 2.5 },
    actionColumn: {
        width: 130, // Set a fixed width for the status column
        alignItems: 'center'
    },
    pagination: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 20,
    },
    paginationText: { fontSize: 14, color: '#666', fontWeight: '600' },
    paginationControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    pageButton: { backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#e5e5e5' },
    pageButtonDisabled: { backgroundColor: '#f8f9fa', borderColor: '#f0f0f0' },
    pageButtonText: { fontSize: 14, color: '#333', fontWeight: '600' },
    pageButtonTextDisabled: { color: '#aaa' },
    centeredMessage: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, minHeight: 150 },
    errorText: { color: '#e02323', fontSize: 16, fontWeight: '500' },
    dropdown: {
        position: 'absolute',
        top: 42,
        left: 0,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e5e5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: 240,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#444',
    },
    dropdownItemTextSelected: {
        color: '#e02323',
        fontWeight: '600',
    },
    dropdownItemTextHovered: {
        color: '#e02323',
    },
    highlightedText: {
        backgroundColor: '#fff8b4'
    },
    reasonInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        width: '100%',
        fontSize: 14,
    },
});
