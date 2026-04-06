import Loader from '@app/utils/helpers/Loader';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

interface KeyboardAvoidingTemplateProps {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  scrollEnable?: boolean;
  loaderEnable?: boolean;
}

const KeyboardAvoidingTemplate: React.FC<KeyboardAvoidingTemplateProps> = ({
  children,
  contentContainerStyle,
  style,
  scrollEnable = true,
  loaderEnable = false,
}) => {
  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      onStartShouldSetResponder={() => {
        Keyboard.dismiss();
        return false;
      }}
    >
      <Loader visible={loaderEnable} />
      <TouchableWithoutFeedback accessible={false}>
        <ScrollView
          scrollEnabled={scrollEnable}
          contentContainerStyle={[
            styles.contentContainer,
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {children}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 500,
  },
});

export default KeyboardAvoidingTemplate;
