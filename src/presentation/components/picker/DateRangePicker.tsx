import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  startLabel?: string;
  endLabel?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  locale?: string;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

type ActiveField = 'start' | 'end' | null;

const formatDate = (date: Date, locale: string): string => {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const DateRangePicker: React.FC<DateRangePickerProps> = React.memo(({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startLabel = 'Fecha inicio',
  endLabel = 'Fecha fin',
  minimumDate,
  maximumDate,
  locale = 'es-PE',
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const activeFieldRef = useRef<ActiveField>(null);

  const openStartPicker = useCallback(() => {
    if (!disabled) {
      activeFieldRef.current = 'start';
      setActiveField('start');
    }
  }, [disabled]);

  const openEndPicker = useCallback(() => {
    if (!disabled) {
      activeFieldRef.current = 'end';
      setActiveField('end');
    }
  }, [disabled]);

  const closePicker = useCallback(() => {
    activeFieldRef.current = null;
    setActiveField(null);
  }, []);

  const endDateRef = useRef(endDate);
  endDateRef.current = endDate;

  const onStartDateChangeRef = useRef(onStartDateChange);
  onStartDateChangeRef.current = onStartDateChange;
  const onEndDateChangeRef = useRef(onEndDateChange);
  onEndDateChangeRef.current = onEndDateChange;

  const handleDateChange = useCallback((
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === 'android') {
      closePicker();
    }

    if (!selectedDate || event.type === 'dismissed') return;

    const field = activeFieldRef.current;
    if (field === 'start') {
      onStartDateChangeRef.current(selectedDate);
      if (selectedDate > endDateRef.current) {
        onEndDateChangeRef.current(selectedDate);
      }
    } else if (field === 'end') {
      onEndDateChangeRef.current(selectedDate);
    }

    if (Platform.OS === 'ios') {
      closePicker();
    }
  }, [closePicker]);

  const formattedStart = useMemo(() => formatDate(startDate, locale), [startDate, locale]);
  const formattedEnd = useMemo(() => formatDate(endDate, locale), [endDate, locale]);

  const calendarIcon = useMemo(() => <TextInput.Icon icon="calendar" />, []);

  const pickerDate = activeField === 'start' ? startDate : endDate;
  const pickerMinDate = activeField === 'end' ? startDate : minimumDate;

  return (
    <View
      style={style}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.row}>
        <TouchableOpacity
          onPress={openStartPicker}
          activeOpacity={0.8}
          disabled={disabled}
          style={styles.field}
          accessibilityLabel={startLabel}
        >
          <TextInput
            label={startLabel}
            value={formattedStart}
            mode="outlined"
            editable={false}
            pointerEvents="none"
            left={calendarIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openEndPicker}
          activeOpacity={0.8}
          disabled={disabled}
          style={styles.field}
          accessibilityLabel={endLabel}
        >
          <TextInput
            label={endLabel}
            value={formattedEnd}
            mode="outlined"
            editable={false}
            pointerEvents="none"
            left={calendarIcon}
          />
        </TouchableOpacity>
      </View>

      {activeField && (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'compact' : 'default'}
          onChange={handleDateChange}
          minimumDate={pickerMinDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
});
DateRangePicker.displayName = 'DateRangePicker';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    flex: 1,
  },
});
