import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';

interface CreatePlaylistModalProps {
    visible: boolean;
    onClose: () => void;
    onCreate: (name: string) => void | Promise<void>;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ visible, onClose, onCreate }) => {
    const [name, setName] = useState('');

    const handleCreate = (): void => {
        if (name.trim()) {
            onCreate(name.trim());
            setName('');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}>
                <View style={styles.content}>
                    <Text style={styles.title}>Nueva lista</Text>
                    <Text style={styles.subtitle}>Ponle un nombre a tu lista de reproducción</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Mi lista genial"
                        placeholderTextColor="#666"
                        value={name}
                        onChangeText={setName}
                        autoFocus
                        selectionColor="#1DB954"
                    />

                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.buttonCancel} onPress={onClose}>
                            <Text style={styles.buttonCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.buttonCreate, !name.trim() && styles.buttonDisabled]}
                            onPress={handleCreate}
                            disabled={!name.trim()}>
                            <Text style={styles.buttonCreateText}>Crear</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#282828',
        borderRadius: 16,
        padding: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#b3b3b3',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        padding: 16,
        color: '#ffffff',
        fontSize: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#333',
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    buttonCancel: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    buttonCancelText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    buttonCreate: {
        backgroundColor: '#1DB954',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
    },
    buttonDisabled: {
        backgroundColor: '#1a1a1a',
        opacity: 0.5,
    },
    buttonCreateText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default CreatePlaylistModal;