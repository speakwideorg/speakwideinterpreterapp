import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Fonts, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import Button from '@app/components/common/Button';
import { navigate } from '@app/navigation/RootNaivgation';

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
}

const LogoutConfirmation: React.FC<Props> = ({ onCancel, onConfirm }) => {
  const handleConfirm = () => {
    onConfirm();
    // setTimeout(() => {
    //   navigate("Success", {
    //     type: "BankRemoved",
    //     title: "Bank ",
    //     title1: "Successfully",
    //     subTitle: "Removed",
    //   });
    // }, 1000);
  };

  return (
    <View style={styles.container}>
      <Image source={Images.logout} style={styles.image} />

      <Text style={styles.title}>{"Logging out will end your\nsession Proceed?"}</Text>

      <Button
        onPress={onCancel}
        title="Cancel"
        colors={[Colors.white, Colors.white]}
        textColor={Colors.purple}
        elevation={0}
        shadowOpacity={0}
        borderColor="#D0B3FF"
      />

      <Button onPress={handleConfirm} title="Logout" marginTop={normalize(10)}/>
    </View>
  );
};

export default LogoutConfirmation;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: normalize(10),
    paddingBottom: normalize(18)
  },
  image: {
    height: normalize(80),
    width: normalize(80),
    marginVertical: normalize(10),
  },
  title: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(14),
    textAlign: 'center',
    marginVertical: normalize(10)
  },
});
