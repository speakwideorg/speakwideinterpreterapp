import React, { useEffect } from 'react';
import { Colors, Fonts } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import {
  areaOfExpertiseRequest,
  businessSectorListRequest,
  languageListRequest,
} from '@app/store/slice/default.slice';
import { profileDetailsRequest } from '@app/store/slice/auth.slice';
import { useAppDispatch } from '@app/store';

const InitialOnboarding = () => {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isFocused) {
      dispatch(businessSectorListRequest({}));
      dispatch(areaOfExpertiseRequest({}));
      dispatch(languageListRequest({}));
      dispatch(profileDetailsRequest({}));
    }
  }, [dispatch, isFocused]);
  return (
    <View style={styles.mainContainerStyle}>
      <ActivityIndicator size={'large'} color={Colors.purple} />
      <Text style={styles.textStyle}>Loading . . .</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainerStyle: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: normalize(10),
    alignSelf: 'center',
  },
  textStyle: {
    fontFamily: Fonts.Inter_Bold,
    color: Colors.purple,
    fontSize: normalize(15),
  },
});

export default InitialOnboarding;
