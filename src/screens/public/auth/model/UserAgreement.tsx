import { View, Text, StyleSheet } from 'react-native';
import React, { FC, useState } from 'react';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts } from '@app/themes';
import { Checkbox } from '@app/components/common/Checkbox';
import Button from '@app/components/common/Button';

interface Props {
  onCancel: Function;
  onConfirm: Function;
}

const UserAgreement: FC<Props> = ({ onCancel, onConfirm }) => {
  const [isCheck, setIsCheck] = useState(false);

  return (
    <View>
      <Text
        style={{
          fontFamily: Fonts.Inter_Medium,
          color: Colors.night_blue,
          fontSize: normalize(16),
        }}
      >
        User Agreement
      </Text>
      <Text
        style={{
          fontFamily: Fonts.Inter_Regular,
          color: Colors.dark_grey,
          fontSize: normalize(12),
          marginVertical: normalize(12),
        }}
      >
        Office ipsum you must be muted. Shelf-ware about giant strategies
        productive. Working submit seat only high client discussion lift.
        Digital teeth place other close out requirements interim. Organic
        resources know boardroom were eat door. Cadence money technologically
        discussion but. Diligence book stop later crack ensure. Work downloaded
        files canatics baked market seat unlock my. Working last synergize fured
        engagement latest paradigm marginalised.
      </Text>

      <View style={styles.termsContainer}>
        <Checkbox checked={isCheck} onChange={() => setIsCheck(!isCheck)} />
        <Text style={styles.terms}>
          {`I agree the `}
          {
            <Text onPress={() => {}} style={styles.highlight}>
              {`terms & conditions`}
            </Text>
          }
          {` of the website`}
        </Text>
      </View>

      <View style={styles.btnRow}>
        <Button
          onPress={() => onCancel()}
          title="Cancel"
          width="48%"
          marginTop={0}
          colors={[Colors.snow_drift, Colors.snow_drift]}
          textColor={Colors.purple}
          elevation={0}
          shadowOpacity={0}
          borderColor="#D0B3FF"
        />
        <Button
          onPress={() => onConfirm(isCheck)}
          title="I Agree"
          width="48%"
          marginTop={0}
        />
      </View>
    </View>
  );
};

export default UserAgreement;

const styles = StyleSheet.create({
  termsContainer: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(10),
  },
  terms: {
    fontFamily: Fonts.Oxygen_Regular,
    fontSize: normalize(12),
    color: Colors.night_blue,
    width: '90%',
    lineHeight: normalize(18),
    top: normalize(-4),
  },
  highlight: {
    fontFamily: Fonts.Oxygen_Bold,
    textDecorationLine: 'underline',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: normalize(12),
    paddingBottom: normalize(30),
    width: '100%',
  },
});
