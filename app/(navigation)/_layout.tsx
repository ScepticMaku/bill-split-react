import { useClerk, useUser } from '@clerk/clerk-expo'
import { Link, Slot, usePathname } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function RootLayout() {
  const pathname = usePathname()
  const { user } = useUser()
  const { signOut } = useClerk()

  return (
    <View style={styles.container}>
      
      {/* LEFT SIDEBAR */}
      <View style={styles.sidebar}>

        {/* TOP SECTION */}
        <View>
          <Text style={styles.logo}>BillSplit</Text>

          <Link href="/dashboard" asChild>
            <Pressable
              style={{
                ...styles.navItem,
                ...(pathname === '/dashboard' ? styles.active : {})
              }}
            >
              <Text style={styles.navText}>Dashboard</Text>
            </Pressable>
          </Link>

          <Link href="/activity" asChild>
            <Pressable
              style={{
                ...styles.navItem,
                ...(pathname === '/activity' ? styles.active : {})
              }}
            >
              <Text style={styles.navText}>Recent Activity</Text>
            </Pressable>
          </Link>

          <Link href="/all" asChild>
            <Pressable
              style={{
                ...styles.navItem,
                ...(pathname === '/all' ? styles.active : {})
              }}
            >
              <Text style={styles.navText}>All Expenses</Text>
            </Pressable>
          </Link>

          <Link href="/friends" asChild>
            <Pressable
              style={{
                ...styles.navItem,
                ...(pathname === '/friends' ? styles.active : {})
              }}
            >
              <Text style={styles.navText}>Friends</Text>
            </Pressable>
          </Link>

          <Link href="/archive" asChild>
            <Pressable
              style={{
                ...styles.navItem,
                ...(pathname === '/archive' ? styles.active : {})
              }}
            >
              <Text style={styles.navText}>Archive</Text>
            </Pressable>
          </Link>

        </View>
        

        {/* BOTTOM SECTION */}
        <View style={styles.bottomSection}>
          <Text style={styles.email}>
            {user?.emailAddresses[0]?.emailAddress}
          </Text>

          <Pressable style={styles.logoutBtn} onPress={() => signOut()}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
        </View>

      </View>

      {/* MAIN CONTENT */}
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },

  sidebar: {
    width: 220,
    backgroundColor: '#111',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,

    justifyContent: 'space-between', // 🔥 pushes bottom section down
  },

  logo: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },

  navItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 10,
  },

  active: {
    backgroundColor: '#333',
  },

  navText: {
    color: '#fff',
    fontSize: 16,
  },

  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
  },

  email: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 10,
  },

  logoutBtn: {
    backgroundColor: '#222',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 6,
  },

  logoutText: {
    color: 'tomato',
    fontWeight: 'bold',
  },

  content: {
    flex: 1,
    padding: 30,
    backgroundColor: '#f5f5f5',
  },
})