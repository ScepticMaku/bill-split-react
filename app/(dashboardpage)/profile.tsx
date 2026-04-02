import { ErrorModal } from '@/components/error-modal';
import { ThemedText } from '@/components/themed-text';
import { supabase } from "@/utils/supabase";
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import validator from 'validator';

// Memoized InputField component with disabled state support
const InputField = React.memo(({ label, value, onChangeText, icon, editable = true, error, secureTextEntry, ...props }: any) => {
  // Local state to toggle visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.inputWrapper}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View style={[
        styles.inputContainer,
        !editable && { backgroundColor: '#E5E5EA', opacity: 0.8 },
        error && { borderWidth: 1, borderColor: '#FF3B30' }
      ]}>
        {icon && <Ionicons name={icon} size={18} color={error ? "#FF3B30" : (editable ? "#AEAEB2" : "#8E8E93")} style={styles.inputIcon} />}

        <TextInput
          style={[styles.input, !editable && { color: '#8E8E93' }]}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#C7C7CC"
          editable={editable}
          // If secureTextEntry is true, use our local toggle state
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />

        {/* Show/Hide Toggle Button */}
        {secureTextEntry && (
          <Pressable
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#8E8E93"
            />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

export default function Profile() {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});

  const [userLoading, setUserLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [existingNicknames, setExistingNicknames] = React.useState([]);
  const [currentNickname, setCurrentNickname] = React.useState('');

  React.useEffect(() => {
    loadNicknames();
  }, []);

  const loadNicknames = async () => {
    const { data: nicknameData } = await supabase.from("users").select("nickname");

    setExistingNicknames(nicknameData?.map(n => n.nickname));
  }

  const [errorModal, setErrorModal] = useState({
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

  useEffect(() => {
    retrieveUser();
  }, []);

  const retrieveUser = async () => {
    setUserLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setFirstName(user.user_metadata?.first_name || "");
        setLastName(user.user_metadata?.last_name || "");
        setUsername(user.user_metadata?.username || "");
        setEmail(user.email || ""); // Use direct email field from user object
        setNickname(user.user_metadata?.nickname || "");
        setCurrentNickname(user.user_metadata?.nickname || "");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setUserLoading(false);
    }
  };

  const validateForm = () => {
    let newErrors = {};

    // 1. Basic Required Checks
    if (validator.isEmpty(firstName.trim())) newErrors.firstName = "First name is required";
    if (validator.isEmpty(lastName.trim())) newErrors.lastName = "Last name is required";

    if (validator.isEmpty(nickname.trim())) {
      newErrors.nickname = "Nickname is required";
    } else if (existingNicknames.filter(n => n !== currentNickname).includes(nickname.toLowerCase())) {
      newErrors.nickname = "Nickname is already taken";
    }

    // 2. Username: No spaces or special characters (letters, numbers, underscores only)
    const usernameRegex = /^[a-zA-Z0-0_]+$/;
    if (validator.isEmpty(username.trim())) {
      newErrors.username = "Username is required";
    } else if (!usernameRegex.test(username)) {
      newErrors.username = "No spaces or special characters allowed";
    }

    // 3. Email Validation
    if (validator.isEmpty(email.trim())) {
      newErrors.email = "Email is required";
    } else if (!validator.isEmail(email.trim())) {
      newErrors.email = "Invalid email format";
    }

    if (newPassword.length > 0) {
      // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!validator.isStrongPassword(newPassword)) {
        newErrors.password = "Must be 8+ chars with Uppercase, Lowercase, Number, and Special char";
      }

      // Only check match if there is a new password AND a confirm password attempt
      if (!validator.equals(confirmPassword, newPassword)) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    // 4. Strong Password Validation
    // Min 8 chars, 1 Upper, 1 Lower, 1 Number, 1 Special

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  console.log(errors);

  const handleSaveChanges = async () => {
    setUpdateLoading(true);
    setSaveSuccess(false);

    try {
      // 1. Get the current user ID
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      // 2. Update the Database Table (The "Public" Truth)
      const { error: dbError } = await supabase
        .from('users') // Your table name
        .update({
          first_name: firstName,
          last_name: lastName,
          nickname: nickname,
          username: username
        })
        .eq('auth_user_id', user.id); // Matches the user record

      if (dbError) throw dbError;

      // 3. Update Auth Metadata (The "Session" Truth)
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          nickname: nickname,
          username: username,
        }
      });

      if (confirmPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: confirmPassword
        });

        if (passwordError) {
          showError(
            "Error updating user",
            passwordError.message
          );
        }
      }


      if (authError) {
        showError(
          "Error updating user",
          authError.message
        )
        return;
      }

      // Success!
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

    } catch (error: any) {
      showError(
        "Update Failed",
        error.message
      )
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      handleSaveChanges();
    }
  }

  if (userLoading) {
    return <ActivityIndicator style={styles.activityIndicator} size="large" color="tomato" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerSection}>
        <View>
          <ThemedText style={styles.headerTitle}>Account Settings</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Update your personal information</ThemedText>
        </View>
      </View>

      {/* {errors ? <Text style={styles.clerkError}>{errors}</Text> : null} */}

      <View style={styles.userProfile}>

        {/* Personal Info */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Personal Information</ThemedText>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <InputField label="First Name" value={firstName} onChangeText={setFirstName} error={errors.firstName} icon="person-outline" />
            </View>
            <View style={{ flex: 1 }}>
              <InputField label="Last Name" value={lastName} onChangeText={setLastName} error={errors.lastName} icon="person-outline" />
            </View>
          </View>
          <InputField label="Nickname" value={nickname} onChangeText={setNickname} error={errors.nickname} icon="happy-outline" />
        </View>

        {/* Account Details */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Account Details</ThemedText>
          <InputField
            label="Email Address (Locked)"
            value={email}
            editable={false}
            icon="mail-outline"
          />
          <InputField
            label="Username"
            value={username}
            onChangeText={setUsername}
            icon="at-outline"
            error={errors.username}
          />
        </View>

        {/* Account Details */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Security</ThemedText>
          <InputField label="New Password" value={newPassword} onChangeText={setNewPassword} error={errors.password} secureTextEntry />
          <InputField label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} error={errors.confirmPassword} secureTextEntry />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.saveButton, updateLoading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={updateLoading}
        >
          {updateLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
          )}
        </Pressable>

        {saveSuccess && (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={18} color="green" />
            <Text style={styles.success}> Changes saved!</Text>
          </View>
        )}
      </View>

      <ErrorModal
        visible={errorModal.visible}
        onClose={() => setErrorModal({ ...errorModal, visible: false })}
        title={errorModal.title}
        message={errorModal.message}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#F8F9FA', paddingBottom: 60, width: '100%' },
  headerSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, marginTop: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1C1C1E' },
  headerSubtitle: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  card: { backgroundColor: '#fff', width: '45%', borderRadius: 20, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 20 },
  row: { flexDirection: 'row' },
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#3A3A3C', marginBottom: 8, marginLeft: 4 },
  // inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 12, paddingHorizontal: 12, height: 50 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1C1C1E' },
  footer: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 15 },
  saveButton: { backgroundColor: '#1C1C1E', paddingVertical: 16, paddingHorizontal: 30, borderRadius: 14, alignItems: 'center', minWidth: 150 },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  activityIndicator: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  successContainer: { flexDirection: 'row', alignItems: 'center' },
  success: { color: 'green', fontWeight: '600' },
  userProfile: { flex: 1, flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  errorText: {
    color: '#FF3B30', // Apple System Red
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,           // Added to prevent layout jump when error appears
    borderColor: 'transparent' // Default transparent border
  },
});