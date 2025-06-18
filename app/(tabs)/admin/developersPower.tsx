import { AlertTriangle, Trash2, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AdminLayout from '../../components/AdminLayout';

// Reusable Tool Card Component
const ToolCard = ({ title, description, buttonText, onButtonPress, isLoading, resultMessage, isDestructive = false, icon: Icon = Trash2 }: any) => (
    <View style={styles.toolCard}>
        <View style={styles.toolInfo}>
            <Text style={styles.toolTitle}>{title}</Text>
            <Text style={styles.toolDescription}>{description}</Text>
        </View>
        <TouchableOpacity
            style={[styles.actionButton, isDestructive ? styles.deleteButton : styles.confirmButton, isLoading && styles.actionButtonDisabled]}
            onPress={onButtonPress}
            disabled={isLoading}
        >
            {isLoading ? <ActivityIndicator color="#fff" /> : <><Icon size={18} color="#fff" /><Text style={styles.actionButtonText}>{buttonText}</Text></>}
        </TouchableOpacity>
        {resultMessage && (
            <View style={[styles.resultBox, resultMessage.type === 'error' ? styles.errorBox : styles.successBox]}>
                <Text style={styles.resultText}>{resultMessage.text}</Text>
            </View>
        )}
    </View>
);

// Reusable Confirmation Modal Component
const ConfirmationModal = ({ visible, onClose, onConfirm, title, message, confirmText, isDestructive = false }: any) => (
    <Modal transparent={true} animationType="fade" visible={visible} onRequestClose={onClose}>
        <Pressable style={styles.modalOverlay} onPress={onClose}>
            <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
                <View style={[styles.modalIconContainer, isDestructive && styles.modalIconDestructive]}><AlertTriangle size={32} color={isDestructive ? '#e02323' : '#f59e0b'} /></View>
                <Text style={styles.modalTitle}>{title}</Text>
                <Text style={styles.modalMessage}>{message}</Text>
                <View style={styles.modalButtonContainer}>
                    <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}><Text style={styles.cancelButtonText}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.modalButton, isDestructive ? styles.deleteButton : styles.confirmButton]} onPress={onConfirm}><Text style={styles.confirmButtonText}>{confirmText}</Text></TouchableOpacity>
                </View>
            </Pressable>
        </Pressable>
    </Modal>
);

export default function DevelopersPower() {
    const [modalState, setModalState] = useState({ visible: false, onConfirm: () => {}, title: '', message: '', confirmText: '', isDestructive: false });
    const [toolStates, setToolStates] = useState({
        set_sos_resolved: { isLoading: false, resultMessage: null },
        delete_crime_reports: { isLoading: false, resultMessage: null },
        delete_sos_alerts: { isLoading: false, resultMessage: null },
        delete_normal_users: { isLoading: false, resultMessage: null },
        delete_police_users: { isLoading: false, resultMessage: null },
    });

    const handleApiCall = async (action: keyof typeof toolStates, successMessage: string, errorMessage: string) => {
        setToolStates(prev => ({ ...prev, [action]: { isLoading: true, resultMessage: null } }));
        try {
            const res = await fetch(`http://mnl911.atwebpages.com/developer_actions.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            if (!res.ok) throw new Error('Network response was not ok.');
            const data = await res.json();
            if (data.success) {
                setToolStates(prev => ({ ...prev, [action]: { isLoading: false, resultMessage: { type: 'success', text: data.message || successMessage } } }));
            } else {
                throw new Error(data.message || 'An unknown error occurred.');
            }
        } catch (err: any) {
            setToolStates(prev => ({ ...prev, [action]: { isLoading: false, resultMessage: { type: 'error', text: `${errorMessage}: ${err.message}` } } }));
            console.error(`Error with action '${action}':`, err);
        }
    };

    const openConfirmationModal = (onConfirm: () => void, title: string, message: string, confirmText: string, isDestructive = false) => {
        setModalState({ visible: true, onConfirm, title, message, confirmText, isDestructive });
    };

    const tools = [
        {
            key: 'set_sos_resolved',
            title: 'Bulk SOS Status Update',
            description: 'Sets the status of all existing SOS alerts to "resolved". This is useful for clearing out old or unresolved alerts in the system.',
            buttonText: 'Set all sos status to resolved',
            icon: Zap,
            isDestructive: false,
            onPress: () => openConfirmationModal(() => handleApiCall('set_sos_resolved', 'Successfully updated all SOS statuses.', 'Error setting SOS status'), 'Are you sure?', 'This action will set all SOS alerts to "resolved". This action cannot be undone.', 'Yes, I\'m sure'),
        },
        {
            key: 'delete_crime_reports',
            title: 'Delete All Crime Reports',
            description: 'Permanently deletes all data from the `crimereports` table. This is a destructive action intended for testing and system resets.',
            buttonText: 'Delete ALL Crime Reports',
            isDestructive: true,
            onPress: () => openConfirmationModal(() => handleApiCall('delete_crime_reports', 'All crime reports have been deleted.', 'Error deleting crime reports'), 'Confirm Deletion', 'This will permanently delete all crime reports. This is irreversible. Are you absolutely sure?', 'Yes, delete everything', true),
        },
        {
            key: 'delete_sos_alerts',
            title: 'Delete All SOS Alerts',
            description: 'Permanently deletes all data from the `sosalert` table. This will also clear related assignment and history data due to database constraints.',
            buttonText: 'Delete All SOS Alerts',
            isDestructive: true,
            onPress: () => openConfirmationModal(() => handleApiCall('delete_sos_alerts', 'All SOS alerts have been deleted.', 'Error deleting SOS alerts'), 'Confirm Deletion', 'This will permanently delete all SOS alerts from the database. This action cannot be undone.', 'Yes, delete all alerts', true),
        },
        {
            key: 'delete_normal_users',
            title: 'Delete All Normal Users',
            description: 'Permanently deletes all data from the `normalusers` table. Note: This action may fail if related `sosalert` records still exist.',
            buttonText: 'Delete All Normal Users',
            isDestructive: true,
            onPress: () => openConfirmationModal(() => handleApiCall('delete_normal_users', 'All normal users have been deleted.', 'Error deleting normal users'), 'Confirm Deletion', 'This will permanently delete all normal users. This action cannot be undone.', 'Yes, delete all users', true),
        },
        {
            key: 'delete_police_users',
            title: 'Delete All Police Users',
            description: 'Permanently deletes all data from the `policeusers` table. Note: This action may fail if related assignment or history records still exist.',
            buttonText: 'Delete All Police Users',
            isDestructive: true,
            onPress: () => openConfirmationModal(() => handleApiCall('delete_police_users', 'All police users have been deleted.', 'Error deleting police users'), 'Confirm Deletion', 'This will permanently delete all police users. This action cannot be undone.', 'Yes, delete all officers', true),
        },
    ];

    return (
        <AdminLayout>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>Developer's Power</Text>
                <Text style={styles.subtitle}>Use these tools with caution. Actions here may be irreversible.</Text>
                {tools.map(tool => (
                    <ToolCard
                        key={tool.key}
                        title={tool.title}
                        description={tool.description}
                        buttonText={tool.buttonText}
                        onButtonPress={tool.onPress}
                        isLoading={toolStates[tool.key as keyof typeof toolStates].isLoading}
                        resultMessage={toolStates[tool.key as keyof typeof toolStates].resultMessage}
                        isDestructive={tool.isDestructive}
                        icon={tool.icon}
                    />
                ))}
            </ScrollView>
            <ConfirmationModal
                visible={modalState.visible}
                onClose={() => setModalState(prev => ({ ...prev, visible: false }))}
                onConfirm={() => {
                    modalState.onConfirm();
                    setModalState(prev => ({ ...prev, visible: false }));
                }}
                title={modalState.title}
                message={modalState.message}
                confirmText={modalState.confirmText}
                isDestructive={modalState.isDestructive}
            />
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#f8f9fa' },
    title: { fontSize: 28, fontWeight: '700', color: '#202224', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
    toolCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 20 },
    toolInfo: { marginBottom: 16 },
    toolTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
    toolDescription: { fontSize: 14, color: '#555', lineHeight: 20 },
    actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, gap: 8 },
    actionButtonDisabled: { opacity: 0.5 },
    actionButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    confirmButton: { backgroundColor: '#4f46e5' },
    deleteButton: { backgroundColor: '#e02323' },
    resultBox: { marginTop: 20, padding: 15, borderRadius: 8, borderWidth: 1 },
    successBox: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
    errorBox: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
    resultText: { textAlign: 'center', fontWeight: '500', color: '#1f2937' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContainer: { width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center' },
    modalIconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fffbeb', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    modalIconDestructive: { backgroundColor: '#fee2e2' },
    modalTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center' },
    modalMessage: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
    modalButtonContainer: { flexDirection: 'row', width: '100%', gap: 12 },
    modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    cancelButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db' },
    cancelButtonText: { color: '#374151', fontWeight: '600', fontSize: 16 },
    confirmButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
