import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ImageBackground,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function VerificationComplete() {
    const router = useRouter();

    return (
        <View style={styles.mainContainer}>
            <ImageBackground
                source={require('../../assets/images/bg.jpg')}
                style={styles.backgroundImage}
                blurRadius={Platform.OS === 'ios' ? 10 : 5}
            >
                <View style={styles.overlay}>
                    <View style={styles.glassBox}>

                        {/* Success Checkmark Icon */}
                        <View style={styles.iconCircle}>
                            <View style={styles.innerCheckCircle}>
                                <Ionicons name="checkmark" size={36} color="white" />
                            </View>
                        </View>

                        <Text style={styles.title}>Account Verified!</Text>
                        <Text style={styles.subtitle}>
                            Your email has been successfully confirmed. You're all set to start splitting bills with your friends.
                        </Text>

                        {/* Feature Highlights (Optional, but adds nice detail) */}
                        <View style={styles.featureList}>
                            <View style={styles.featureItem}>
                                <Ionicons name="receipt-outline" size={20} color="tomato" />
                                <Text style={styles.featureText}>Create & Join Bills</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="people-outline" size={20} color="tomato" />
                                <Text style={styles.featureText}>Manage Group Expenses</Text>
                            </View>
                        </View>

                        {/* The Main Action Button */}
                        <Pressable
                            style={styles.button}
                            onPress={() => router.replace('/sign-in')}
                        >
                            <Text style={styles.buttonText}>Go to Login</Text>
                        </Pressable>

                        <Text style={styles.footerNote}>
                            Welcome to the community!
                        </Text>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#000' },
    backgroundImage: { flex: 1, height: '100%', width: '100%' },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    glassBox: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 20,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF5F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    innerCheckCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4CD964', // Success Green
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4CD964',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1C1C1E',
        marginBottom: 10,
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
        textAlign: 'center',
        lineHeight: 24
    },
    featureList: {
        width: '100%',
        backgroundColor: '#F2F2F7',
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    featureText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    button: {
        backgroundColor: 'tomato',
        width: '100%',
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'tomato',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    footerNote: {
        marginTop: 20,
        fontSize: 14,
        color: '#999',
        fontWeight: '500'
    }
});