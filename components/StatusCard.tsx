import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafetyStatus } from '../types';
import { colors } from '../styles/colors';
import { useTheme } from '../context/ThemeContext';

interface StatusCardProps {
  status: SafetyStatus;
}

const StatusCard: React.FC<StatusCardProps> = ({ status }) => {
  const { resolvedTheme } = useTheme();
  const isEmergency = status === SafetyStatus.ACTIVE || status === SafetyStatus.TRIGGERING;
  const themeColors = colors[resolvedTheme];

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isEmergency ? themeColors.red[600] : themeColors.surface,
        borderColor: isEmergency ? themeColors.red[500] : themeColors.border,
      }
    ]}>
      <View style={styles.header}>
        <View style={styles.textContainer}>
          <Text style={[
            styles.label,
            { color: isEmergency ? '#fee2e2' : themeColors.textSecondary }
          ]}>
            SECURITY STATUS
          </Text>
          <Text style={[
            styles.title,
            { color: isEmergency ? '#ffffff' : themeColors.text }
          ]}>
            {isEmergency ? 'Emergency Active' : 'You are Safe'}
          </Text>
        </View>
        <View style={[
          styles.iconContainer,
          {
            backgroundColor: isEmergency ? 'rgba(255,255,255,0.2)' : themeColors.emerald[50],
          }
        ]}>
          <Ionicons
            name={isEmergency ? 'shield-outline' : 'shield-checkmark'}
            size={28}
            color={isEmergency ? '#ffffff' : themeColors.emerald[500]}
          />
        </View>
      </View>
      
      <View style={[
        styles.statusBar,
        { backgroundColor: isEmergency ? 'rgba(255,255,255,0.1)' : themeColors.slate[50] }
      ]}>
        <Ionicons
          name="wifi"
          size={16}
          color={isEmergency ? '#ffffff' : themeColors.emerald[500]}
        />
        <Text style={[
          styles.statusText,
          { color: isEmergency ? '#ffffff' : themeColors.textSecondary }
        ]}>
          {isEmergency ? 'Live Tracking Enabled' : 'GPS Signal Strong'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 32,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  iconContainer: {
    padding: 12,
    borderRadius: 16,
  },
  statusBar: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default StatusCard;

