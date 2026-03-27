// app/(auth)/sign-in.tsx
// import { useAuth } from '@/utils/auth';
import { ThemedText } from '@/components/themed-text';
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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function Login() {
  const router = useRouter();
  // const { signIn, isLoading: authLoading } = useAuth();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [showEmailCode, setShowEmailCode] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [loginLoading, setLoginLoading] = React.useState(false);
  const [verifyLoading, setVerifyLoading] = React.useState(false);
  const [pendingMFA, setPendingMFA] = React.useState<{ email: string } | null>(null);
  const [showModal, setShowModal] = React.useState(false)

  const resendEmailLink = async () => {
    const { data, error } = await supabase.auth.resend({
      email: email,
      type: 'signup'
    })

    if (error) {
      console.error('Error resending confirmation:', error.message)
    }
  }

  const onSignInPress = async () => {
    if (!email || !password) return;

    setLoginLoading(true);
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error?.code === 'email_not_confirmed') {
      setShowModal(true)
      resendEmailLink();
      setLoginLoading(false);
      return;
    };

    setLoginLoading(false);
    router.replace("/(dashboardpage)/dashboard");
  };

  // const isSignInDisabled = !email || !password || loginLoading || authLoading;

  return (
    <View style={styles.mainContainer}>
      <ImageBackground
        source={require('../../assets/images/bg.jpg')}
        style={styles.backgroundImage}
        blurRadius={Platform.OS === 'ios' ? 10 : 5}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlay}
        >
          <View style={styles.glassBox}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.replace('/')}
            >
              <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
            </Pressable>

            <View style={styles.iconCircle}>
              <Ionicons name="lock-open" size={30} color="tomato" />
            </View>

            <Text style={styles.title}>{showEmailCode ? "Verify Code" : "Welcome Back"}</Text>
            <Text style={styles.subtitle}>
              {showEmailCode ? "Check your inbox for a code" : "Log in to manage your bills"}
            </Text>

            {authError && (
              <Text style={styles.errorMessage}>{authError}</Text>
            )}

            {!showEmailCode ? (
              <>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#999" style={styles.inlineIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    textContentType="emailAddress"
                    value={email}
                    onChangeText={setEmail}
                    editable={!loginLoading}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inlineIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    secureTextEntry={!isPasswordVisible}
                    value={password}
                    onChangeText={setPassword}
                    textContentType="password"
                    editable={!loginLoading}
                  />
                  <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                    <Ionicons
                      name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#999"
                    />
                  </Pressable>
                </View>

                <Pressable onPress={() => router.push('/forgot-password')} style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </Pressable>

                <Pressable
                  style={styles.button}
                  onPress={onSignInPress}
                >
                  {loginLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Login</Text>
                  )}
                </Pressable>
              </>
            ) : (
              <View style={{ width: '100%' }}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, { textAlign: 'center', letterSpacing: 5 }]}
                    value={code}
                    placeholder="0 0 0 0 0 0"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={6}
                    onChangeText={setCode}
                    editable={!verifyLoading}
                  />
                </View>

                <Pressable
                  style={[styles.button, (!code || code.length < 6) && styles.buttonDisabled]}
                  onPress={onVerifyPress}
                  disabled={!code || code.length < 6 || verifyLoading}
                >
                  {verifyLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Verify</Text>
                  )}
                </Pressable>

                <Pressable onPress={onResendCode} style={styles.resendContainer}>
                  <Text style={styles.footerText}>
                    Didn't get a code? <Text style={styles.signUpLink}>Resend</Text>
                  </Text>
                </Pressable>

                <Pressable onPress={() => setShowEmailCode(false)} style={styles.backToLoginContainer}>
                  <Text style={styles.backToLoginText}>Back to login</Text>
                </Pressable>
              </View>
            )}

            <Pressable onPress={() => router.push('/sign-up')} style={styles.signUpContainer}>
              <Text style={styles.footerText}>
                Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text>
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>

        <Modal
          visible={showModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="mail" size={30} color="#FF3B30" />
              </View>
              <ThemedText style={styles.modalTitle}>Email not confirmed!</ThemedText>
              <ThemedText style={styles.modalSubtitle}>Please check your inbox for your email confirmation link.</ThemedText>

              <View style={styles.modalActionRow}>
                {/* <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => setShowModal(false)}
                      >
                        <ThemedText style={styles.cancelBtnText}>Cancel</ThemedText>
                      </TouchableOpacity> */}

                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={async () => {
                    setShowModal(false);

                  }}
                >
                  <ThemedText style={styles.confirmBtnText}>Done</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#1C1C1E', marginBottom: 5 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 30, textAlign: 'center' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 55,
    backgroundColor: '#F2F2F7',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  inlineIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#000' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: 'tomato', fontWeight: '600', fontSize: 14 },
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
  buttonDisabled: { backgroundColor: '#FFA08E', opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  errorMessage: {
    color: '#FF3B30',
    fontSize: 13,
    marginBottom: 15,
    textAlign: 'center',
    backgroundColor: '#FFE5E5',
    padding: 10,
    borderRadius: 8,
    width: '100%'
  },
  signUpContainer: { marginTop: 25 },
  footerText: { fontSize: 14, color: '#666' },
  signUpLink: { color: 'tomato', fontWeight: '800' },
  resendContainer: { marginTop: 15 },
  backToLoginContainer: { marginTop: 10 },
  backToLoginText: { color: '#666', fontSize: 14, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 320,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF0EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8E8E93',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});