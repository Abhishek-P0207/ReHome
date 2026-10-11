/**
 * Stepper — progress dots / step indicator for multi-step flows (e.g. Post flow).
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, fontFamily, spacing, radius } from '@/theme/tokens';

interface Props {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
}

export function Stepper({ currentStep, totalSteps, stepTitles }: Props) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        {steps.map((step) => {
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;

          return (
            <React.Fragment key={step}>
              <View
                style={[
                  styles.dot,
                  isActive && styles.dotActive,
                  isCompleted && styles.dotCompleted,
                ]}
              >
                <Text
                  style={[
                    styles.dotText,
                    (isActive || isCompleted) && styles.dotTextActive,
                  ]}
                >
                  {step}
                </Text>
              </View>
              {step < totalSteps && (
                <View
                  style={[
                    styles.connector,
                    isCompleted && styles.connectorCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {stepTitles && stepTitles[currentStep - 1] && (
        <Text style={styles.stepTitle}>
          Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: radius.chip,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  dotCompleted: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDark,
  },
  dotText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  dotTextActive: {
    color: colors.white,
  },
  connector: {
    width: 24,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  connectorCompleted: {
    backgroundColor: colors.primary,
  },
  stepTitle: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
