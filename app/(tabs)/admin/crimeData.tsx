import { Calendar, ChevronDown, Eye, Filter, RefreshCw, Search } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    Modal // Add Modal for details view
    ,










































































































































    Platform, // Import Platform A
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
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
    // New fields from ReportStep
    description?: string;
    suspect_option?: string;
    suspect_description?: string;
    suspect_known_description?: string;
    suspect_name?: string;
    suspect_age?: string;
    suspect_sex?: string;
    suspect_nationality?: string;
    suspect_address?: string;
    weapon_option?: string;
    weapon_used?: string;
    vehicle_option?: string;
    vehicle_involved?: string;
    evidence_secured?: string;
    items_left_behind?: string;
    items_stolen?: string;
    evidence_details?: string;
    motive_known?: string;
    prior_conflict?: string;
    victims_involved?: string;
    injuries_fatalities?: string;
    medical_help?: string;
    security_cameras?: string;
    status?: string;
    station?: string;
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

// Helper to check if a date string is valid (not empty, not placeholder)
function isValidDateString(dateString: string) {
    if (!dateString) return false;
    if (dateString === 'dd/mm/yyyy' || dateString === 'yyyy-mm-dd') return false;
    if (dateString.includes('-')) {
        // ISO format
        return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
    }
    // DD/MM/YYYY
    return /^\d{2}\/\d{2}\/\d{4}$/.test(dateString);
}

// Add these helper functions above the component:
const getSeverityStyle = (severity: string | null) => {
  switch ((severity || '').toLowerCase()) {
    case 'low': return styles.severitylow;
    case 'medium': return styles.severitymedium;
    case 'high': return styles.severityhigh;
    default: return {};
  }
};
const getStatusStyle = (status: string | null) => {
  switch ((status || '').toLowerCase()) {
    case 'pending': return styles.statuspending;
    case 'responded': return styles.statusresponded;
    case 'resolved': return styles.statusresolved;
    default: return {};
  }
};

export default function CrimeData() {
    // --- State and Hooks ---
    const [isLoading, setIsLoading] = useState(true);
    const [masterCrimeData, setMasterCrimeData] = useState<CrimeRecord[]>([]);
    const [selectedType, setSelectedType] = useState('All Types');
    const [selectedSeverity, setSelectedSeverity] = useState('All Severities');
    const [selectedOfficer, setSelectedOfficer] = useState('All Officers');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);
    const [showOfficerDropdown, setShowOfficerDropdown] = useState(false);
    const [hoveredType, setHoveredType] = useState<string | null>(null);
    const [hoveredSeverity, setHoveredSeverity] = useState<string | null>(null);
    const [hoveredOfficer, setHoveredOfficer] = useState<string | null>(null);
    // Date filter state
    const [selectedDate, setSelectedDate] = useState<string>(''); // format: 'YYYY-MM-DD'
    const [showDatePicker, setShowDatePicker] = useState(false);
    // Add state for date range
    const [startDate, setStartDate] = useState<string>(''); // format: 'DD/MM/YYYY' or 'YYYY-MM-DD'
    const [endDate, setEndDate] = useState<string>('');
    // Compute unique officer options
    const officerOptions = useMemo(() => {
      const officers = Array.from(new Set(masterCrimeData.map(item => item.respondedBy).filter(Boolean)));
      officers.sort();
      return ['All Officers', ...officers];
    }, [masterCrimeData]);

    // Compute unique status options
    const statusOptions = useMemo(() => {
      const statuses = Array.from(new Set(masterCrimeData.map(item => item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'N/A')));
      statuses.sort();
      return ['All Status', ...statuses.filter(s => s !== 'N/A')];
    }, [masterCrimeData]);

    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
    // Modal state for viewing details
    const [selectedRecord, setSelectedRecord] = useState<CrimeRecord | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Function to log crime record view
    const logCrimeRecordView = async (record: CrimeRecord) => {
        try {
            const logData = {
                alert_id: record.alertId,
                viewed_by: 'admin', // You can modify this to get actual admin user
                viewed_at: new Date().toISOString(),
                record_type: 'crime_record',
                action: 'view_details'
            };

            const response = await fetch('http://mnl911.atwebpages.com/log_crime_record_view.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logData)
            });

            const result = await response.json();
            if (!result.success) {
                console.error('Failed to log crime record view:', result.error);
            }
        } catch (error) {
            console.error('Error logging crime record view:', error);
        }
    };

    // Function to log crime record download
    const logCrimeRecordDownload = async (record: CrimeRecord) => {
        try {
            const logData = {
                alert_id: record.alertId,
                downloaded_by: 'admin', // You can modify this to get actual admin user
                downloaded_at: new Date().toISOString(),
                record_type: 'crime_record',
                action: 'download_pdf'
            };

            const response = await fetch('http://mnl911.atwebpages.com/log_crime_record_download.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logData)
            });

            const result = await response.json();
            if (!result.success) {
                console.error('Failed to log crime record download:', result.error);
            }
        } catch (error) {
            console.error('Error logging crime record download:', error);
        }
    };

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
        if (selectedOfficer !== 'All Officers') {
            result = result.filter(item => item.respondedBy === selectedOfficer);
        }
        if (selectedStatus !== 'All Status') {
            result = result.filter(item => {
                if (!item.status) return false;
                return (item.status.charAt(0).toUpperCase() + item.status.slice(1)) === selectedStatus;
            });
        }
        // Date filter: only one type of filter should be active at a time
        const validStart = isValidDateString(startDate) ? toISODate(startDate) : null;
        const validEnd = isValidDateString(endDate) ? toISODate(endDate) : null;
        if (validStart || validEnd) {
            result = result.filter(item => {
                const utcDateString = item.date.replace(' ', 'T').slice(0, 10);
                if (validStart && validEnd) {
                    return utcDateString >= validStart && utcDateString <= validEnd;
                } else if (validStart) {
                    return utcDateString === validStart;
                } else if (validEnd) {
                    return utcDateString === validEnd;
                }
                return true;
            });
        } else if (selectedDate) {
            const isoSelectedDate = toISODate(selectedDate);
            if (isoSelectedDate) {
                result = result.filter(item => {
                    const utcDateString = item.date.replace(' ', 'T').slice(0, 10);
                    return utcDateString === isoSelectedDate;
                });
            }
        }
        // Use Set for faster deduplication
        const seen = new Set();
        result = result.filter(item => {
            const duplicate = seen.has(item.alertId);
            seen.add(item.alertId);
            return !duplicate;
        });
        // Sort once at the end
        result.sort((a, b) => {
            // Compare by date (ascending)
            const dateA = new Date(a.date.replace(' ', 'T'));
            const dateB = new Date(b.date.replace(' ', 'T'));
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;
            // If dates are equal, fallback to alertId
            return parseInt(a.alertId) - parseInt(b.alertId);
        });
        return result;
    }, [masterCrimeData, searchQuery, selectedType, selectedSeverity, selectedOfficer, selectedStatus, selectedDate, startDate, endDate]);

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
        setSelectedOfficer('All Officers');
        setSearchQuery('');
        setSelectedDate('');
        setStartDate('');
        setEndDate('');
        setSelectedStatus('All Status');
    };

    const handleCloseDropdowns = () => {
        setShowTypeDropdown(false);
        setShowSeverityDropdown(false);
        setShowOfficerDropdown(false);
        setShowStatusDropdown(false);
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
    const generatePdfHtml = (data: CrimeRecord[], title: string, includeFooter: boolean = true): string => {
      const generatedAt = new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
      });

      if (data.length === 1) {
          const item = data[0];
          return `
              <html>
                  <head>
                      <style>
                          body {
                              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                              color: #222;
                              margin: 24px;
                              line-height: 1.25;
                              font-size: 13px;
                          }
                          .header-title {
                              font-size: 22px;
                              font-weight: bold;
                              letter-spacing: 2px;
                              margin-bottom: 2px;
                              text-transform: uppercase;
                          }
                          .header-sub {
                              font-size: 13px;
                              color: #444;
                              margin-bottom: 2px;
                              letter-spacing: 1px;
                          }
                          .section-title {
                              font-size: 16px;
                              font-weight: bold;
                              color: #e02323;
                              margin-top: 10px;
                              margin-bottom: 4px;
                              letter-spacing: 1px;
                          }
                          .row {
                              display: flex;
                              flex-direction: row;
                              align-items: center;
                              margin-bottom: 4px;
                          }
                          .label {
                              font-weight: bold;
                              font-size: 12px;
                              color: #222;
                              text-transform: uppercase;
                              min-width: 110px;
                          }
                          .value-line {
                              border-bottom: 1px solid #222;
                              flex: 1;
                              min-height: 16px;
                              display: flex;
                              align-items: center;
                          }
                          .value {
                              font-size: 12px;
                              color: #222;
                              padding-left: 2px;
                          }
                          .columns {
                              width: 100%;
                              display: flex;
                              flex-direction: row;
                              gap: 24px;
                          }
                          .column {
                              flex: 1;
                              min-width: 0;
                          }
                          .officer-box {
                              margin-top: 8px;
                              text-align: right;
                          }
                          .officer-label {
                              font-size: 10px;
                              color: #444;
                              font-weight: bold;
                              text-transform: uppercase;
                          }
                          .officer-value {
                              font-size: 11px;
                              color: #222;
                          }
                          .suspect-details {
                              page-break-inside: avoid;
                          }
                          .section-title.first {
                              margin-top: 40px;
                          }
                          .section-title:not(.first) {
                              margin-top: 24px;
                          }
                      </style>
                  </head>
                  <body>
                      <div style="width: 100%; text-align: right; font-size: 11px; font-weight: bold; letter-spacing: 1px; margin-bottom: 2px;">
                           ALERT #${item.alertId}
                      </div>
                      <div style="text-align: center; margin-bottom: 10px;">
                          <div class="header-title">ALERTO MNL</div>
                          <div class="header-sub">Crime Incident Report</div>
                          <div class="header-sub">City of Manila Police District</div>
                      </div>
                      <div class="columns">
                          <div class="column">
                              <div class="section-title first">CRIME REPORT</div>
                              <div class="row"><div class="label">NATURE OF CASE :</div><div class="value-line"><span class="value">${item.type === 'N/A' ? 'None' : (item.type || 'None')}</span></div></div>
                              <div class="row"><div class="label">VICTIM NAME :</div><div class="value-line"><span class="value">${item.name || 'N/A'}</span></div></div>
                              <div class="row"><div class="label">DATE & TIME :</div><div class="value-line"><span class="value">${formatDate(item.date || '')}</span></div></div>
                              <div class="row"><div class="label">PLACE OF OCCURRENCE :</div><div class="value-line"><span class="value">${item.address || ''}</span></div></div>
                              <div class="section-title">SUSPECT</div>
                              <div class="suspect-details">
                                <div class="row"><div class="label">SUSPECT IDENTIFICATION :</div><div class="value-line"><span class="value">${item.suspect_option === 'N/A' ? 'Unknown' : item.suspect_option === 'IF KNOWN' ? 'Known' : item.suspect_option === 'Description' ? 'Described' : (item.suspect_option || 'Unknown')}</span></div></div>
                                ${item.suspect_option === 'Description' ? `<div class="row"><div class="label">SUSPECT DESCRIPTION :</div><div class="value-line"><span class="value">${item.suspect_description || 'N/A'}</span></div></div>` : ''}
                                ${item.suspect_option === 'IF KNOWN' ? `
                                    <div class="row"><div class="label">NAME :</div><div class="value-line"><span class="value">${item.suspect_name || 'N/A'}</span></div></div>
                                    <div class="row"><div class="label">AGE :</div><div class="value-line"><span class="value">${item.suspect_age || 'N/A'}</span></div></div>
                                    <div class="row"><div class="label">SEX :</div><div class="value-line"><span class="value">${item.suspect_sex || 'N/A'}</span></div></div>
                                    <div class="row"><div class="label">ADDRESS :</div><div class="value-line"><span class="value">${item.suspect_address || 'N/A'}</span></div></div>
                                    <div class="row"><div class="label">DESCRIPTION :</div><div class="value-line"><span class="value">${item.suspect_known_description || 'N/A'}</span></div></div>
                                ` : ''}
                              </div>
                              <div class="section-title">WEAPON USED</div>
                              <div class="row"><div class="label">WEAPON :</div><div class="value-line"><span class="value">${item.weapon_option === 'N/A' ? 'Unknown' : item.weapon_option === 'IF KNOWN' ? 'Known' : (item.weapon_option || 'Unknown')}</span></div></div>
                              ${item.weapon_option === 'IF KNOWN' ? `<div class="row"><div class="label">WEAPON USED :</div><div class="value-line"><span class="value">${item.weapon_used || 'N/A'}</span></div></div>` : ''}
                              <div class="section-title">VEHICLE INVOLVED</div>
                              <div class="row"><div class="label">VEHICLE :</div><div class="value-line"><span class="value">${item.vehicle_option === 'N/A' ? 'Unknown' : item.vehicle_option === 'IF KNOWN' ? 'Known' : (item.vehicle_option || 'Unknown')}</span></div></div>
                              ${item.vehicle_option === 'IF KNOWN' ? `<div class="row"><div class="label">VEHICLE INVOLVED :</div><div class="value-line"><span class="value">${item.vehicle_involved || 'N/A'}</span></div></div>` : ''}
                          </div>
                          <div class="column">
                              <div class="section-title first">EVIDENCE COLLECTION</div>
                              <div class="row"><div class="label">AREA SECURED :</div><div class="value-line"><span class="value">${item.evidence_secured || 'N/A'}</span></div></div>
                              <div class="row"><div class="label">ITEMS LEFT BEHIND :</div><div class="value-line"><span class="value">${item.items_left_behind || 'N/A'}</span></div></div>
                              <div class="row"><div class="label">ITEMS STOLEN :</div><div class="value-line"><span class="value">${item.items_stolen || 'N/A'}</span></div></div>
                              <div class="section-title">MOTIVE & CONTEXT</div>
                              <div class="row"><div class="label">MOTIVE KNOWN :</div><div class="value-line"><span class="value">${item.motive_known || 'N/A'}</span></div></div>
                              <div class="row"><div class="label">PRIOR CONFLICT :</div><div class="value-line"><span class="value">${item.prior_conflict || 'N/A'}</span></div></div>
                              <div class="section-title">OTHER INFORMATION</div>
                              <div class="row"><div class="label">VICTIMS INVOLVED :</div><div class="value-line"><span class="value">${item.victims_involved || 'N/A'}</span></div></div>
                              <div class="row"><div class="label">INJURIES/FATALITIES :</div><div class="value-line"><span class="value">${item.injuries_fatalities || 'N/A'}</span></div></div>
                              <div class="row"><div class="label">MEDICAL HELP :</div><div class="value-line"><span class="value">${item.medical_help || 'N/A'}</span></div></div>
                              <div class="row"><div class="label">SECURITY CAMERAS :</div><div class="value-line"><span class="value">${item.security_cameras || 'N/A'}</span></div></div>
                              <div class="section-title">OTHER DETAILS</div>
                              <div class="row"><div class="label">DESCRIPTION :</div><div class="value-line"><span class="value">${item.description || 'N/A'}</span></div></div>
                          </div>
                      </div>
                      <div class="officer-box">
                          <div class="officer-label">NAME OF OFFICER-ON-CASE</div>
                          <div class="officer-value">${item.respondedBy || 'N/A'}</div>
                          <div class="officer-label">RANK</div>
                          <div class="officer-value">Police Officer I (PO1)</div>
                          <div class="officer-label">DESIGNATION</div>
                          <div class="officer-value">${item.station || 'Unknown'}</div>
                          <div class="officer-label">STATUS</div>
                          <div class="officer-value">${item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1)) : 'N/A'}</div>
                      </div>
                  </body>
                  ${includeFooter ? `
                  <div style="width: 100%; text-align: center; font-size: 12px; color: #888; margin-top: 10px;">
                    Exported on: ${new Date().toLocaleString('en-PH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                      timeZone: 'Asia/Manila',
                    })}
                  </div>
              </html>` : ''}
          `;
      }

      // For multiple records, use the original table format
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
                  ${includeFooter ? `
                  <div style="width: 100%; text-align: center; font-size: 12px; color: #888; margin-top: 32px;">
                    Exported on: ${new Date().toLocaleString('en-PH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                      timeZone: 'Asia/Manila',
                    })}
                  </div>` : ''}
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
      const htmlContent = generatePdfHtml(filteredData, reportTitle, false);

      if (Platform.OS === 'web') {
        try {
          const element = document.createElement('div');
          element.innerHTML = htmlContent;
          const opt = {
            margin: 0.5,
            filename: `${reportTitle.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
          };
          // @ts-ignore - Assume html2pdf is loaded globally
          if (typeof html2pdf === 'undefined') {
            alert('PDF export failed: html2pdf.js is not loaded.');
            return;
          }
          html2pdf().from(element).set(opt).save();
        } catch (error) {
          console.error('Error exporting to PDF:', error);
          alert('Failed to export PDF. Please try again.');
        }
      } else {
        // Native (mobile) fallback
        try {
          const { uri } = await Print.printToFileAsync({ html: htmlContent });
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Share PDF Report'
          });
        } catch (error) {
          console.error('Error exporting to PDF:', error);
          alert('Failed to export PDF. Please try again.');
        }
      }
    };
  
    
    /**
     * Creates and handles PDF export for a SINGLE RECORD.
     */
    const downloadSingleRecord = async (record: CrimeRecord) => {
        // Log the download action
        await logCrimeRecordDownload(record);
        
        const reportTitle = `ALERTOMNL - Crime Record #${record.alertId}`;
        const htmlContent = generatePdfHtml([record], reportTitle, true);

        if (Platform.OS === 'web') {
            // Use html2pdf.js on Web to convert HTML to PDF and auto-download
            const element = document.createElement('div');
            element.innerHTML = htmlContent;

            const opt = {
                margin: 0.5,
                filename: `${reportTitle.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
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

    // Print single record as PDF and open print dialog
    const printSingleRecord = async (record: CrimeRecord) => {
      const reportTitle = `ALERTOMNL - Crime Record #${record.alertId}`;
      const htmlContent = generatePdfHtml([record], reportTitle, true);
      if (Platform.OS === 'web') {
        try {
          const element = document.createElement('div');
          element.innerHTML = htmlContent;
          const opt = {
            margin: 0.5,
            filename: `${reportTitle.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
          };
          // @ts-ignore
          if (typeof html2pdf === 'undefined') {
            alert('Print failed: html2pdf.js is not loaded.');
            return;
          }
          // @ts-ignore
          html2pdf().from(element).set(opt).toPdf().get('pdf').then(function (pdf) {
            // @ts-ignore
            const blobUrl = pdf.output('bloburl');
            const printWindow = window.open(blobUrl, '_blank');
            if (printWindow) {
              printWindow.onload = function () {
                printWindow.print();
              };
            }
          });
        } catch (error) {
          alert('Failed to print PDF. Please try again.');
        }
      } else {
        // Native (mobile) fallback
        try {
          await Print.printAsync({ html: htmlContent });
        } catch (error) {
          alert('Failed to print PDF. Please try again.');
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

    // [EXPERIMENTAL] Export all filtered records as formal PDFs (multi-page, bond-paper style)
    const exportFilteredFormalPdfs = async () => {
      // Check if all filters are at default (no filter applied)
      const noFilter =
        selectedType === 'All Types' &&
        selectedSeverity === 'All Severities' &&
        selectedOfficer === 'All Officers' &&
        selectedStatus === 'All Status' &&
        !selectedDate &&
        !startDate &&
        !endDate &&
        !searchQuery;
      if (noFilter) {
        alert('Please apply a filter before exporting. Exporting all records as formal PDFs is not allowed.');
        return;
      }
      if (filteredData.length === 0) {
        alert('No data to export.');
        return;
      }
      if (filteredData.length > 20) {
        if (!window.confirm('You are about to export more than 20 crime reports. This may take a while to generate a large PDF. Continue?')) {
          return;
        }
      }
      const reportTitle = `ALERTOMNL - Crime Records (Formal)`;
      // Generate a formal PDF for every record, regardless of missing fields
      const allHtml = filteredData
        .map(record => generatePdfHtml([record], `ALERTOMNL - Crime Record #${record.alertId}`, true))
        .join('<div style="page-break-after: always"></div>');

      const htmlContent = `<html><body>${allHtml}</body></html>`;

      if (Platform.OS === 'web') {
        try {
          const element = document.createElement('div');
          element.innerHTML = htmlContent;
          const opt = {
            margin: 0.5,
            filename: `${reportTitle.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
          };
          // @ts-ignore
          if (typeof html2pdf === 'undefined') {
            alert('PDF export failed: html2pdf.js is not loaded.');
            return;
          }
          // @ts-ignore
          html2pdf().from(element).set(opt).save();
        } catch (error) {
          alert('Failed to export PDF. Please try again.');
        }
      } else {
        // Native (mobile) fallback
        try {
          await Print.printAsync({ html: htmlContent });
        } catch (error) {
          alert('Failed to print PDF. Please try again.');
        }
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

                    <View style={styles.filtersRow}>
                      <View style={styles.filterGroupRow}>
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
                        {/* Officer Filter */}
                        <Pressable onPress={e => e.stopPropagation()}>
                          <View>
                            <TouchableOpacity style={styles.filterButton} onPress={() => {
                              setShowOfficerDropdown(prev => !prev);
                              setShowTypeDropdown(false);
                              setShowSeverityDropdown(false);
                              setShowStatusDropdown(false);
                            }}>
                              <Filter size={16} color="#666" />
                              <Text style={styles.filterButtonText}>{selectedOfficer}</Text>
                              <ChevronDown size={16} color="#666" />
                            </TouchableOpacity>
                            {showOfficerDropdown && (
                              <View style={styles.dropdown}>
                                {officerOptions.map(officer => (
                                  <TouchableOpacity
                                    key={officer}
                                    onPress={() => {
                                      setSelectedOfficer(officer);
                                      setShowOfficerDropdown(false);
                                    }}
                                    style={styles.dropdownItem}
                                  >
                                    <Text style={selectedOfficer === officer ? [styles.dropdownItemText, styles.dropdownItemTextSelected] : styles.dropdownItemText}>
                                      {officer}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            )}
                          </View>
                        </Pressable>
                        {/* Status Filter */}
                        <Pressable onPress={e => e.stopPropagation()}>
                          <View>
                            <TouchableOpacity style={styles.filterButton} onPress={() => {
                              setShowStatusDropdown(prev => !prev);
                              setShowTypeDropdown(false);
                              setShowSeverityDropdown(false);
                              setShowOfficerDropdown(false);
                            }}>
                              <Filter size={16} color="#666" />
                              <Text style={styles.filterButtonText}>{selectedStatus}</Text>
                              <ChevronDown size={16} color="#666" />
                            </TouchableOpacity>
                            {showStatusDropdown && (
                              <View style={styles.dropdown}>
                                {statusOptions.map(status => (
                                  <TouchableOpacity
                                    key={status}
                                    onPress={() => {
                                      setSelectedStatus(status);
                                      setShowStatusDropdown(false);
                                    }}
                                    style={styles.dropdownItem}
                                  >
                                    <Text style={selectedStatus === status ? [styles.dropdownItemText, styles.dropdownItemTextSelected] : styles.dropdownItemText}>
                                      {status}
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
                                    value={startDate ? toISODate(startDate) : ''}
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
                                    value={endDate ? toISODate(endDate) : ''}
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
                            <Text style={styles.resetText}>Reset Filters</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.exportRow}>
                      <View style={styles.exportGroupRow}>
                        <TouchableOpacity style={styles.exportButton} onPress={exportToPdf}>
                            <Text style={styles.exportText}>Export All to PDF</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.exportButton} onPress={exportToExcel}>
                            <Text style={styles.exportText}>Export All to Excel</Text>
                        </TouchableOpacity>
                        {/* [EXPERIMENTAL] Export all filtered as formal PDFs */}
                        <TouchableOpacity style={styles.exportButton} onPress={exportFilteredFormalPdfs}>
                            <Text style={styles.exportText}>Export Filtered to PDFs</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                </View>
                
                {/* Wrap table and pagination in a ScrollView for small screens */}
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}>
                    <View style={[styles.tableContainer, Platform.OS === 'web' && { overflow: 'scroll' }]}> 
                        <FlatList
                            data={paginatedData}
                            keyExtractor={(item) => `${item.alertId}`}
                            scrollEnabled={false}
                            ListHeaderComponent={() => (
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.headerCell, { flex: 1 }]}>ALERT ID</Text>
                                    <Text style={[styles.headerCell, { flex: 2 }]}>VICTIM NAME</Text>
                                    <Text style={[styles.headerCell, { flex: 3 }]}>ADDRESS</Text>
                                    <Text style={[styles.headerCell, { flex: 2 }]}>DATE</Text>
                                    <Text style={[styles.headerCell, { flex: 2 }]}>TYPE</Text>
                                    <Text style={[styles.headerCell, { flex: 2 }]}>SEVERITY</Text>
                                    <Text style={[styles.headerCell, { flex: 2 }]}>RESPONDED BY</Text>
                                    <Text style={[styles.headerCell, { flex: 1.5 }]}>STATUS</Text>
                                    <Text style={[styles.headerCell, styles.viewHeaderCell]}>VIEW</Text>
                                </View>
                            )}
                            renderItem={({ item }) => (
                                <View style={styles.tableRow}>
                                    <HighlightText style={[styles.cell, { flex: 1 }]} text={item.alertId} highlight={searchQuery} />
                                    <HighlightText style={[styles.cell, { flex: 2 }]} text={item.name || 'N/A'} highlight={searchQuery} />
                                    <HighlightText style={[styles.cell, { flex: 3 }]} text={formatAddress(item.address)} highlight={searchQuery} />
                                    <HighlightText style={[styles.cell, { flex: 2 }]} text={formatDate(item.date)} highlight={searchQuery} />
                                    <HighlightText style={[styles.cell, { flex: 2 }]} text={item.type || 'N/A'} highlight={searchQuery} />
                                    <View style={[styles.cell, { flex: 2 }]}> {/* Severity badge */}
                                      <Text style={[styles.severityBadge, getSeverityStyle(item.severity ?? null)]}>{item.severity || 'N/A'}</Text>
                                    </View>
                                    <HighlightText style={[styles.cell, { flex: 2 }]} text={item.respondedBy} highlight={searchQuery} />
                                    <View style={[styles.cell, { flex: 1.5 }]}> {/* Status badge */}
                                      <Text style={[styles.statusBadge, getStatusStyle(item.status ?? null)]}>{item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1)) : 'N/A'}</Text>
                                    </View>
                                    <View style={[styles.cell, styles.viewCell]}>
                                        <TouchableOpacity
                                            style={styles.viewButton}
                                            onPress={() => {
                                                setSelectedRecord(item);
                                                setShowDetailsModal(true);
                                                logCrimeRecordView(item);
                                            }}
                                        >
                                            <Eye size={16} color="#fff" style={{ marginRight: 4 }} />
                                            <Text style={styles.viewButtonText}>View</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                            ListEmptyComponent={<Text style={styles.emptyListText}>No records found.</Text>}
                        />
                    </View>

                    {filteredData.length > 0 && (
                        <View style={styles.pagination}>
                            {/* Adjusted pagination text to always show 1-10, 11-20, etc. except for last page */}
                            <Text style={styles.paginationText}>
                                Showing {(currentPage - 1) * itemsPerPage + 1}-
                                {currentPage === totalPages ? showEnd : currentPage * itemsPerPage} of {filteredData.length}
                            </Text>
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
                </ScrollView>
                {/* Details Modal */}
                <Modal
                    visible={showDetailsModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowDetailsModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.bondPaperModalContent}>
                            {/* Formal Crime Report Header */}
                            <View style={styles.formalHeader}>
                                <Text style={styles.formalHeaderTitle}>ALERTO MNL</Text>
                                <Text style={styles.formalHeaderSub}>Crime Incident Report</Text>
                                <Text style={styles.formalHeaderSub}>City of Manila Police District</Text>
                            </View>
                            <Text style={styles.formalSectionTitle}>CRIME REPORT</Text>
                            <ScrollView contentContainerStyle={styles.bondPaperScrollContent}>
                                {/* Formal format for all fields */}
                                <View style={styles.formalRow}><Text style={styles.formalLabel}>NATURE OF CASE :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.type === 'N/A' ? 'None' : (selectedRecord?.type || 'None')}</Text></View></View>
                                <View style={styles.formalRow}><Text style={styles.formalLabel}>VICTIM NAME :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.name || 'N/A'}</Text></View></View>
                                <View style={styles.formalRow}><Text style={styles.formalLabel}>DATE & TIME :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{formatDate(selectedRecord?.date || '')}</Text></View></View>
                                <View style={styles.formalRow}><Text style={styles.formalLabel}>PLACE OF OCCURRENCE :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.address || ''}</Text></View></View>
                                {/* Section: Suspect */}
                                <Text style={styles.formalSectionTitle}>SUSPECT</Text>
                                <View style={styles.formalRow}><Text style={styles.formalLabel}>SUSPECT IDENTIFICATION :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{
                                   selectedRecord?.suspect_option === 'N/A' ? 'Unknown' :
                                   selectedRecord?.suspect_option?.toLowerCase() === 'if known' ? 'Known' :
                                   selectedRecord?.suspect_option === 'Description' ? 'Described' :
                                   selectedRecord?.suspect_option || 'Unknown'
                                 }</Text></View></View>
                                {selectedRecord?.suspect_option === 'Description' && (
                                    <View style={styles.formalRow}><Text style={styles.formalLabel}>SUSPECT DESCRIPTION :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.suspect_description || 'N/A'}</Text></View></View>
                                )}
                                {selectedRecord?.suspect_option === 'IF KNOWN' && (
                                    <>
                                        <View style={styles.formalRow}><Text style={styles.formalLabel}>NAME :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.suspect_name || 'N/A'}</Text></View></View>
                                        <View style={styles.formalRow}><Text style={styles.formalLabel}>AGE :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.suspect_age || 'N/A'}</Text></View></View>
                                        <View style={styles.formalRow}><Text style={styles.formalLabel}>SEX :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.suspect_sex || 'N/A'}</Text></View></View>
                                        <View style={styles.formalRow}><Text style={styles.formalLabel}>ADDRESS :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.suspect_address || 'N/A'}</Text></View></View>
                                        <View style={styles.formalRow}><Text style={styles.formalLabel}>DESCRIPTION :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.suspect_known_description || 'N/A'}</Text></View></View>
                                    </>
                                )}
                                {/* Section: Weapon */}
                                <Text style={styles.formalSectionTitle}>WEAPON USED</Text>
                                <View style={styles.formalRow}><Text style={styles.formalLabel}>WEAPON :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.weapon_option === 'N/A' ? 'Unknown' : selectedRecord?.weapon_option === 'IF KNOWN' ? 'Known' : (selectedRecord?.weapon_option || 'Unknown')}</Text></View></View>
                                {selectedRecord?.weapon_option === 'IF KNOWN' && (
                                    <View style={styles.formalRow}><Text style={styles.formalLabel}>WEAPON USED :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.weapon_used || 'N/A'}</Text></View></View>
                                )}
                                {/* Section: Vehicle */}
                                <Text style={styles.formalSectionTitle}>VEHICLE INVOLVED</Text>
                                <View style={styles.formalRow}><Text style={styles.formalLabel}>VEHICLE :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.vehicle_option === 'N/A' ? 'Unknown' : selectedRecord?.vehicle_option === 'IF KNOWN' ? 'Known' : (selectedRecord?.vehicle_option || 'Unknown')}</Text></View></View>
                                {selectedRecord?.vehicle_option === 'IF KNOWN' && (
                                    <View style={styles.formalRow}><Text style={styles.formalLabel}>VEHICLE INVOLVED :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.vehicle_involved || 'N/A'}</Text></View></View>
                                )}
                                {/* Section: Evidence */}
                                <Text style={styles.formalSectionTitle}>EVIDENCE COLLECTION</Text>
                                <View style={styles.formalRow}><Text style={styles.formalLabel}>AREA SECURED :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.evidence_secured || 'N/A'}</Text></View></View>
                                <View style={styles.formalRow}><Text style={styles.formalLabel}>ITEMS LEFT BEHIND :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.items_left_behind || 'N/A'}</Text></View></View>
                                <View style={styles.formalRow}><Text style={styles.formalLabel}>ITEMS STOLEN :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.items_stolen || 'N/A'}</Text></View></View>
                                {/* Section: Motive & Context */}
                                <Text style={styles.formalSectionTitle}>MOTIVE & CONTEXT</Text>
                                <View style={styles.formalRow}><Text style={styles.formalLabel}>MOTIVE KNOWN :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.motive_known || 'N/A'}</Text></View></View>
                                <View style={styles.formalRow}><Text style={styles.formalLabel}>PRIOR CONFLICT :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.prior_conflict || 'N/A'}</Text></View></View>
                                {/* Section: Victims/Other Info */}
                                <Text style={styles.formalSectionTitle}>OTHER INFORMATION</Text>
                                <View style={styles.formalRow}><Text style={styles.formalLabel}>VICTIMS INVOLVED :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.victims_involved || 'N/A'}</Text></View></View>
                                <View style={styles.formalRow}><Text style={styles.formalLabel}>INJURIES/FATALITIES :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.injuries_fatalities || 'N/A'}</Text></View></View>
                                <View style={styles.formalRow}><Text style={styles.formalLabel}>MEDICAL HELP :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.medical_help || 'N/A'}</Text></View></View>
                                <View style={styles.formalRow}><Text style={styles.formalLabel}>SECURITY CAMERAS :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.security_cameras || 'N/A'}</Text></View></View>
                                {/* Section: Other Details */}
                                <Text style={styles.formalSectionTitle}>OTHER DETAILS</Text>
                                <View style={styles.formalRow}><Text style={styles.formalLabel}>DESCRIPTION :</Text><View style={styles.formalValueLine}><Text style={styles.formalValue}>{selectedRecord?.description || 'N/A'}</Text></View></View>
                                {/* Officer/Unit Info */}
                                <View style={styles.formalOfficerBox}>
                                    <Text style={styles.formalOfficerLabel}>NAME OF OFFICER-ON-CASE</Text>
                                    <Text style={styles.formalOfficerValue}>{selectedRecord?.respondedBy || 'N/A'}</Text>
                                    <Text style={styles.formalOfficerLabel}>RANK</Text>
                                    <Text style={styles.formalOfficerValue}>Police Officer I (PO1)</Text>
                                    <Text style={styles.formalOfficerLabel}>DESIGNATION</Text>
                                    <Text style={styles.formalOfficerValue}>{selectedRecord?.station || 'Unknown'}</Text>
                                    <Text style={styles.formalOfficerLabel}>STATUS</Text>
                                    <Text style={styles.formalOfficerValue}>{selectedRecord?.status ? (selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1)) : 'N/A'}</Text>
                                </View>
                            </ScrollView>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, marginBottom: 0, gap: 16 }}>
                                <TouchableOpacity style={[styles.downloadButton, { flex: 1 }]} onPress={() => selectedRecord && downloadSingleRecord(selectedRecord)}>
                                    <Text style={styles.downloadButtonText}>PDF</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.printButton, { flex: 1 }]} onPress={() => selectedRecord && printSingleRecord(selectedRecord)}>
                                    <Text style={styles.printButtonText}>Print</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowDetailsModal(false)}>
                                <Text style={styles.closeModalButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
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
    filtersRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      gap: 12,
    },
    filterGroupRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 12,
    },
    exportRow: {
      flexDirection: 'row',
      justifyContent: Platform.OS === 'web' ? 'flex-end' : 'center',
      marginBottom: 18,
    },
    exportGroupRow: {
      flexDirection: 'row',
      gap: 10,
    },
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
        // height: 400, // Removed fixed height for dynamic sizing
        // overflow: 'auto', // Moved to inline style for web only
    },
    tableHeader: {
      flexDirection: 'row',
      position: Platform.OS === 'web' ? 'sticky' : 'relative',
      top: 0,
      zIndex: 20,
      backgroundColor: '#fcfcfc',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      flexWrap: 'nowrap',
      width: '100%',
    },
    tableHeaderRow: { flexDirection: 'row', backgroundColor: '#fcfcfc', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
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
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e5e5',
        zIndex: 100,
        maxHeight: 250, // Limit height for scroll
        overflow: 'scroll', // Enable scrolling for RN
    },
    dropdownItem: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#444',
    },
    dropdownItemTextSelected: {
        fontWeight: 'bold',
        color: '#e02323',
        backgroundColor: '#f8f9fa',
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
    },
    viewButton: {
        backgroundColor: '#e02323',
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 13,
    },
    downloadButton: {
        backgroundColor: '#28a745',
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0,
        height: 40,
    },
    downloadButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 13,
    },
    printButton: {
        backgroundColor: '#e02323',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginLeft: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0,
        height: 40,
    },
    printButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 13,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        width: 320,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        color: '#e02323',
        textAlign: 'center',
    },
    modalLabel: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 8,
        color: '#444',
    },
    modalValue: {
        fontWeight: '400',
        color: '#222',
    },
    closeModalButton: {
        marginTop: 10,
        backgroundColor: '#e02323',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    closeModalButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 15,
    },
    viewHeaderCell: {
        flex: 1.2,
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewCell: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    bondPaperModalContent: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1.5,
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 12,
        width: 595, // A4 width at 72dpi
        maxWidth: '95%',
        minHeight: 842, // A4 height at 72dpi
        maxHeight: 842,
        alignSelf: 'center',
        padding: 40,
        marginVertical: 24,
        fontFamily: 'serif',
        justifyContent: 'flex-start',
        // overflow: 'hidden',
    },
    bondPaperScrollContent: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        // zIndex: 1,
    },
    sectionHeader: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#e02323',
        marginTop: 24,
        marginBottom: 8,
        letterSpacing: 0.5,
        // No background, just bold and red
    },
    formalHeader: {
        alignItems: 'center',
        marginBottom: 10,
    },
    formalHeaderTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#222',
        letterSpacing: 2,
        marginBottom: 1,
        textTransform: 'uppercase',
    },
    formalHeaderSub: {
        fontSize: 13,
        color: '#444',
        marginBottom: 1,
        letterSpacing: 1,
    },
    formalSectionTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#e02323',
        marginBottom: 18,
        marginTop: 8,
        letterSpacing: 1,
    },
    formalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    formalLabel: {
        fontWeight: 'bold',
        fontSize: 13,
        color: '#222',
        textTransform: 'uppercase',
    },
    formalColon: {}, // No longer used
    formalValueLine: {
        borderBottomWidth: 1,
        borderColor: '#222',
        borderStyle: 'solid',
        flex: 1,
        minHeight: 24,
        justifyContent: 'center',
    },
    formalValue: {
        fontSize: 13,
        color: '#222',
        paddingLeft: 4,
    },
    formalFactsTitle: {
        fontWeight: 'bold',
        fontSize: 13,
        color: '#222',
        marginTop: 18,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    formalFactsBox: {
        borderWidth: 1,
        borderColor: '#e02323',
        borderRadius: 4,
        minHeight: 60,
        padding: 8,
        marginBottom: 18,
    },
    formalFactsText: {
        fontSize: 13,
        color: '#222',
    },
    formalOfficerBox: {
        alignItems: 'flex-end',
        marginTop: 15,
    },
    formalOfficerLabel: {
        fontSize: 12,
        color: '#444',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    formalOfficerValue: {
        fontSize: 13,
        color: '#222',
        marginBottom: 6,
    },
    severityBadge: { borderRadius: 12, paddingVertical: 2, paddingHorizontal: 10, fontSize: 13, fontWeight: '600', color: '#fff', alignSelf: 'center' },
    severitylow: { backgroundColor: '#4fc3f7' },
    severitymedium: { backgroundColor: '#ffb300' },
    severityhigh: { backgroundColor: '#e02323' },
    statusBadge: { borderRadius: 12, paddingVertical: 2, paddingHorizontal: 10, fontSize: 13, fontWeight: '600', color: '#fff', alignSelf: 'center' },
    statuspending: { backgroundColor: '#ffb300' },
    statusresponded: { backgroundColor: '#4caf50' },
    statusresolved: { backgroundColor: '#4caf50' },
    rowHover: { backgroundColor: '#f9f9f9' },
    zebraRow: { backgroundColor: '#fcfcfc' },
    clearFiltersButton: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginLeft: 8, borderWidth: 1, borderColor: '#e5e5e5' },
    clearFiltersText: { fontSize: 14, fontWeight: '600', color: '#e02323' },
});
