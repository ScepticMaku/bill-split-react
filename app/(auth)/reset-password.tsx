import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
    ActivityIndicator,
    ImageBackground,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

export default function ForgotPassword() {
    const router = useRouter();

    // --- States ---
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [code, setCode] = React.useState('');
    const [loading, setLoading] = React.useState(false)
    const [showResetModal, setShowResetModal] = React.useState(false)

    // UI Flow States
    const [stage, setStage] = React.useState<'email' | 'code' | 'password'>('email');
    const [showVerifiedModal, setShowVerifiedModal] = React.useState(false);

    const [errors, setErrors] = React.useState({} as any);

    // --- Actions ---

    // 1. Request Code
    const onRequestReset = async () => {
        // if (!isLoaded) return;
        // let errs = {} as any;
        // if (!validator.isEmail(email)) errs.email = "Please enter a valid email";
        // if (Object.keys(errs).length > 0) return setErrors(errs);

        // setLoading(true);
        // try {
        //   await signIn!.create({
        //     strategy: 'reset_password_email_code',
        //     identifier: email,
        //   });
        //   setShowSentModal(true);
        // } catch (err: any) {
        //   setClerkErrors(err);
        // } finally {
        //   setLoading(false);
        // }
    };

    // 2. Verify Code only (We use a dummy password to "check" the code via Clerk or just handle locally)
    // Note: Clerk usually does attemptFirstFactor with code AND password at once. 
    // To keep your requested UI flow, we transition to Password stage after code is filled.
    const onCodeSubmit = () => {
        if (code.length < 6) {
            setErrors({ code: "Enter the full 6-digit code" });
            return;
        }
        setErrors({});
        setShowVerifiedModal(true);
    };

    // 3. Final Reset
    const onResetSubmit = async () => {
        // if (!isLoaded) return;
        let errs = {} as any;
        if (password.length < 8) errs.password = "Min 8 characters required";
        if (password !== confirmPassword) errs.confirm = "Passwords do not match";
        if (Object.keys(errs).length > 0) return setErrors(errs);

        setLoading(true);

        const { data, error } = await supabase.auth.updateUser({
            password: confirmPassword
        })

        if (error) {
            console.error("Reset password error: ", error.message);
            return;
        }


        // try {
        //   const result = await signIn!.attemptFirstFactor({
        //     strategy: 'reset_password_email_code',
        //     code,
        //     password,
        //   });
        //   if (result.status === 'complete') {
        //     await setActive!({ session: result.createdSessionId });
        //     router.replace('/');
        //   }
        // } catch (err: any) {
        //   setClerkErrors(err);
        // } finally {
        //   setLoading(false);
        // }
    };

    return (
        <View style={styles.mainContainer}>
            <ImageBackground source={require('../../assets/images/bg.jpg')} style={styles.backgroundImage}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>

                    {/* MODAL 1: CODE SENT */}
                    <Modal visible={showResetModal} transparent animationType="fade">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modernModal}>
                                <View style={[styles.iconCircle, { backgroundColor: '#FFF5F3' }]}>
                                    <Ionicons name="key" size={40} color="tomato" />
                                </View>
                                <Text style={styles.modalTitle}>Password reset success!</Text>
                                <Text style={styles.modalSubtitle}>Please click the continue button to redirect to login page.</Text>
                                <Pressable style={styles.modalButton} onPress={() => { setShowResetModal(false); router.replace('/(auth)/sign-in'); }}>
                                    <Text style={styles.modalButtonText}>Continue</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Modal>

                    <View style={styles.cardBox}>
                        <Pressable style={styles.absBackButton} onPress={() => {
                            router.back();
                        }}>
                            <Ionicons name="chevron-back" size={28} color="#1C1C1E" />
                        </Pressable>
                        <ScrollView showsVerticalScrollIndicator={false} style={styles.fullWidth}>
                            <Text style={styles.title}>New Password</Text>
                            <Text style={styles.subtitle}>Secure your account with a new password.</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>New Password</Text>
                                <TextInput style={[styles.input, errors.password && styles.inputError]} placeholder="••••••••" placeholderTextColor="#899" secureTextEntry value={password} onChangeText={setPassword} />
                                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <TextInput style={[styles.input, errors.confirm && styles.inputError]} placeholder="••••••••" placeholderTextColor="#899" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
                                {errors.confirm && <Text style={styles.errorText}>{errors.confirm}</Text>}
                            </View>

                            <Pressable style={styles.primaryButton} onPress={onResetSubmit}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Finish</Text>}
                            </Pressable>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    backgroundImage: { flex: 1, width: '100%', height: '100%' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    cardBox: {
        width: '92%',
        maxWidth: 420,
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 24,
        paddingTop: 64,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    absBackButton: { position: 'absolute', top: 20, left: 16, zIndex: 10 },
    fullWidth: { width: '100%' },
    title: { fontSize: 28, fontWeight: '900', color: '#1C1C1E', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 15, color: '#8E8E93', textAlign: 'center', marginBottom: 30, lineHeight: 20 },
    inputGroup: { marginBottom: 18 },
    label: { fontSize: 13, fontWeight: '700', color: '#1C1C1E', marginBottom: 8, marginLeft: 4 },
    input: {
        height: 56,
        backgroundColor: '#F2F2F7',
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputError: { borderColor: '#FF3B30', backgroundColor: '#FFF2F2' },
    primaryButton: {
        backgroundColor: 'tomato',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: 'tomato',
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonText: { color: '#fff', fontSize: 17, fontWeight: '800' },
    errorText: { color: '#FF3B30', fontSize: 12, marginTop: 4, marginLeft: 4, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modernModal: { width: '85%', maxWidth: 340, backgroundColor: '#fff', borderRadius: 32, padding: 30, alignItems: 'center' },
    iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: '900', color: '#1C1C1E', marginBottom: 10 },
    modalSubtitle: { fontSize: 15, color: '#8E8E93', textAlign: 'center', lineHeight: 22, marginBottom: 25 },
    modalButton: { backgroundColor: 'tomato', width: '100%', height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});