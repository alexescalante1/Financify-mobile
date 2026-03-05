import React, { useMemo } from 'react';
import { ViewStyle } from 'react-native';
import { Avatar, useTheme } from 'react-native-paper';

interface AvatarGroupProps {
  name?: string;
  imageUri?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  icon?: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = React.memo(({
  name,
  imageUri,
  size = 48,
  backgroundColor,
  textColor,
  icon = 'account',
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const bgColor = backgroundColor || theme.colors.primaryContainer;
  const txtColor = textColor || theme.colors.onPrimaryContainer;

  const initials = useMemo(() => {
    if (!name) return '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word[0].toUpperCase())
      .join('');
  }, [name]);

  const avatarStyle = useMemo(() => [
    { backgroundColor: bgColor },
    style,
  ], [bgColor, style]);

  const label = accessibilityLabel || name || 'Avatar';

  if (imageUri) {
    return (
      <Avatar.Image
        size={size}
        source={{ uri: imageUri }}
        style={style}
        testID={testID}
        accessibilityLabel={label}
      />
    );
  }

  if (name && initials) {
    return (
      <Avatar.Text
        size={size}
        label={initials}
        color={txtColor}
        style={avatarStyle}
        testID={testID}
        accessibilityLabel={label}
      />
    );
  }

  return (
    <Avatar.Icon
      size={size}
      icon={icon}
      color={txtColor}
      style={avatarStyle}
      testID={testID}
      accessibilityLabel={label}
    />
  );
});

AvatarGroup.displayName = 'AvatarGroup';
