/**
 * Main Tabs Navigation Layout.
 * 5 Tabs: Home, Donate, Post (center raised button), Inbox (with badge), Profile.
 * Uses safe area insets to ensure the system bottom bar does not interfere with navigation buttons.
 */
import React from 'react';
import { StyleSheet, View, Pressable, Platform } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing, fontFamily } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { useMockDataStore } from '@/store/mockDataStore';
import { useDemoStore } from '@/store/demoStore';

function CenterPostButton({ onPress }: { onPress?: (e?: any) => void }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={(e) => {
        haptic.medium();
        if (onPress) {
          onPress(e);
        } else {
          router.push('/(tabs)/post');
        }
      }}
      style={styles.postBtnWrapper}
      accessibilityRole="button"
      accessibilityLabel="Post an item"
    >
      <View style={styles.postBtn}>
        <MaterialCommunityIcons name="plus" size={28} color={colors.white} />
      </View>
    </Pressable>
  );
}

export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentPersonaId = useDemoStore((state) => state.currentPersonaId);
  const messages = useMockDataStore((state) => state.messages);

  // Unread badge logic: check if any pending offers or conversations have recent messages
  const pendingCount = messages.filter(
    (m) => m.kind === 'offer' && m.status === 'pending' && m.senderId !== currentPersonaId,
  ).length;

  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 8);
  const tabBarHeight = 60 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: bottomInset,
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      {/* 1. Home Feed */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'home-variant' : 'home-variant-outline'}
              size={24}
              color={color}
            />
          ),
        }}
        listeners={{
          tabPress: () => haptic.light(),
        }}
      />

      {/* 2. Donate */}
      <Tabs.Screen
        name="donate"
        options={{
          title: 'Donate',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'hand-heart' : 'hand-heart-outline'}
              size={24}
              color={color}
            />
          ),
        }}
        listeners={{
          tabPress: () => haptic.light(),
        }}
      />

      {/* 3. Post (Center Raised Highlighted Button) */}
      <Tabs.Screen
        name="post"
        options={{
          title: 'Post',
          tabBarButton: (props) => (
            <CenterPostButton onPress={props.onPress ?? (() => router.push('/post'))} />
          ),
        }}
      />

      {/* 4. Inbox */}
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: styles.badge,
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'chat' : 'chat-outline'}
              size={24}
              color={color}
            />
          ),
        }}
        listeners={{
          tabPress: () => haptic.light(),
        }}
      />

      {/* 5. Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'account' : 'account-outline'}
              size={24}
              color={color}
            />
          ),
        }}
        listeners={{
          tabPress: () => haptic.light(),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 6,
    ...shadow.soft,
  },
  tabLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
  },
  postBtnWrapper: {
    top: -14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.medium,
  },
  badge: {
    backgroundColor: colors.danger,
    fontFamily: fontFamily.semiBold,
    fontSize: 10,
  },
});
