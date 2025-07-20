import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Platform as RNPlatform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity, // <-- Import Modal
  TouchableWithoutFeedback,
  UIManager, // <-- Import TouchableWithoutFeedback
  View
} from 'react-native';
import { Path, Svg } from 'react-native-svg'; // <-- Import Svg for the dropdown arrow
import Header from '../../../../components/Header';
import { theme, useTheme } from '../../../context/ThemeContext';

const incidentTypes = [
  'Murder',
  'Homicide',
  'Physical Injury',
  'Rape',
  'Robbery',
  'Theft',
  'Carnapping MV',
  'Carnapping MC'
];

// --- Reusable Dropdown Arrow Icon ---
const DropdownArrowIcon = () => (
    <Svg height="24" width="24" viewBox="0 0 24 24">
        <Path d="M7 10l5 5 5-5z" fill="#888" />
    </Svg>
);

// Enable LayoutAnimation on Android
if (RNPlatform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ReportStep() {
  const { alert_id } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const buttonColor = isDarkMode ? currentTheme.iconBackground : '#E02323';
  const [incidentType, setIncidentType] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [description, setDescription] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for the modal
  const [suspectOption, setSuspectOption] = useState<'Description' | 'IF KNOWN'>('Description');
  const [suspectDescription, setSuspectDescription] = useState(''); // For 'Description' option
  const [suspectKnownDescription, setSuspectKnownDescription] = useState(''); // For 'IF KNOWN' option
  const [suspectName, setSuspectName] = useState('');
  const [suspectAge, setSuspectAge] = useState('');
  const [suspectSex, setSuspectSex] = useState('');
  const [suspectNationality, setSuspectNationality] = useState('');
  const [suspectAddress, setSuspectAddress] = useState('');
  const [weaponUsed, setWeaponUsed] = useState('');
  const [vehicleInvolved, setVehicleInvolved] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [weaponOption, setWeaponOption] = useState<'N/A' | 'IF KNOWN'>('N/A');
  const [vehicleOption, setVehicleOption] = useState<'N/A' | 'IF KNOWN'>('N/A');
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  // All new fields as yes/no only
  const [evidenceSecured, setEvidenceSecured] = useState('No');
  const [itemsLeftBehind, setItemsLeftBehind] = useState('No');
  const [itemsStolen, setItemsStolen] = useState('No');
  const [motiveKnown, setMotiveKnown] = useState('No');
  const [priorConflict, setPriorConflict] = useState('No');
  const [victimsInvolved, setVictimsInvolved] = useState('No');
  const [injuriesFatalities, setInjuriesFatalities] = useState('No');
  const [medicalHelp, setMedicalHelp] = useState('No');
  const [securityCameras, setSecurityCameras] = useState('No');

  const [evidenceDetails, setEvidenceDetails] = useState('');

  const handleSubmit = async () => {
    // Basic validation
    if (!incidentType) {
        alert('Please select an incident type.');
        return;
    }
    if (!description) {
        alert('Please provide a description for the incident.');
        return;
    }
    if (suspectOption === 'IF KNOWN') {
      if (!suspectName || !suspectAge || !suspectSex || !suspectAddress) {
        alert('Please fill out all suspect details or select N/A.');
        return;
      }
    }

    const policeId = await AsyncStorage.getItem('police_id');
    // Log all field values
    console.log('Submitting incident report with:', {
      alert_id,
      policeId,
      incidentType,
      severity,
      description,
      suspectOption,
      suspectDescription,
      suspectKnownDescription,
      suspectName,
      suspectAge,
      suspectSex,
      suspectAddress,
      weaponOption,
      weaponUsed,
      vehicleOption,
      vehicleInvolved,
      image,
      evidenceSecured,
      itemsLeftBehind,
      itemsStolen,
      evidenceDetails,
      motiveKnown,
      priorConflict,
      victimsInvolved,
      injuriesFatalities,
      medicalHelp,
      securityCameras,
    });

    const formData = new FormData();
    formData.append('alert_id', String(alert_id));
    formData.append('police_id', policeId ? policeId : '');
    formData.append('incident_type', incidentType);
    formData.append('severity', severity);
    formData.append('description', description);
    formData.append('action', 'resolve');
    // New fields
    formData.append('suspect_option', suspectOption);
    if (suspectOption === 'IF KNOWN') {
      formData.append('suspect_name', suspectName);
      formData.append('suspect_age', suspectAge);
      formData.append('suspect_sex', suspectSex);
      formData.append('suspect_address', suspectAddress);
      formData.append('suspect_known_description', suspectKnownDescription);
    } else {
      formData.append('suspect_description', suspectDescription);
    }
    formData.append('weapon_option', weaponOption);
    formData.append('weapon_used', weaponOption === 'IF KNOWN' ? weaponUsed : 'N/A');
    formData.append('vehicle_option', vehicleOption);
    formData.append('vehicle_involved', vehicleOption === 'IF KNOWN' ? vehicleInvolved : 'N/A');
    formData.append('evidence_secured', evidenceSecured);
    formData.append('items_left_behind', itemsLeftBehind);
    formData.append('items_stolen', itemsStolen);
    formData.append('evidence_details', evidenceDetails);
    formData.append('motive_known', motiveKnown);
    formData.append('prior_conflict', priorConflict);
    formData.append('victims_involved', victimsInvolved);
    formData.append('injuries_fatalities', injuriesFatalities);
    formData.append('medical_help', medicalHelp);
    formData.append('security_cameras', securityCameras);
    // Remove image upload from FormData
    // if (image && image.uri) {
    //   const uriParts = image.uri.split('.');
    //   const fileType = uriParts[uriParts.length - 1];
    //   formData.append('crime_scene_image', {
    //     uri: image.uri,
    //     name: `crime_scene.${fileType}`,
    //     type: image.type ? image.type : `image/${fileType}`,
    //   } as any);
    // }

    try {
      const response = await fetch('http://mnl911.atwebpages.com/status.php', {
        method: 'POST',
        body: formData,
      });
      const text = await response.text();
      console.log('Raw response:', text);
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        alert('Server did not return valid JSON. See console for details.');
        return;
      }
      console.log('Parsed result:', result);
      if (result.success) {
        // Capture the resolved time when the report is submitted
        const resolvedTime = new Date().toISOString();
        await AsyncStorage.setItem(`resolved_time_${alert_id}`, resolvedTime);
        alert('Incident report submitted!');
        router.replace('/police-officer');
      } else {
        alert(result.error || 'Failed to submit report.');
      }
    } catch (err: any) {
      console.error('Network or JS error:', err);
      alert('Network or server error: ' + err.message);
    }
  };

  const handleSelectIncidentType = (type: string) => {
    setIncidentType(type);
    setIsDropdownOpen(false);
  }

  const handleImagePickUnified = () => {
    setPhotoModalVisible(true);
  };

  const handleTakePhoto = async () => {
    setPhotoModalVisible(false);
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access camera is required!');
      return;
    }
    const pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setImage(pickerResult.assets[0]);
    }
  };

  const handleUploadPhoto = async () => {
    setPhotoModalVisible(false);
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setImage(pickerResult.assets[0]);
    }
  };

  // Update radio onPress to animate
  const handleSuspectOption = (option: 'Description' | 'IF KNOWN') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSuspectOption(option);
  };
  const handleWeaponOption = (option: 'N/A' | 'IF KNOWN') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setWeaponOption(option);
  };
  const handleVehicleOption = (option: 'N/A' | 'IF KNOWN') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVehicleOption(option);
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Centered Header is preserved */}
      <View style={[styles.centeredHeaderWrapper, { backgroundColor: currentTheme.cardBackground, borderBottomColor: currentTheme.border }]}>
        <Header showNotification={false} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#222' }]}>Incident data</Text>
          <Text style={[styles.subtitle, { color: isDarkMode ? currentTheme.subtitle : '#333' }]}>Provide details exactly as you observed at the scene</Text>
          
          {/* Nature of Incident */}
          <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#222' }]}>Nature of Incident</Text>
          <TouchableOpacity style={[styles.dropdownPicker, { borderBottomColor: currentTheme.border }]} onPress={() => setIsDropdownOpen(true)}>
              <Text style={[styles.dropdownPickerText, incidentType ? { color: isDarkMode ? '#fff' : '#222' } : { color: isDarkMode ? currentTheme.subtitle : '#888' }]}>
                  {incidentType || 'Choose Incident Type'}
              </Text>
              <DropdownArrowIcon />
          </TouchableOpacity>

          {/* Severity Level */}
          <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#222' }]}>Severity Level</Text>
          <View style={styles.radioGroupVertical}>
            {['Low', 'Medium', 'High'].map(level => (
              <TouchableOpacity
                key={level}
                style={styles.radioItemVertical}
                onPress={() => setSeverity(level)}
              >
                <View style={[styles.radioCircle, { borderColor: '#E02323' }, severity === level && { backgroundColor: '#E02323', borderWidth: 0 }]} />
                <Text style={[styles.radioLabel, { color: isDarkMode ? '#fff' : '#222' }]}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Suspect (Card) */}
          <View style={{
            backgroundColor: isDarkMode ? '#232323' : '#f5f5f5',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: '#E02323',
            marginBottom: 28,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#E02323', marginBottom: 10 }}>Suspect</Text>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              {['Description', 'IF KNOWN'].map(option => (
                <TouchableOpacity
                  key={option}
                  style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
                  onPress={() => handleSuspectOption(option as 'Description' | 'IF KNOWN')}
                >
                  <View style={[styles.radioCircle, { borderColor: '#E02323' }, suspectOption === option && { backgroundColor: '#E02323', borderWidth: 0 }]} />
                  <Text style={[styles.radioLabel, { color: isDarkMode ? '#fff' : '#222', marginRight: 4 }]}>{option === 'IF KNOWN' ? 'If Known' : option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {suspectOption === 'Description' && (
              <View style={{
                marginBottom: 16,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <MaterialIcons name="person" size={22} color="#E02323" style={{ marginRight: 8 }} />
                  <Text style={{ color: isDarkMode ? '#fff' : '#222', fontWeight: 'bold', fontSize: 15 }}>Suspect Description</Text>
                </View>
                <TextInput
                  style={[styles.input, { borderColor: currentTheme.border, color: isDarkMode ? '#fff' : '#222', backgroundColor: currentTheme.cardBackground, minHeight: 40 }]}
                  placeholder="Describe the suspect"
                  placeholderTextColor={isDarkMode ? currentTheme.subtitle : '#888'}
                  value={suspectDescription}
                  onChangeText={setSuspectDescription}
                />
              </View>
            )}
            {suspectOption === 'IF KNOWN' && (
              <View style={{
                marginBottom: 16,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <MaterialIcons name="person" size={22} color="#E02323" style={{ marginRight: 8 }} />
                  <Text style={{ color: isDarkMode ? '#fff' : '#222', fontWeight: 'bold', fontSize: 15 }}>Suspect Details</Text>
                </View>
                <TextInput
                  style={[styles.input, { borderColor: currentTheme.border, color: isDarkMode ? '#fff' : '#222', backgroundColor: currentTheme.cardBackground, marginBottom: 8, minHeight: 40 }]}
                  placeholder="Name"
                  placeholderTextColor={isDarkMode ? currentTheme.subtitle : '#888'}
                  value={suspectName}
                  onChangeText={setSuspectName}
                />
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: -15 }}>
                  <TextInput
                    style={[styles.input, { flex: 1, borderColor: currentTheme.border, color: isDarkMode ? '#fff' : '#222', backgroundColor: currentTheme.cardBackground, minHeight: 40 }]}
                    placeholder="Age"
                    placeholderTextColor={isDarkMode ? currentTheme.subtitle : '#888'}
                    value={suspectAge}
                    onChangeText={setSuspectAge}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, { flex: 1, borderColor: currentTheme.border, color: isDarkMode ? '#fff' : '#222', backgroundColor: currentTheme.cardBackground, minHeight: 40 }]}
                    placeholder="Sex"
                    placeholderTextColor={isDarkMode ? currentTheme.subtitle : '#888'}
                    value={suspectSex}
                    onChangeText={setSuspectSex}
                  />
                </View>
                <TextInput
                  style={[styles.input, { borderColor: currentTheme.border, color: isDarkMode ? '#fff' : '#222', backgroundColor: currentTheme.cardBackground, minHeight: 40, marginBottom: 2 }]}
                  placeholder="Address"
                  placeholderTextColor={isDarkMode ? currentTheme.subtitle : '#888'}
                  value={suspectAddress}
                  onChangeText={setSuspectAddress}
                />
                <TextInput
                  style={[styles.input, { borderColor: currentTheme.border, color: isDarkMode ? '#fff' : '#222', backgroundColor: currentTheme.cardBackground, minHeight: 40, marginBottom: 0 }]}
                  placeholder="Description"
                  placeholderTextColor={isDarkMode ? currentTheme.subtitle : '#888'}
                  value={suspectKnownDescription}
                  onChangeText={setSuspectKnownDescription}
                />
              </View>
            )}
          </View>
          {/* Weapon Used (Card) */}
          <View style={{
            backgroundColor: isDarkMode ? '#232323' : '#f5f5f5',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: '#E02323',
            marginBottom: 28,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#E02323', marginBottom: 10 }}>Weapon Used</Text>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              {['N/A', 'IF KNOWN'].map(option => (
                <TouchableOpacity
                  key={option}
                  style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
                  onPress={() => handleWeaponOption(option as 'N/A' | 'IF KNOWN')}
                >
                  <View style={[styles.radioCircle, { borderColor: '#E02323' }, weaponOption === option && { backgroundColor: '#E02323', borderWidth: 0 }]} />
                  <Text style={[styles.radioLabel, { color: isDarkMode ? '#fff' : '#222', marginRight: 4 }]}>{option === 'N/A' ? 'Unknown' : option === 'IF KNOWN' ? 'If Known' : option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {weaponOption === 'IF KNOWN' && (
              <View style={{
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}>
                <MaterialIcons name="gavel" size={22} color="#E02323" style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.input, { flex: 1, borderColor: currentTheme.border, color: isDarkMode ? '#fff' : '#222', backgroundColor: currentTheme.cardBackground, minHeight: 40, marginBottom: 0 }]}
                  placeholder="Describe the weapon used"
                  placeholderTextColor={isDarkMode ? currentTheme.subtitle : '#888'}
                  value={weaponUsed}
                  onChangeText={setWeaponUsed}
                />
              </View>
            )}
          </View>
          {/* Vehicle Involved (Card) */}
          <View style={{
            backgroundColor: isDarkMode ? '#232323' : '#f5f5f5',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: '#E02323',
            marginBottom: 28,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#E02323', marginBottom: 10 }}>Vehicle Involved</Text>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              {['N/A', 'IF KNOWN'].map(option => (
                <TouchableOpacity
                  key={option}
                  style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
                  onPress={() => handleVehicleOption(option as 'N/A' | 'IF KNOWN')}
                >
                  <View style={[styles.radioCircle, { borderColor: '#E02323' }, vehicleOption === option && { backgroundColor: '#E02323', borderWidth: 0 }]} />
                  <Text style={[styles.radioLabel, { color: isDarkMode ? '#fff' : '#222', marginRight: 4 }]}>{option === 'N/A' ? 'Unknown' : option === 'IF KNOWN' ? 'If Known' : option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {vehicleOption === 'IF KNOWN' && (
              <View style={{
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}>
                <MaterialIcons name="directions-car" size={22} color="#E02323" style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.input, { flex: 1, borderColor: currentTheme.border, color: isDarkMode ? '#fff' : '#222', backgroundColor: currentTheme.cardBackground, minHeight: 40, marginBottom: 0 }]}
                  placeholder="Vehicle and plate number"
                  placeholderTextColor={isDarkMode ? currentTheme.subtitle : '#888'}
                  value={vehicleInvolved}
                  onChangeText={setVehicleInvolved}
                />
              </View>
            )}
          </View>

          {/* Evidence Collection */}
          <View style={{
            backgroundColor: isDarkMode ? '#232323' : '#f5f5f5',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: '#E02323',
            marginBottom: 28,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#E02323', marginBottom: 10 }}>Evidence Collection</Text>
            <Text style={{ color: isDarkMode ? '#fff' : '#222', marginBottom: 4 }}>Has the area been secured?</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {['No', 'Yes'].map(option => (
                <TouchableOpacity key={option} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }} onPress={() => setEvidenceSecured(option)}>
                  <View style={[styles.radioCircle, { borderColor: '#E02323' }, evidenceSecured === option && { backgroundColor: '#E02323', borderWidth: 0 }]} />
                  <Text style={[styles.radioLabel, { color: isDarkMode ? '#fff' : '#222', marginRight: 4 }]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: isDarkMode ? '#fff' : '#222', marginBottom: 4 }}>Were there any items left behind?</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {['No', 'Yes'].map(option => (
                <TouchableOpacity key={option} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }} onPress={() => setItemsLeftBehind(option)}>
                  <View style={[styles.radioCircle, { borderColor: '#E02323' }, itemsLeftBehind === option && { backgroundColor: '#E02323', borderWidth: 0 }]} />
                  <Text style={[styles.radioLabel, { color: isDarkMode ? '#fff' : '#222', marginRight: 4 }]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: isDarkMode ? '#fff' : '#222', marginBottom: 4 }}>Was anything stolen?</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {['No', 'Yes'].map(option => (
                <TouchableOpacity key={option} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }} onPress={() => setItemsStolen(option)}>
                  <View style={[styles.radioCircle, { borderColor: '#E02323' }, itemsStolen === option && { backgroundColor: '#E02323', borderWidth: 0 }]} />
                  <Text style={[styles.radioLabel, { color: isDarkMode ? '#fff' : '#222', marginRight: 4 }]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: isDarkMode ? '#fff' : '#222', marginBottom: 4 }}>Were there any security cameras nearby?</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {['No', 'Yes'].map(option => (
                <TouchableOpacity key={option} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }} onPress={() => setSecurityCameras(option)}>
                  <View style={[styles.radioCircle, { borderColor: '#E02323' }, securityCameras === option && { backgroundColor: '#E02323', borderWidth: 0 }]} />
                  <Text style={[styles.radioLabel, { color: isDarkMode ? '#fff' : '#222', marginRight: 4 }]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Motive & Context */}
          <View style={{
            backgroundColor: isDarkMode ? '#232323' : '#f5f5f5',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: '#E02323',
            marginBottom: 28,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#E02323', marginBottom: 10 }}>Motive & Context</Text>
            <Text style={{ color: isDarkMode ? '#fff' : '#222', marginBottom: 4 }}>Do you know why this happened?</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {['No', 'Yes'].map(option => (
                <TouchableOpacity key={option} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }} onPress={() => setMotiveKnown(option)}>
                  <View style={[styles.radioCircle, { borderColor: '#E02323' }, motiveKnown === option && { backgroundColor: '#E02323', borderWidth: 0 }]} />
                  <Text style={[styles.radioLabel, { color: isDarkMode ? '#fff' : '#222', marginRight: 4 }]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: isDarkMode ? '#fff' : '#222', marginBottom: 4 }}>Was there any prior conflict or threat?</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {['No', 'Yes'].map(option => (
                <TouchableOpacity key={option} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }} onPress={() => setPriorConflict(option)}>
                  <View style={[styles.radioCircle, { borderColor: '#E02323' }, priorConflict === option && { backgroundColor: '#E02323', borderWidth: 0 }]} />
                  <Text style={[styles.radioLabel, { color: isDarkMode ? '#fff' : '#222', marginRight: 4 }]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Other Victim's Information */}
          <View style={{
            backgroundColor: isDarkMode ? '#232323' : '#f5f5f5',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: '#E02323',
            marginBottom: 28,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#E02323', marginBottom: 10 }}>Other Information</Text>
            <Text style={{ color: isDarkMode ? '#fff' : '#222', marginBottom: 4 }}>Are there any involved individuals?</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {['No', 'Yes'].map(option => (
                <TouchableOpacity key={option} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }} onPress={() => setVictimsInvolved(option)}>
                  <View style={[styles.radioCircle, { borderColor: '#E02323' }, victimsInvolved === option && { backgroundColor: '#E02323', borderWidth: 0 }]} />
                  <Text style={[styles.radioLabel, { color: isDarkMode ? '#fff' : '#222', marginRight: 4 }]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: isDarkMode ? '#fff' : '#222', marginBottom: 4 }}>Are there any injuries or fatalities?</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {['No', 'Yes'].map(option => (
                <TouchableOpacity key={option} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }} onPress={() => setInjuriesFatalities(option)}>
                  <View style={[styles.radioCircle, { borderColor: '#E02323' }, injuriesFatalities === option && { backgroundColor: '#E02323', borderWidth: 0 }]} />
                  <Text style={[styles.radioLabel, { color: isDarkMode ? '#fff' : '#222', marginRight: 4 }]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: isDarkMode ? '#fff' : '#222', marginBottom: 4 }}>Was medical help provided?</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {['No', 'Yes'].map(option => (
                <TouchableOpacity key={option} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }} onPress={() => setMedicalHelp(option)}>
                  <View style={[styles.radioCircle, { borderColor: '#E02323' }, medicalHelp === option && { backgroundColor: '#E02323', borderWidth: 0 }]} />
                  <Text style={[styles.radioLabel, { color: isDarkMode ? '#fff' : '#222', marginRight: 4 }]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* Other Details (Card) */}
          <View style={{
            backgroundColor: isDarkMode ? '#232323' : '#f5f5f5',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: '#E02323',
            marginBottom: 28,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#E02323', marginBottom: 10 }}>Other Details</Text>
            <View style={{ marginBottom: 16 }}>
              <TextInput
                style={[styles.input, { borderColor: currentTheme.border, color: isDarkMode ? '#fff' : '#222', backgroundColor: currentTheme.cardBackground }]}
                placeholder="Add additional information"
                placeholderTextColor={isDarkMode ? currentTheme.subtitle : '#888'}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
          </View>
          {/* Submit Button */}
          <TouchableOpacity style={[styles.button, { backgroundColor: buttonColor }]} onPress={handleSubmit}>
            <Text style={[styles.buttonText, { color: '#fff' }]}>Submit Details</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

        {/* --- Dropdown Modal with new slide animation --- */}
        <Modal
            transparent={true}
            visible={isDropdownOpen}
            animationType="slide" 
            onRequestClose={() => setIsDropdownOpen(false)}
        >
            <TouchableWithoutFeedback onPress={() => setIsDropdownOpen(false)}>
                <View style={[styles.modalOverlay, { backgroundColor: currentTheme.modalOverlay }]}> 
                    <View style={[styles.modalContent, { backgroundColor: currentTheme.cardBackground }]}> 
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: currentTheme.headerText }]}>Select Nature of Incident</Text>
                        </View>
                        {incidentTypes.map(type => (
                            <TouchableOpacity key={type} style={styles.modalItem} onPress={() => handleSelectIncidentType(type)}>
                                <Text style={[styles.modalItemText, { color: currentTheme.text }]}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centeredHeaderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24, 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 4, 
    marginTop: 24, 
    textAlign: 'left' 
  },
  subtitle: { fontSize: 16, marginBottom: 24, textAlign: 'left' },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 12 },
  
  // New Dropdown Styles
  dropdownPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginBottom: 24,
  },
  dropdownPickerText: {
    fontSize: 16,
  },
  radioGroupVertical: {
    flexDirection: 'column',
    marginBottom: 12,
  },
  radioItemVertical: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, 
  },
  radioCircle: { 
    width: 22, 
    height: 22, 
    borderRadius: 11, 
    borderWidth: 2, 
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioLabel: { fontSize: 16 },
  input: { 
      borderWidth: 1, 
      borderRadius: 8, 
      padding: 12, 
      minHeight: 120, 
      marginTop: 8, 
      marginBottom: 24, 
      fontSize: 16, 
      textAlignVertical: 'top' 
  },
  button: { 
    marginTop: 16, 
    borderRadius: 12, 
    paddingVertical: 18, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    elevation: 8,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
  },
});
