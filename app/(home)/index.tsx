import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/utils/supabase';
import { ErrorModal } from '../../components/error-modal'; // Adjust path as needed
// import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as React from 'react';
import { useState } from 'react'; // Add { useState } here
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import validator from 'validator';

export default function Page() {
  const router = useRouter();
  // const { user } = useUser();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalStep, setModalStep] = React.useState(1); // 1: Code, 2: Email, 3: Register Guest
  const [bill, setBill] = React.useState([])
  const [billMembers, setBillMembers] = React.useState([])
  const [isFound, setIsFound] = React.useState(false)
  const [inviteLoading, setInviteLoading] = React.useState(false);
  const [archivedModalVisible, setArchivedModalVisible] = React.useState(false);
  const [guestSubmitLoading, setGuestSubmitLoading] = React.useState(false);
  const [guestRegisterLoading, setGuestRegisterLoading] = React.useState(false);

  
const [errorMessage, setErrorMessage] = useState(''); // New state for errors


  // Form States
  const [inviteCode, setInviteCode] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');

  const [errorModal, setErrorModal] = React.useState({
    visible: false,
    title: '',
    message: '',
  });

  const showError = (title: string, message: string, icon: keyof typeof Ionicons.glyphMap = 'warning-outline') => {
    setErrorModal({
      visible: true,
      title,
      message,
    });
  };

  React.useEffect(() => {
    const getCurrentSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("error getting user session: ", error.message);
        return;
      }

      if (data.session !== null) {
        router.replace('/(dashboardpage)/dashboard')
      }
    }

    getCurrentSession();
  })

  const handleInviteSubmit = async () => {
    // 1. Reset any previous error state
    setErrorMessage(''); 

    // 2. Validation: Check if empty
    if (!inviteCode.trim()) {
      setErrorMessage('Please enter an invitation code.');
      return;
    }

    setInviteLoading(true);

    try {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .eq('invite_code', inviteCode.trim()); // Trim to handle accidental spaces

      // 3. Validation: Code not found in database
      if (error || !data || data.length === 0) {
        setErrorMessage('Invitation code not found.');
        setInviteLoading(false);
        return;
      }

      const fetchedBill = data[0];

      // 4. Validation: Check if bill is archived
      if (validator.equals(fetchedBill?.status, 'archived')) {
        setInviteLoading(false); // Stop loading before switching modals
        setModalVisible(false);
        setArchivedModalVisible(true);
        return;
      }

      // 5. Success: Proceed to step 2
      if (validator.equals(fetchedBill?.invite_code, inviteCode.trim())) {
        setBill(fetchedBill);
        setModalStep(2);
      }
      
    } catch (err) {
      console.log("Error fetching bill: ", err);
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      // This ensures the spinner stops regardless of success or catch-block errors
      setInviteLoading(false);
    }
  };

  // console.log(bill)

  const handleEmailSubmit = async () => {
    if (!validator.isEmail(email)) {
      alert('Incorrect email format.');
      return;
    }

    setGuestSubmitLoading(true);

    try {
      // Fetch bill members with guest_users
      const { data: fetchedBillMembers, error: fetchMemberError } = await supabase
        .from('bill_members')
        .select(`*, guest_users:guest_id (email), users:public_user_id (email)`)
        .eq('bill_id', bill.id);

      if (fetchMemberError) {
        console.log(fetchMemberError);
        showError(
          "Error fetching bill members",
          fetchMemberError.message
        )
        setGuestSubmitLoading(false);
        return;
      }

      // Check if the email exists
      const guestExists = fetchedBillMembers?.some(
        (bm) => bm.guest_users?.email === email
      );

      const userExists = fetchedBillMembers?.some(
        (bm) => bm.users?.email === email
      );

      if (guestExists) {
        router.push({
          pathname: '/guest-view',
          params: { billId: bill.id, inviteCode: bill.invite_code, guestEmail: email }
        });
        setModalVisible(false);
      } else if (userExists) {

        showError(
          "Guest email error",
          "Email already exists"
        )
      }
      else {
        // Email not found, move to register guest
        setModalStep(3);
      }
      setGuestSubmitLoading(false);
    } catch (err) {
      console.log(err);
      setGuestSubmitLoading(false);
    }
  };

  const handleRegisterGuest = async () => {
    // Validate inputs first
    if (!firstName || !lastName || !validator.isEmail(email)) {
      alert('Please enter valid first name, last name, and email.');
      return;
    }

    setGuestRegisterLoading(true);

    try {

      // Check if the email already exists
      const { data: fetchedBillMembers, error: emailExistsError } = await supabase
        .from('bill_members')
        .select(`*, guest_users:guest_id (email), users:public_user_id (email)`);

      const emailExists = fetchedBillMembers?.some(
        (bm) => bm.guest_users?.email === email || bm.users?.email === email
      );

      if (emailExists) {
        console.error(emailExistsError);
        showError(
          "Guest email error",
          "Email already exists"
        )
        setGuestRegisterLoading(false);
        return;
      }

      // Insert into guest_users table
      const { data: newGuest, error: insertError } = await supabase
        .from('guest_users')
        .insert([{ first_name: firstName, last_name: lastName, email }])
        .select()
        .single(); // get the newly created guest

      if (insertError) {
        console.log(insertError);
        alert('Failed to create guest. Try again.');
        showError(
          "Error creating guest",
          insertError.message
        )
        setGuestRegisterLoading(false);
        return;
      }

      console.log('Guest created:', newGuest);

      // OPTIONAL: Add guest to bill_members table if you have bill.id
      if (bill?.id) {
        const { error: bmError } = await supabase.from('bill_members').insert([{
          bill_id: bill.id,
          guest_id: newGuest.id
        }]);

        if (bmError) {
          console.log(bmError);
          showError(
            "Guest link to bill error",
            bmError.message
          );
          setGuestRegisterLoading(false);
          return;
        }
      }

      // Close modal
      setModalVisible(false);

      // Navigate to guest view
      router.push({
        pathname: '/guest-view',
        params: { inviteCode: inviteCode, guestEmail: email }
      });

      // Reset modal after short delay
      setTimeout(() => {
        resetModal();
      }, 500);

      setGuestRegisterLoading(false);
    } catch (err) {
      console.log(err);
      alert('An unexpected error occurred.');
      setGuestRegisterLoading(false);
    }
  };

  const resetModal = () => {
    setModalVisible(false);
    setTimeout(() => {
      setModalStep(1);
      setInviteCode('');
      setEmail('');
      setFirstName('');
      setLastName('');
    }, 300); // Reset after animation
  };

  return (
    <ImageBackground
      source={require('../../assets/images/bg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          <View style={styles.textSection}>
            <ThemedText style={styles.title}>Bill Splitter</ThemedText>
            <ThemedText style={styles.tagline}>
              Spend more time eating,{"\n"}less time calculating.
            </ThemedText>
          </View>


          <View style={styles.buttonGroup}>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable style={styles.secondaryButton}>
                <ThemedText style={styles.secondaryButtonText}>Sign In</ThemedText>
              </Pressable>
            </Link>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable style={styles.primaryButton}>
                <ThemedText style={styles.primaryButtonText}>Sign Up</ThemedText>
              </Pressable>
            </Link>
          </View>
          <Pressable style={styles.inviteLinkContainer} onPress={() => setModalVisible(true)}>
            <ThemedText style={styles.inviteLinkText}>Have an invitation code?</ThemedText>
          </Pressable>


          {/* <SignedIn>
            <View style={styles.signedInContainer}>
              <ThemedText style={styles.welcomeBack}>Hello, {user?.firstName || 'User'}!</ThemedText>
              <Link href="/(dashboardpage)/dashboard" asChild>
                <Pressable style={styles.primaryButtonLarge}>
                  <ThemedText style={styles.primaryButtonText}>Go to Dashboard</ThemedText>
                </Pressable>
              </Link>
            </View>
          </SignedIn> */}
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={archivedModalVisible}
        onRequestClose={() => setArchivedModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.modalTitle}>Archived Bill</ThemedText>
            <ThemedText style={styles.modalSubtitle}>
              You can't access an archived bill.
            </ThemedText>
            <Pressable
              style={styles.primaryButtonLarge}
              onPress={() => setArchivedModalVisible(false)}
            >
              <ThemedText style={styles.primaryButtonText}>Close</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <ScrollView
              style={{ width: '100%' }}
              contentContainerStyle={{ alignItems: 'center' }}
              showsVerticalScrollIndicator={false}
            >
              {modalStep === 1 && (
                <>
                  <ThemedText style={styles.modalTitle}>Enter Invitation Code</ThemedText>
                  <ThemedText style={styles.modalSubtitle}>Join your friends and start splitting bills instantly.</ThemedText>
                  
                  <TextInput
                    style={[styles.input, errorMessage ? styles.inputError : null]} // Optional: red border on error
                    placeholder="e.g - 909090"
                    placeholderTextColor="#999"
                    value={inviteCode}
                    onChangeText={(text) => {
                      setInviteCode(text);
                      if (errorMessage) setErrorMessage(''); // Clear error while typing
                    }}
                    autoCapitalize="characters"
                  />

                  {/* Render the Error Message if it exists */}
                  {errorMessage ? (
                    <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
                  ) : null}

                  <Pressable 
                    style={styles.primaryButtonLarge} 
                    onPress={handleInviteSubmit}
                    disabled={inviteLoading}
                  >
                    <ThemedText style={styles.primaryButtonText}>
                      {inviteLoading ? <ActivityIndicator color="white" /> : "Next"}
                    </ThemedText>
                  </Pressable>
                </>
              )}

              {modalStep === 2 && (
                <>
                  <ThemedText style={styles.codeIndicator}>You have entered the code: {bill?.invite_code}</ThemedText>
                  <ThemedText style={styles.billNameText}>{bill.name}</ThemedText>

                  <View style={styles.formGroup}>
                    <ThemedText style={styles.inputLabel}>Enter email address:</ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="your@email.com"
                      placeholderTextColor="#999"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <Pressable style={styles.primaryButtonLarge} onPress={handleEmailSubmit}>
                    <ThemedText style={styles.primaryButtonText}>{guestSubmitLoading ? <ActivityIndicator color="white" /> : "Submit"}</ThemedText>
                  </Pressable>

                  <Pressable style={styles.guestLink} onPress={() => setModalStep(3)}>
                    <ThemedText style={styles.guestLinkText}>Don't have a guest account?</ThemedText>
                  </Pressable>
                </>
              )}

              {modalStep === 3 && (
                <>
                  <ThemedText style={styles.modalTitle}>Create Guest Account</ThemedText>
                  <ThemedText style={[styles.modalSubtitle, { marginBottom: 20 }]}>Please procvide your details to continue.</ThemedText>

                  <View style={styles.formGroup}>
                    <ThemedText style={styles.inputLabel}>First Name</ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="John"
                      placeholderTextColor="#999"
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <ThemedText style={styles.inputLabel}>Last Name</ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="Doe"
                      placeholderTextColor="#999"
                      value={lastName}
                      onChangeText={setLastName}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <ThemedText style={styles.inputLabel}>Email Address</ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="john@email.com"
                      placeholderTextColor="#999"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                    />
                  </View>

                  <Pressable style={styles.primaryButtonLarge} onPress={handleRegisterGuest}>
                    <ThemedText style={styles.primaryButtonText}>{guestRegisterLoading ? <ActivityIndicator color="white" /> : "Create & Join"}</ThemedText>
                  </Pressable>
                </>
              )}

              <Pressable style={styles.closeButton} onPress={resetModal}>
                <ThemedText style={styles.closeButtonText}>Cancel</ThemedText>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ErrorModal
        visible={errorModal.visible}
        onClose={() => setErrorModal({ ...errorModal, visible: false })}
        title={errorModal.title}
        message={errorModal.message}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // Base Styles (Background, Overlay, etc.)
  background: { flex: 1, height: '100%', width: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  contentContainer: { paddingHorizontal: 25, width: '100%', maxWidth: 500 },
  textSection: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 52, color: '#fff', fontWeight: '900', textAlign: 'center' },
  tagline: { fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 15, textAlign: 'center' },
  buttonGroup: { flexDirection: 'row', width: '100%', gap: 12, justifyContent: 'center' },
  primaryButton: { flex: 1, backgroundColor: 'tomato', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  primaryButtonLarge: { width: '100%', backgroundColor: 'tomato', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  secondaryButton: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  secondaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  signedInContainer: { width: '100%', alignItems: 'center' },
  welcomeBack: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 15, fontWeight: '600' },
  inviteLinkContainer: { marginTop: 25, alignItems: 'center' },
  inviteLinkText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textDecorationLine: 'underline' },


  /* --- MODAL CORE STYLES --- */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400, maxHeight: '85%', backgroundColor: '#FFFFFF', borderRadius: 30, padding: 25, alignItems: 'center', elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#E0E0E0', borderRadius: 10, marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#1C1C1E', marginBottom: 10, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 25 },

  /* --- FORM STYLES --- */
  formGroup: { width: '100%', marginBottom: 5 },
  inputLabel: { fontSize: 14, color: '#1C1C1E', fontWeight: '700', marginBottom: 8, marginLeft: 5 },
  input: { width: '100%', height: 60, backgroundColor: '#F2F2F7', borderRadius: 15, paddingHorizontal: 20, color: '#000', fontSize: 16, fontWeight: '600', marginBottom: 15, borderWidth: 1, borderColor: '#E5E5EA' },

  /* --- STEP 2 & 3 DECORATION --- */
  codeIndicator: { fontSize: 13, color: '#8E8E93', marginBottom: 5, fontWeight: '500' },
  billNameText: { fontSize: 20, fontWeight: '800', color: '#1C1C1E', marginBottom: 25 },
  guestLink: { marginTop: 20 },
  guestLinkText: { color: 'tomato', fontSize: 14, fontWeight: '700' },
  closeButton: { marginTop: 20, marginBottom: 10 },
  closeButtonText: { color: '#8E8E93', fontSize: 14, fontWeight: '600' },

  inputError: {
    borderColor: '#FF3B30', // Red border
    borderWidth: 1,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 10,
    marginTop: -5, // Pulls it closer to the input
    alignSelf: 'flex-start',
    paddingLeft: 5,
  },
});