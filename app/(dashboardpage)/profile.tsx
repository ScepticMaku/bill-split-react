import { ThemedText } from '@/components/themed-text';
import { supabase } from "@/utils/supabase";
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

// Memoized InputField component to prevent "letter by letter" issue
const InputField = React.memo(({ label, value, onChangeText, icon, ...props }: any) => (
  <View style={styles.inputWrapper}>
    <ThemedText style={styles.label}>{label}</ThemedText>
    <View style={styles.inputContainer}>
      {icon && <Ionicons name={icon} size={18} color="#AEAEB2" style={styles.inputIcon} />}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#C7C7CC"
        {...props}
      />
    </View>
  </View>
));

export default function Profile() {

  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [user, setUser] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    retrieveUser();
  }, [])

  const retrieveUser = async () => {
    setUserLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    setFirstName(user?.user_metadata?.first_name || "");
    setLastName(user?.user_metadata?.last_name || "");
    setUsername(user?.user_metadata?.username || "");
    setEmail(user?.user_metadata?.email || "");
    setNickname(user?.user_metadata?.nickname || "");
    setUserLoading(false);
  }

  // Save firstName, lastName, nickname
  const handleSaveChanges = async () => {
    setUpdateLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      email: email,
      data: { first_name: firstName, last_name: lastName, nickname: nickname, username: username }
    })

    if (error) {
      console.error(error.message);
      setUpdateLoading(false);
      return;
    }

    setSaveSuccess(true);
    setUpdateLoading(false);
  };

  return (
    <>
      {userLoading == true ? (
        <ActivityIndicator style={styles.activityIndicator} size="large" color="tomato" />
      ) : (

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerSection}>
            <View>
              <ThemedText style={styles.headerTitle}>Account Settings</ThemedText>
              <ThemedText style={styles.headerSubtitle}>Update your personal information and security</ThemedText>
            </View>
          </View>


          {/* Personal Info */}
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>Personal Information</ThemedText>
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <InputField label="First Name" value={firstName} onChangeText={setFirstName} icon="person-outline" />
              </View>
              <View style={{ flex: 1 }}>
                <InputField label="Last Name" value={lastName} onChangeText={setLastName} icon="person-outline" />
              </View>
            </View>
            <InputField label="Nickname" value={nickname} onChangeText={setNickname} icon="happy-outline" />
          </View>

          {/* Account Details */}
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>Account Details</ThemedText>
            <InputField label="Email Address" value={email} onChangeText={setEmail} />
            <InputField label="Username" value={username} onChangeText={setUsername} />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable style={styles.saveButton} onPress={handleSaveChanges}>
              <ThemedText style={styles.saveButtonText}>{updateLoading ? <ActivityIndicator color="white" /> : "Save Changes"}</ThemedText>
            </Pressable>
            {saveSuccess && (<Text style={styles.success}>Successfuly saved changes!</Text>)}

          </View>
        </ScrollView >
      )
      }
    </>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { padding: 40, backgroundColor: '#F8F9FA' },
  headerSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1C1C1E' },
  headerSubtitle: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 20 },
  row: { flexDirection: 'row' },
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#3A3A3C', marginBottom: 8, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 12, paddingHorizontal: 12, height: 50 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1C1C1E' },
  footer: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 10 },
  saveButton: { backgroundColor: '#1C1C1E', paddingVertical: 16, paddingHorizontal: 30, borderRadius: 14, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  activityIndicator: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  success: { color: 'green' }
});