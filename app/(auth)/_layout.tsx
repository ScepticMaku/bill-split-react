import { supabase } from '@/utils/supabase';
import { router, Stack } from 'expo-router';
import { useEffect } from 'react';

export default function AuthRoutesLayout() {

  useEffect(() => {
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
  }, [])

  return <Stack screenOptions={{ headerShown: false }} />

}


