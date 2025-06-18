import { ChevronDown, Edit as EditIcon, Filter, RefreshCw, Search } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AdminLayout from '../../components/AdminLayout';

// ... (Interface, constants, etc. remain the same)
interface RegularUser {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    securityQuestion: string;
    securityAnswer: string;
}

const sortOptions = [
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' },
    { label: 'ID', value: 'id' }
];

const formatPhoneNumber = (phoneStr: string) => {
    if (!phoneStr) return '';
    const cleaned = ('' + phoneStr).replace(/\D/g, '');
    if (cleaned.length === 11) { const match = cleaned.match(/^(\d{4})(\d{3})(\d{4})$/); if (match) return `${match[1]}-${match[2]}-${match[3]}`; }
    if (cleaned.length === 10) { const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/); if (match) return `${match[1]}-${match[2]}-${match[3]}`; }
    return phoneStr;
};

const HighlightText = ({ text = '', highlight = '', style }: { text: string; highlight: string; style?: object }) => {
    if (!highlight.trim()) {
        return <Text style={style}>{text}</Text>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);

    return (
        <Text style={style}>
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


export default function RegularUsers() {
    // ... (State and useEffect for fetching data remain the same)
    const [usersData, setUsersData] = useState<RegularUser[]>([]);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [hoveredSortOption, setHoveredSortOption] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('http://mnl911.atwebpages.com/fetch_regular_users.php');
                const data = await res.json();
                if (data.success && data.users) {
                    const sorted = [...data.users].sort((a, b) => parseInt(a.id) - parseInt(b.id));
                    setUsersData(sorted);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => { setCurrentPage(1); }, [search, sortBy]);
    
    const filtered = useMemo(() => {
        let result = [...usersData];
        const q = search.trim().toLowerCase();
        if (q) {
            result = result.filter(u =>
                u.id.toLowerCase().includes(q) ||
                u.firstName.toLowerCase().includes(q) ||
                u.lastName.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                // THE FIX: Search the formatted phone number
                formatPhoneNumber(u.phone).includes(q)
            );
        }
        switch (sortBy) {
            case 'name_asc': result.sort((a, b) => a.firstName.localeCompare(b.firstName)); break;
            case 'name_desc': result.sort((a, b) => b.firstName.localeCompare(a.firstName)); break;
            default: result.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        }
        return result;
    }, [search, sortBy, usersData]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filtered.slice(start, start + itemsPerPage);
    }, [currentPage, filtered]);

    const handleReset = () => { setSearch(''); setSortBy('id'); };

    const showStart = filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const showEnd = Math.min(currentPage * itemsPerPage, filtered.length);

    // ... (The rest of the component's JSX and styles are correct and remain unchanged)
    // ...
    return (
        <AdminLayout>
            <Pressable style={styles.container} onPress={() => setShowSortDropdown(false)}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text style={styles.title}>Regular Users</Text>
                        <View style={styles.searchContainer}>
                            <Search width={20} height={20} color="#666" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search by ID, name, or email..."
                                placeholderTextColor="#666"
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    </View>
                    <View style={styles.filtersContainer}>
                        <View style={styles.filterGroup}>
                            <Pressable onPress={(e) => e.stopPropagation()}>
                                <View>
                                    <TouchableOpacity style={styles.filterButton} onPress={() => setShowSortDropdown(prev => !prev)}>
                                        <Filter size={16} color="#666" />
                                        <Text style={styles.filterButtonText}>{sortOptions.find(o => o.value === sortBy)?.label}</Text>
                                        <ChevronDown width={16} height={16} color="#666" />
                                    </TouchableOpacity>
                                    {showSortDropdown && (
                                        <View style={[styles.dropdown, { width: 150 }]}>
                                            {sortOptions.map(option => (
                                                <TouchableOpacity
                                                    key={option.value}
                                                    style={styles.dropdownItem}
                                                    onPress={() => { setSortBy(option.value); setShowSortDropdown(false); }}
                                                    onMouseEnter={() => setHoveredSortOption(option.value)}
                                                    onMouseLeave={() => setHoveredSortOption(null)}
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
                            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                                <RefreshCw width={18} height={18} color="#e02323" />
                                <Text style={styles.resetText}>Reset</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.resultCount}>{filtered.length} users found</Text>
                    </View>
                </View>
                
                <View style={styles.tableContainer}>
                    <FlatList
                        data={paginatedData}
                        keyExtractor={item => item.id}
                        ListHeaderComponent={() => (
                            <View style={styles.tableHeader}>
                                <Text style={[styles.headerCell, styles.idColumn]}>USER ID</Text>
                                <Text style={[styles.headerCell, styles.firstNameColumn]}>FIRST NAME</Text>
                                <Text style={[styles.headerCell, styles.lastNameColumn]}>LAST NAME</Text>
                                <Text style={[styles.headerCell, styles.phoneColumn]}>PHONE</Text>
                                <Text style={[styles.headerCell, styles.emailColumn]}>EMAIL</Text>
                                <Text style={[styles.headerCell, styles.passwordColumn]}>PASS</Text>
                                <Text style={[styles.headerCell, styles.secQuestionColumn]}>SEC. Q</Text>
                                <Text style={[styles.headerCell, styles.secAnswerColumn]}>SEC. A</Text>
                                <Text style={[styles.headerCell, styles.actionColumn]}>ACTION</Text>
                            </View>
                        )}
                        renderItem={({ item }) => (
                            <View style={styles.tableRow}>
                                <HighlightText style={[styles.cell, styles.idColumn]} text={item.id} highlight={search} />
                                <HighlightText style={[styles.cell, styles.firstNameColumn]} text={item.firstName} highlight={search} />
                                <HighlightText style={[styles.cell, styles.lastNameColumn]} text={item.lastName} highlight={search} />
                                <HighlightText style={[styles.cell, styles.phoneColumn]} text={formatPhoneNumber(item.phone)} highlight={search} />
                                <HighlightText style={[styles.cell, styles.emailColumn]} text={item.email} highlight={search} />
                                <Text style={[styles.cell, styles.passwordColumn]}>{item.password}</Text>
                                <Text style={[styles.cell, styles.secQuestionColumn]}>{item.securityQuestion}</Text>
                                <Text style={[styles.cell, styles.secAnswerColumn]}>{item.securityAnswer}</Text>
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

                <View style={{flex: 1}} />
                
                {paginatedData.length > 0 && (
                     <View style={styles.pagination}>
                        <Text style={styles.paginationText}>
                            Showing {showStart}-{showEnd} of {filtered.length}
                        </Text>
                        <View style={styles.paginationControls}>
                            <TouchableOpacity
                                style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                                onPress={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <Text style={[styles.pageButtonText, currentPage === 1 && styles.pageButtonTextDisabled]}>Previous</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.pageButton, currentPage >= totalPages && styles.pageButtonDisabled]}
                                onPress={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                            >
                                <Text style={[styles.pageButtonText, currentPage >= totalPages && styles.pageButtonTextDisabled]}>Next</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </Pressable>
        </AdminLayout>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { 
        paddingHorizontal: 20,
        paddingTop: 20,
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
    filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, gap: 6, borderWidth: 1, borderColor: '#e5e5e5' },
    filterButtonText: { fontSize: 14, fontWeight: '500', color: '#444', marginLeft: 2 },
    resetButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff3f3', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    resetText: { fontSize: 14, fontWeight: '600', color: '#e02323' },
    resultCount: { fontSize: 16, color: '#666' },
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
    tableRow: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 16, alignItems: 'center' },
    cell: { fontSize: 14, color: '#444', paddingHorizontal: 4, textAlign: 'center' },
    idColumn: { flex: 1 },
    firstNameColumn: { flex: 2 },
    lastNameColumn: { flex: 2 },
    phoneColumn: { flex: 2 },
    emailColumn: { flex: 3 },
    passwordColumn: { flex: 1 },
    secQuestionColumn: { flex: 3 },
    secAnswerColumn: { flex: 2 },
    actionColumn: { width: 60, alignItems: 'center' },
    actionButton: { padding: 8, borderRadius: 6, backgroundColor: '#f8f9fa' },
    separator: { height: 1, backgroundColor: '#eee' },
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
    }
});