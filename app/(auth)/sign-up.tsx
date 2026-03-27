// app/(auth)/sign-up.jsx
import { ThemedText } from '@/components/themed-text';
// import { useAuth } from '@/utils/auth';
// import { db } from '@/utils/db';
import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
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
  TouchableOpacity,
  View
} from 'react-native';
import validator from 'validator';

// Keep your InputField component exactly as is
const InputField = ({ label, value, onChange, error, secure = false, autoCap = "none" as any, keyboard = "default" as any, style = {} }) => {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const isPasswordField = secure;

  return (
    <View style={[styles.inputContainer, style]}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, error && styles.inputError, isPasswordField && { paddingRight: 50 }]}
          value={value}
          onChangeText={onChange}
          placeholder=""
          placeholderTextColor="#C7C7CC"
          secureTextEntry={isPasswordField && !isPasswordVisible}
          autoCapitalize={autoCap}
          keyboardType={keyboard}
        />
        {isPasswordField && (
          <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
            <Ionicons name={isPasswordVisible ? "eye-off" : "eye"} size={22} color="#8E8E93" />
          </Pressable>
        )}
      </View>
      <View style={styles.errorContainer}>
        {error && <Text style={styles.fieldError}>{error}</Text>}
      </View>
    </View>
  );
};

export default function SignUpScreen() {
  // const { signUp } = useAuth();
  const router = useRouter();

  const { gFName, gLName, gEmail, gId, guest } = useLocalSearchParams();

  // States
  const [showModal, setShowModal] = React.useState(false)

  const [firstName, setFirstName] = React.useState(gFName ?? '');
  const [lastName, setLastName] = React.useState(gLName ?? '');
  const [nickname, setNickname] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [emailAddress, setEmailAddress] = React.useState(gEmail ?? '');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  // UI States
  const [signupLoading, setSignupLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [generalError, setGeneralError] = React.useState('');

  // Check existing nicknames
  const [existingNicknames, setExistingNicknames] = React.useState([]);

  React.useEffect(() => {
    const loadNicknames = async () => {
      // const users = await db.users.toArray();
      // setExistingNicknames(users.map(u => u.nickname?.toLowerCase()));
    };
    loadNicknames();
  }, []);

  // const transferGuestData = async (guestId, userId) => {
  //   // Update bill_members
  //   await db.bill_members
  //     .where('guestId')
  //     .equals(Number(guestId))
  //     .modify({ userId, guestId: null });

  //   // Update expenses_involved
  //   await db.expenses_involved
  //     .where('guestId')
  //     .equals(Number(guestId))
  //     .modify({ billMemberId: userId });

  //   // Delete guest
  //   await db.guests.delete(Number(guestId));
  // };

  const validateForm = () => {
    let newErrors = {};
    if (validator.isEmpty(firstName.trim())) newErrors.firstName = "First name is required";
    if (validator.isEmpty(lastName.trim())) newErrors.lastName = "Last name is required";
    if (validator.isEmpty(nickname.trim())) {
      newErrors.nickname = "Nickname is required";
    } else if (existingNicknames.includes(nickname.toLowerCase())) {
      newErrors.nickname = "Nickname is already taken";
    }
    if (validator.isEmpty(username.trim())) newErrors.username = "Username is required";
    if (validator.isEmpty(emailAddress.trim())) {
      newErrors.email = "Email is required";
    } else if (!validator.isEmail(emailAddress.trim())) {
      newErrors.email = "Invalid email format";
    }
    if (password.length < 8) newErrors.password = "Min 8 characters required";
    if (!validator.equals(confirmPassword, password)) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (validateForm()) {
      onSignUpPress();
    }

  }

  const onSignUpPress = async () => {
    setSignupLoading(true);
    setGeneralError('');

    const {
      data: { session },
      error: signUpError,
    } = await supabase.auth.signUp({
      email: emailAddress,
      password: password,
      options: {
        emailRedirectTo: 'http://localhost:8081/email-confirmed',
        data: {
          first_name: firstName,
          last_name: lastName,
          nickname: nickname,
          username: username,
        }
      }
    })

    const { error: deleteError } = await supabase.from("guest_users")
      .delete()
      .eq("email_address", emailAddress);

    if (deleteError) {
      console.error(deleteError);
      setSignupLoading(false);
      return;
    };

    if (signUpError) {
      console.error(signUpError);
      setSignupLoading(false);
      return;
    }
    if (!session) {
      setShowModal(true)
      // Alert.alert('Please check your inbox for email verification')
    }

    setSignupLoading(false);
  };

  return (
    <ImageBackground source={require('../../assets/images/bg.jpg')} style={styles.background}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.registerBox}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="#1C1C1E" />
            </Pressable>

            <View style={styles.headerSection}>
              <ThemedText style={styles.title}>Sign Up</ThemedText>
              <ThemedText style={styles.subtitle}>Create your account to start</ThemedText>
            </View>

            {generalError ? <Text style={styles.clerkError}>{generalError}</Text> : null}

            <View style={styles.row}>
              <InputField label="First Name" value={firstName} onChange={setFirstName} error={errors.firstName} style={styles.flex1} autoCap="sentences" />
              <InputField label="Last Name" value={lastName} onChange={setLastName} error={errors.lastName} style={styles.flex1} autoCap="sentences" />
            </View>

            <InputField label="Nickname" value={nickname} onChange={setNickname} error={errors.nickname} />
            <InputField label="Username" value={username} onChange={setUsername} error={errors.username} autoCap="none" />
            <InputField label="Email Address" value={emailAddress} onChange={setEmailAddress} error={errors.email} autoCap="none" keyboard="email-address" />
            <InputField label="Password" value={password} onChange={setPassword} error={errors.password} secure />
            <InputField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} error={errors.confirmPassword} secure />

            <Pressable style={styles.button} onPress={handleSignUp}>
              {signupLoading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.buttonText}>Create Account</ThemedText>}
            </Pressable>

            <Link href="/(auth)/sign-in" asChild>
              <Pressable style={styles.footerPressable}>
                <ThemedText style={styles.footerText}>
                  Already have an account? <ThemedText style={styles.link}>Sign In</ThemedText>
                </ThemedText>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
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
            <ThemedText style={styles.modalTitle}>Successfully signed up!</ThemedText>
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
                  router.replace('/')
                }}
              >
                <ThemedText style={styles.confirmBtnText}>Done</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  registerBox: {
    width: '92%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  headerSection: { marginBottom: 10 },
  backButton: { position: 'absolute', top: 20, left: 16, zIndex: 10, padding: 8 },
  title: { fontSize: 32, fontWeight: '900', color: '#1C1C1E', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#8E8E93', textAlign: 'center', marginTop: 4, fontWeight: '500' },
  inputContainer: { width: '100%', marginBottom: 4 },
  inputWrapper: { position: 'relative', width: '100%', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 12, width: '100%' },
  flex1: { flex: 1 },
  label: { fontSize: 13, fontWeight: '700', color: '#1C1C1E', marginBottom: 6, marginLeft: 4 },
  input: {
    height: 54,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  eyeIcon: { position: 'absolute', right: 16, padding: 8 },
  inputError: { borderColor: '#FF3B30', backgroundColor: '#FFF2F2' },
  errorContainer: { minHeight: 18, marginTop: 2, marginBottom: 4 },
  fieldError: { color: '#FF3B30', fontSize: 11, fontWeight: '600', marginLeft: 4 },
  clerkError: { color: '#FF3B30', textAlign: 'center', marginBottom: 15, fontSize: 13, fontWeight: '700', paddingHorizontal: 10 },
  button: {
    backgroundColor: 'tomato',
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: 'tomato',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,

  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
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
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  footerPressable: { paddingVertical: 10 },
  footerText: { textAlign: 'center', color: '#8E8E93', fontSize: 14, fontWeight: '600' },
  link: { color: 'tomato', fontWeight: '800' },
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