import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function Friends() {
  return (
    <View style={styles.container}>
      
      {/* HEADER ROW */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          Friends
        </Text>

        <Pressable
          style={styles.createButton}
          onPress={() => router.push('/invite-friends')}
        >
          <Text style={styles.buttonText}>
            Invite Friends +
          </Text>
        </Pressable>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },

  headerRow: {
    flexDirection: 'row',              // 👈 puts them side by side
    justifyContent: 'space-between',   // 👈 pushes them apart
    alignItems: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  createButton: {
    backgroundColor: '#ff7a00',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
})