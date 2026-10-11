/**
 * Demo Controls Screen (/demo-controls).
 * Linked from Profile. Allows switching personas, selecting AI scenario,
 * toggling auto-respond, simulated errors, and slow network, and resetting demo data.
 */
import React from 'react';
import { StyleSheet, View, ScrollView, Switch, Pressable, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, SectionHeader } from '@/components';
import { colors, spacing, fontFamily, radius, shadow } from '@/theme/tokens';
import { useDemoStore, type AiScenario } from '@/store/demoStore';
import { useMockDataStore } from '@/store/mockDataStore';
import { useAuth } from '@/features/auth/useAuth';
import { haptic } from '@/lib/haptics';

export default function DemoControlsScreen() {
  const router = useRouter();
  const { switchPersona } = useAuth();

  const currentPersonaId = useDemoStore((state) => state.currentPersonaId);
  const aiScenario = useDemoStore((state) => state.aiScenario);
  const autoRespond = useDemoStore((state) => state.autoRespond);
  const simulateErrors = useDemoStore((state) => state.simulateErrors);
  const slowNetwork = useDemoStore((state) => state.slowNetwork);

  const setAiScenario = useDemoStore((state) => state.setAiScenario);
  const setAutoRespond = useDemoStore((state) => state.setAutoRespond);
  const setSimulateErrors = useDemoStore((state) => state.setSimulateErrors);
  const setSlowNetwork = useDemoStore((state) => state.setSlowNetwork);
  const resetDemoControls = useDemoStore((state) => state.resetDemoControls);

  const profiles = useMockDataStore((state) => state.profiles);
  const resetToSeed = useMockDataStore((state) => state.resetToSeed);

  const handleReset = () => {
    haptic.warning();
    Alert.alert(
      'Reset Demo Data',
      'This will restore all items, seeded conversations, and donation requests to their initial demo state.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            resetToSeed();
            resetDemoControls();
            haptic.success();
            Alert.alert('Done', 'Demo data and settings have been reset.');
          },
        },
      ],
    );
  };

  const aiScenarios: Array<{ key: AiScenario; label: string; desc: string }> = [
    { key: 'auto', label: 'Auto (Default)', desc: 'Cycles High → Medium → Low across posts' },
    { key: 'high', label: 'High Confidence', desc: 'Branded item with narrow estimate' },
    { key: 'medium', label: 'Medium Confidence', desc: 'Known brand with wider estimate' },
    { key: 'low', label: 'Low Confidence', desc: 'Unbranded item with hint suggestions' },
    { key: 'flagged', label: 'Flagged Content', desc: 'Moderation block test' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityLabel="Back"
          style={styles.backBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Demo Controls</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 1. Persona Switcher */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Persona</Text>
          <Text style={styles.cardSub}>Switch instantly to test buyer, seller, and NGO perspectives.</Text>
          <View style={styles.personaList}>
            {profiles.map((p) => {
              const active = p.id === currentPersonaId;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    haptic.light();
                    switchPersona(p.id);
                  }}
                  style={[styles.personaItem, active && styles.personaItemActive]}
                >
                  <View style={[styles.avatarCircle, { backgroundColor: p.avatarColor }]}>
                    <Text style={styles.avatarLetter}>{p.displayName[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.personaName, active && styles.personaNameActive]}>
                      {p.displayName} {p.role === 'ngo' ? '(NGO)' : ''}
                    </Text>
                    <Text style={styles.personaCity}>{p.city}</Text>
                  </View>
                  {active && (
                    <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 2. AI Scenario Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Post Scenario</Text>
          <Text style={styles.cardSub}>Controls the simulated valuation generated during Post flow.</Text>
          <View style={styles.scenarioList}>
            {aiScenarios.map((sc) => {
              const active = aiScenario === sc.key;
              return (
                <Pressable
                  key={sc.key}
                  onPress={() => {
                    haptic.light();
                    setAiScenario(sc.key);
                  }}
                  style={[styles.scenarioRow, active && styles.scenarioRowActive]}
                >
                  <MaterialCommunityIcons
                    name={active ? 'radiobox-marked' : 'radiobox-blank'}
                    size={20}
                    color={active ? colors.primary : colors.textSecondary}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.scenarioLabel, active && styles.scenarioLabelActive]}>
                      {sc.label}
                    </Text>
                    <Text style={styles.scenarioDesc}>{sc.desc}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 3. Simulation Toggles */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Simulation Toggles</Text>

          {/* Auto Respond */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Auto-respond</Text>
              <Text style={styles.toggleDesc}>Mock parties accept/counter offers and swaps</Text>
            </View>
            <Switch
              value={autoRespond}
              onValueChange={(val) => {
                haptic.light();
                setAutoRespond(val);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.divider} />

          {/* Simulate Errors */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Simulate errors</Text>
              <Text style={styles.toggleDesc}>Forces service calls to throw typed AppError</Text>
            </View>
            <Switch
              value={simulateErrors}
              onValueChange={(val) => {
                haptic.light();
                setSimulateErrors(val);
              }}
              trackColor={{ false: colors.border, true: colors.danger }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.divider} />

          {/* Slow Network */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Slow network</Text>
              <Text style={styles.toggleDesc}>Doubles simulated latency on all service calls</Text>
            </View>
            <Switch
              value={slowNetwork}
              onValueChange={(val) => {
                haptic.light();
                setSlowNetwork(val);
              }}
              trackColor={{ false: colors.border, true: colors.exchange }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* 4. Reset & Design System Links */}
        <View style={styles.actionsCard}>
          <Button
            label="Reset demo data"
            onPress={handleReset}
            variant="danger"
            fullWidth
          />
          <Button
            label="Open Design System gallery"
            onPress={() => router.push('/design-system')}
            variant="secondary"
            fullWidth
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.card,
    gap: spacing.md,
    ...shadow.soft,
  },
  cardTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  cardSub: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: -4,
  },
  personaList: {
    gap: spacing.xs,
  },
  personaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  personaItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: fontFamily.bold,
    color: colors.white,
    fontSize: 14,
  },
  personaName: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  personaNameActive: {
    fontFamily: fontFamily.semiBold,
    color: colors.primaryDark,
  },
  personaCity: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  scenarioList: {
    gap: spacing.xs,
  },
  scenarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scenarioRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  scenarioLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  scenarioLabelActive: {
    fontFamily: fontFamily.semiBold,
    color: colors.primaryDark,
  },
  scenarioDesc: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  toggleLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  toggleDesc: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  actionsCard: {
    gap: spacing.xs,
  },
});
