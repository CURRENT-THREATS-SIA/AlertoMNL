import { Calendar, ChevronDown, Filter, RefreshCw, Search } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    Platform, // Import Platform API
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import AdminLayout from '../../components/AdminLayout';

// Expo libraries for file handling and sharing
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
// XLSX for Excel file generation
import * as XLSX from 'xlsx';
// For native date picker
import DateTimePicker from '@react-native-community/datetimepicker';


// --- Interfaces, Constants, and Helper Functions ---

interface CrimeRecord {
    alertId: string;
    name: string | null;
    address: string | null;
    date: string;
    type: string | null;
    severity: string | null;
    respondedBy: string;
}

const crimeTypes = [ 
    'All Types',
    'Murder',
    'Homicide',
    'Physical Injury',
    'Rape',
    'Robbery',
    'Theft',
    'Carnapping MV',
    'Carnapping MC'
  ];
const severityLevels = ['All Severities', 'Low', 'Medium', 'High'];
const itemsPerPage = 10;

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        // Parse as local (no Z, no +8)
        const date = new Date(dateString.replace(' ', 'T'));
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const month = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;

        return `${month} ${day}, ${year} at ${hours}:${minutes} ${ampm}`;
    } catch {
        return 'N/A';
    }
};

const formatAddress = (address: string | null) => {
    if (!address) return 'N/A';
    const parts = address.split(',');
    return parts.slice(0, 2).join(',').trim();
};

const HighlightText = ({ text = '', highlight = '', style }: { text: string; highlight: string; style?: object }) => {
    if (!highlight.trim()) {
        return <Text style={style}>{text}</Text>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);

    return (
        <Text style={style}>
            {parts.filter(part => part).map((part, i) =>
                regex.test(part) ? (
                    <Text key={i} style={styles.highlightedText}>
                        {part}
                    </Text>
                ) : (
                    <Text key={i}>{part}</Text>
                )
            )}
        </Text>
    );
};

// Helper to convert DD/MM/YYYY to YYYY-MM-DD
function toISODate(dateString: string) {
    if (!dateString) return '';
    if (dateString.includes('-')) return dateString; // already ISO
    const parts = dateString.split('/');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    if (!day || !month || !year) return '';
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}


export default function CrimeData() {
    // --- State and Hooks ---
    const [isLoading, setIsLoading] = useState(true);
    const [masterCrimeData, setMasterCrimeData] = useState<CrimeRecord[]>([]);
    const [selectedType, setSelectedType] = useState('All Types');
    const [selectedSeverity, setSelectedSeverity] = useState('All Severities');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);
    const [hoveredType, setHoveredType] = useState<string | null>(null);
    const [hoveredSeverity, setHoveredSeverity] = useState<string | null>(null);
    // Date filter state
    const [selectedDate, setSelectedDate] = useState<string>(''); // format: 'YYYY-MM-DD'
    const [showDatePicker, setShowDatePicker] = useState(false);
    // Add state for date range
    const [startDate, setStartDate] = useState<string>(''); // format: 'DD/MM/YYYY' or 'YYYY-MM-DD'
    const [endDate, setEndDate] = useState<string>('');

    // --- Data Fetching and Filtering ---
    useEffect(() => {
        const fetchAllCrimeData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`http://mnl911.atwebpages.com/fetch_crime_data.php`);
                const json = await res.json();
                if (json.success && Array.isArray(json.records)) {
                    setMasterCrimeData(json.records);
                } else {
                    console.error("API did not return valid records:", json);
                }
            } catch (err) {
                console.error('Error fetching crime data:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllCrimeData();
    }, []);

    useEffect(() => {
      if (Platform.OS === 'web') {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.async = true;
          document.body.appendChild(script);
  
          return () => {
              document.body.removeChild(script);
          };
      }
  }, []); 

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedType, selectedSeverity, searchQuery, selectedDate]);

    const filteredData = useMemo(() => {
        let result = [...masterCrimeData];
        const q = searchQuery.trim().toLowerCase();

        if (q) {
            result = result.filter(item => {
                const formattedDate = formatDate(item.date).toLowerCase();
                return (
                    item.alertId.toLowerCase().includes(q) ||
                    (item.name && item.name.toLowerCase().includes(q)) ||
                    (item.address && item.address.toLowerCase().includes(q)) ||
                    (item.respondedBy && item.respondedBy.toLowerCase().includes(q)) ||
                    (item.type && item.type.toLowerCase().includes(q)) ||
                    (item.severity && item.severity.toLowerCase().includes(q)) ||
                    formattedDate.includes(q)
                );
            });
        }
        
        if (selectedType !== 'All Types') {
            result = result.filter(item => item.type === selectedType);
        }
        if (selectedSeverity !== 'All Severities') {
            result = result.filter(item => item.severity === selectedSeverity);
        }
        // Date filter
        if (selectedDate) {
            const isoSelectedDate = toISODate(selectedDate);
            if (isoSelectedDate) {
                result = result.filter(item => {
                    const utcDateString = item.date.replace(' ', 'T').slice(0, 10);
                    return utcDateString === isoSelectedDate;
                });
            }
        }
        // Date range filter
        if (startDate && endDate) {
            const isoStart = toISODate(startDate);
            const isoEnd = toISODate(endDate);
            result = result.filter(item => {
                const utcDateString = item.date.replace(' ', 'T').slice(0, 10);
                return utcDateString >= isoStart && utcDateString <= isoEnd;
            });
        } else if (startDate) {
            const isoStart = toISODate(startDate);
            result = result.filter(item => {
                const utcDateString = item.date.replace(' ', 'T').slice(0, 10);
                return utcDateString >= isoStart;
            });
        } else if (endDate) {
            const isoEnd = toISODate(endDate);
            result = result.filter(item => {
                const utcDateString = item.date.replace(' ', 'T').slice(0, 10);
                return utcDateString <= isoEnd;
            });
        }
        // Use Set for faster deduplication
        const seen = new Set();
        result = result.filter(item => {
            const duplicate = seen.has(item.alertId);
            seen.add(item.alertId);
            return !duplicate;
        });
        // Sort once at the end
        result.sort((a, b) => parseInt(a.alertId) - parseInt(b.alertId));
        return result;
    }, [masterCrimeData, searchQuery, selectedType, selectedSeverity, selectedDate, startDate, endDate]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const showStart = filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const showEnd = Math.min(currentPage * itemsPerPage, filteredData.length);

    // --- Event Handlers ---
    const handleReset = () => {
        setSelectedType('All Types');
        setSelectedSeverity('All Severities');
        setSearchQuery('');
        setSelectedDate('');
        setStartDate('');
        setEndDate('');
    };

    const handleCloseDropdowns = () => {
        setShowTypeDropdown(false);
        setShowSeverityDropdown(false);
    };

    const toggleTypeDropdown = () => {
        setShowSeverityDropdown(false);
        setShowTypeDropdown(prev => !prev);
    };

    const toggleSeverityDropdown = () => {
        setShowTypeDropdown(false);
        setShowSeverityDropdown(prev => !prev);
    };

    // --- Date Picker Handlers ---
    const handleDateChange = (event: any, date?: Date) => {
        setShowDatePicker(false);
        if (date) {
            // Format as YYYY-MM-DD
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            setSelectedDate(`${yyyy}-${mm}-${dd}`);
        }
    };

    // --- EXPORT FUNCTIONS ---

    /**
     * Generates an HTML string for a PDF report from a given dataset.
     * @param {CrimeRecord[]} data The data to include in the report.
     * @param {string} title The title of the report.
     * @returns {string} The HTML content for the PDF.
     */
    const generatePdfHtml = (data: CrimeRecord[], title: string): string => {
      const tableHeaders = `
          <thead>
              <tr>
                  <th>Alert ID</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Responded By</th>
              </tr>
          </thead>`;
  
      let tableRows = '';
      data.forEach((item, index) => {
          tableRows += `
              <tr>
                  <td>${item.alertId}</td>
                  <td>${item.name || 'N/A'}</td>
                  <td>${formatAddress(item.address)}</td>
                  <td>${formatDate(item.date)}</td>
                  <td>${item.type || 'N/A'}</td>
                  <td>${item.severity || 'N/A'}</td>
                  <td>${item.respondedBy || 'N/A'}</td>
              </tr>`;
  
          if ((index + 1) % 20 === 0 && index + 1 < data.length) {
              tableRows += `<tr class="page-break"></tr>`;
          }
      });
  
      const totalRecords = `Total Records: ${data.length}`;
      const generatedAt = new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
      });
  
      return `
          <html>
              <head>
                  <style>
                      body {
                          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                          color: #333;
                          margin: 40px;
                      }
                      .date-right {
                          text-align: right;
                          font-size: 12px;
                          color: #666;
                      }
                      .spacer {
                          height: 40px;
                      }
                      .report-header {
                          text-align: center;
                          margin-bottom: 20px;
                      }
                      h1 {
                          font-size: 24px;
                          margin: 0;
                      }
                      p {
                          font-size: 12px;
                          color: #666;
                          margin: 4px 0 0 0;
                      }
                      table {
                          width: 100%;
                          border-collapse: collapse;
                          page-break-inside: auto;
                      }
                      th, td {
                          border: 1px solid #ddd;
                          padding: 8px;
                          text-align: left;
                          font-size: 10px;
                          word-break: break-word;
                      }
                      th {
                          background-color: #f2f2f2;
                          font-weight: bold;
                      }
                      tr:nth-child(even) {
                          background-color: #f9f9f9;
                      }
                      .page-break {
                          page-break-after: always;
                      }
                  </style>
              </head>
              <body>
                  <div class="date-right">${generatedAt}</div>
                  <div class="spacer"></div>
                  <div class="report-header">
                      <h1>${title}</h1>
                      <p>${totalRecords}</p>
                  </div>
                  <table>
                      ${tableHeaders}
                      <tbody>${tableRows}</tbody>
                  </table>
              </body>
          </html>
      `;
  };

    /**
     * Creates and handles PDF export for ALL FILTERED DATA with platform-specific logic.
     */
    const exportToPdf = async () => {
      if (filteredData.length === 0) {
          alert('No data to export.');
          return;
      }
  
      const reportTitle = `ALERTOMNL - Crime Data Report`;
      const htmlContent = generatePdfHtml(filteredData, reportTitle);
  
      if (Platform.OS === 'web') {
          // Use html2pdf.js on Web to convert HTML to PDF and auto-download
          const element = document.createElement('div');
          element.innerHTML = htmlContent;
  
          const opt = {
              margin:       0.5,
              filename:     `CrimeData-All-${new Date().getTime()}.pdf`,
              image:        { type: 'jpeg', quality: 0.98 },
              html2canvas:  { scale: 2 },
              jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
          };
  
          // @ts-ignore - Assume html2pdf is loaded globally
          html2pdf().from(element).set(opt).save();
      } else {
          // Native (mobile) fallback
          try {
              const { uri } = await Print.printToFileAsync({ html: htmlContent });
              await Sharing.shareAsync(uri, {
                  mimeType: 'application/pdf',
                  dialogTitle: 'Share PDF Report'
              });
          } catch (error) {
              console.error("Error exporting to PDF:", error);
              alert('Failed to export PDF. Please try again.');
          }
      }
  };
  
    
    /**
     * Creates and handles Excel (.xlsx) export for ALL FILTERED DATA with platform-specific logic.
     */
    const exportToExcel = async () => {
        if (filteredData.length === 0) {
            alert('No data to export.');
            return;
        }

        const dataForExcel = filteredData.map(item => ({
            'Alert ID': item.alertId,
            'Name': item.name || 'N/A',
            'Address': formatAddress(item.address),
            'Date': formatDate(item.date),
            'Type': item.type || 'N/A',
            'Severity': item.severity || 'N/A',
            'Responded By': item.respondedBy || 'N/A'
        }));

        const ws = XLSX.utils.json_to_sheet(dataForExcel);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "CrimeData");

        try {
            if (Platform.OS === 'web') {
                // On web, trigger a file download.
                XLSX.writeFile(wb, `CrimeData-All-${new Date().getTime()}.xlsx`);
            } else {
                // On native, write to a file and share it.
                const wbout = XLSX.write(wb, { type: 'base64', bookType: "xlsx" });
                const uri = FileSystem.documentDirectory + `CrimeData-All-${new Date().getTime()}.xlsx`;
                await FileSystem.writeAsStringAsync(uri, wbout, {
                    encoding: FileSystem.EncodingType.Base64
                });
                
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(uri, {
                        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        dialogTitle: 'Share Excel Report',
                        UTI: 'com.microsoft.excel.xlsx'
                    });
                } else {
                     alert('Sharing is not available on your device');
                }
            }
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            alert('Failed to export Excel file. Please try again.');
        }
    };


    // --- Render Method ---
    return (
        <AdminLayout>
            <Pressable style={styles.container} onPress={handleCloseDropdowns}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text style={styles.title}>Crime Data Overview</Text>
                        <View style={styles.searchContainer}>
                            <Search width={20} height={20} color="#666" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search by any field..."
                                placeholderTextColor="#666"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    <View style={styles.filtersContainer}>
                        <View style={styles.filterGroup}>
                            {/* Type Filter */}
                            <Pressable onPress={(e) => e.stopPropagation()}>
                                <View>
                                    <TouchableOpacity style={styles.filterButton} onPress={toggleTypeDropdown}>
                                        <Filter size={16} color="#666" />
                                        <Text style={styles.filterButtonText}>{selectedType}</Text>
                                        <ChevronDown size={16} color="#666" />
                                    </TouchableOpacity>
                                    {showTypeDropdown && (
                                        <View style={styles.dropdown}>
                                            {crimeTypes.map(type => (
                                                <TouchableOpacity
                                                    key={type}
                                                    onPress={() => {
                                                        setSelectedType(type);
                                                        setShowTypeDropdown(false);
                                                    }}
                                                    style={styles.dropdownItem}
                                                >
                                                    <Text style={[styles.dropdownItemText, selectedType === type && styles.dropdownItemTextSelected]}>
                                                        {type}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </Pressable>
                            {/* Severity Filter */}
                            <Pressable onPress={(e) => e.stopPropagation()}>
                                <View>
                                    <TouchableOpacity style={styles.filterButton} onPress={toggleSeverityDropdown}>
                                        <Filter size={16} color="#666" />
                                        <Text style={styles.filterButtonText}>{selectedSeverity}</Text>
                                        <ChevronDown size={16} color="#666" />
                                    </TouchableOpacity>
                                    {showSeverityDropdown && (
                                        <View style={styles.dropdown}>
                                            {severityLevels.map(level => (
                                                <TouchableOpacity
                                                    key={level}
                                                    onPress={() => {
                                                        setSelectedSeverity(level);
                                                        setShowSeverityDropdown(false);
                                                    }}
                                                    style={styles.dropdownItem}
                                                >
                                                    <Text style={[styles.dropdownItemText, selectedSeverity === level && styles.dropdownItemTextSelected]}>
                                                        {level}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </Pressable>
                            {/* Date Filter */}
                            <View style={styles.dateFilterContainer}>
                                <Calendar size={16} color="#666" style={{ marginRight: 4 }} />
                                {/* Start Date Picker */}
                                {Platform.OS === 'web' ? (
                                    <input
                                        type="date"
                                        value={toISODate(startDate)}
                                        onChange={e => setStartDate(e.target.value)}
                                        style={{
                                            border: '1px solid #e5e5e5',
                                            borderRadius: 8,
                                            padding: '8px 10px',
                                            fontSize: 14,
                                            color: '#444',
                                            outline: 'none',
                                            marginRight: 4
                                        }}
                                        placeholder="Start Date"
                                    />
                                ) : (
                                    <TouchableOpacity
                                        style={styles.dateInput}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <Text style={{ color: startDate ? '#444' : '#aaa', fontSize: 14 }}>
                                            {startDate ? startDate : 'Start Date'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                {/* End Date Picker */}
                                {Platform.OS === 'web' ? (
                                    <input
                                        type="date"
                                        value={toISODate(endDate)}
                                        onChange={e => setEndDate(e.target.value)}
                                        style={{
                                            border: '1px solid #e5e5e5',
                                            borderRadius: 8,
                                            padding: '8px 10px',
                                            fontSize: 14,
                                            color: '#444',
                                            outline: 'none',
                                            marginRight: 4
                                        }}
                                        placeholder="End Date"
                                    />
                                ) : (
                                    <TouchableOpacity
                                        style={styles.dateInput}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <Text style={{ color: endDate ? '#444' : '#aaa', fontSize: 14 }}>
                                            {endDate ? endDate : 'End Date'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                {/* Clear buttons for both */}
                                {startDate ? (
                                    <TouchableOpacity onPress={() => setStartDate('')} style={styles.clearDateButton}>
                                        <Text style={styles.clearDateText}>×</Text>
                                    </TouchableOpacity>
                                ) : null}
                                {endDate ? (
                                    <TouchableOpacity onPress={() => setEndDate('')} style={styles.clearDateButton}>
                                        <Text style={styles.clearDateText}>×</Text>
                                    </TouchableOpacity>
                                ) : null}
                                {/* Native Date Picker Modal */}
                                {showDatePicker && Platform.OS !== 'web' && (
                                    <DateTimePicker
                                        value={selectedDate ? new Date(selectedDate) : new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={handleDateChange}
                                    />
                                )}
                            </View>
                            {/* Reset Button */}
                            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                                <RefreshCw size={18} color="#e02323" />
                                <Text style={styles.resetText}>Reset</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.exportGroup}>
                            <TouchableOpacity style={styles.exportButton} onPress={exportToPdf}>
                                <Text style={styles.exportText}>Export All to PDF</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.exportButton} onPress={exportToExcel}>
                                <Text style={styles.exportText}>Export All to Excel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                
                <View style={[styles.tableContainer, Platform.OS === 'web' && { overflow: 'scroll' }]}>
                    <FlatList
                        data={paginatedData}
                        keyExtractor={(item) => `${item.alertId}`}
                        ListHeaderComponent={() => (
                            <View style={styles.tableHeader}>
                                <Text style={[styles.headerCell, { flex: 1 }]}>ALERT ID</Text>
                                <Text style={[styles.headerCell, { flex: 2 }]}>NAME</Text>
                                <Text style={[styles.headerCell, { flex: 3 }]}>ADDRESS</Text>
                                <Text style={[styles.headerCell, { flex: 2 }]}>DATE</Text>
                                <Text style={[styles.headerCell, { flex: 2 }]}>TYPE</Text>
                                <Text style={[styles.headerCell, { flex: 2 }]}>SEVERITY</Text>
                                <Text style={[styles.headerCell, { flex: 2 }]}>RESPONDED BY</Text>
                            </View>
                        )}
                        renderItem={({ item }) => (
                            <View style={styles.tableRow}>
                                <HighlightText style={[styles.cell, { flex: 1 }]} text={item.alertId} highlight={searchQuery} />
                                <HighlightText style={[styles.cell, { flex: 2 }]} text={item.name || 'N/A'} highlight={searchQuery} />
                                <HighlightText style={[styles.cell, { flex: 3 }]} text={formatAddress(item.address)} highlight={searchQuery} />
                                <HighlightText style={[styles.cell, { flex: 2 }]} text={formatDate(item.date)} highlight={searchQuery} />
                                <HighlightText style={[styles.cell, { flex: 2 }]} text={item.type || 'N/A'} highlight={searchQuery} />
                                <HighlightText style={[styles.cell, { flex: 2 }]} text={item.severity || 'N/A'} highlight={searchQuery} />
                                <HighlightText style={[styles.cell, { flex: 2 }]} text={item.respondedBy} highlight={searchQuery} />
                            </View>
                        )}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        ListEmptyComponent={<Text style={styles.emptyListText}>No records found.</Text>}
                    />
                </View>

                <View style={{ flex: 1 }} />

                {filteredData.length > 0 && (
                    <View style={styles.pagination}>
                        <Text style={styles.paginationText}>Showing {showStart}-{showEnd} of {filteredData.length}</Text>
                        <View style={styles.paginationControls}>
                            <TouchableOpacity
                                style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                                onPress={() => setCurrentPage(c => Math.max(1, c - 1))}
                                disabled={currentPage === 1}
                            >
                                <Text style={[styles.pageButtonText, currentPage === 1 && styles.pageButtonTextDisabled]}>Previous</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
                                onPress={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <Text style={[styles.pageButtonText, currentPage === totalPages && styles.pageButtonTextDisabled]}>Next</Text>
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
        padding: 24,
        paddingBottom: 0,
        backgroundColor: '#f8f9fa',
        zIndex: 10,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 24, fontWeight: '700', color: '#202224' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, width: 300, height: 44, borderWidth: 1, borderColor: '#e5e5e5' },
    searchInput: { marginLeft: 12, flex: 1, fontSize: 15, color: '#333' },
    filtersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 24,
    },
    filterGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    exportGroup: { flexDirection: 'row', gap: 10 },
    exportButton: { backgroundColor: '#e02323', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16 },
    exportText: { color: 'white', fontWeight: '600', fontSize: 14 },
    filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, gap: 6, borderWidth: 1, borderColor: '#e5e5e5' },
    filterButtonText: { fontSize: 14, fontWeight: '500', color: '#444' },
    resetButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff3f3', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    resetText: { fontSize: 14, fontWeight: '600', color: '#e02323' },
    tableContainer: {
        marginHorizontal: 24,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
        height: 400, // Fixed height for scrollable area
        // overflow: 'auto', // Moved to inline style for web only
    },
    tableHeader: { flexDirection: 'row', backgroundColor: '#fcfcfc', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerCell: { fontSize: 12, fontWeight: '600', color: '#666', paddingHorizontal: 4, textAlign: 'center' },
    tableRow: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 16, alignItems: 'center' },
    cell: { fontSize: 14, color: '#444', paddingHorizontal: 4, textAlign: 'center' },
    separator: { height: 1, backgroundColor: '#eee' },
    emptyListText: { textAlign: 'center', padding: 20, fontSize: 16, color: '#666' },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
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
        right: 0,
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
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#333',
    },
    dropdownItemTextSelected: {
        color: '#e02323',
        fontWeight: '600',
    },
    highlightedText: {
        backgroundColor: '#fff8b4'
    },
    dateFilterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#e5e5e5',
        gap: 8,
    },
    dateInput: {
        flex: 1,
        paddingVertical: 0,
        paddingHorizontal: 0,
        fontSize: 14,
        color: '#444',
    },
    clearDateButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    clearDateText: {
        fontSize: 18,
        color: '#aaa',
    }
});
