import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
  Image,
  Keyboard,
} from 'react-native';
import {
  GooglePlacesAutocomplete,
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete';
import { Colors, Icons } from '@app/themes';
import { normalize } from '@app/utils/orientation';

interface PlacesAutocompleteInputProps {
  placeholder?: string;
  onLocationSelect?: (
    data: GooglePlaceData | null,
    details: GooglePlaceDetail | null,
  ) => void;
  defaultAddress?: string;

  // NEW PROP
  onTyping?: (text: string) => void;
}

const PlacesAutocompleteInput: React.FC<PlacesAutocompleteInputProps> = ({
  placeholder,
  onLocationSelect,
  defaultAddress,
  onTyping,
}) => {
  const autocompleteRef = useRef<GooglePlacesAutocompleteRef | null>(null);

  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isLocationSelected, setIsLocationSelected] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');

  useEffect(() => {
    if (defaultAddress && autocompleteRef.current) {
      autocompleteRef.current.setAddressText(defaultAddress);
      setInputText(defaultAddress);
      setIsLocationSelected(true);
      setShowSuggestions(false);
    }
  }, [defaultAddress]);

  const renderLocationRow = (rowData: GooglePlaceData) => {
    const title = rowData.structured_formatting.main_text;
    const address = rowData.structured_formatting.secondary_text;

    return (
      <View style={styles.locationRowContainer}>
        <View style={styles.locationTextContainer}>
          <Text style={styles.locationTitle}>{title}</Text>
          <Text style={styles.locationAddress}>{address}</Text>
        </View>
      </View>
    );
  };

  const renderClearButton = () => {
    if (!isLocationSelected || !inputText) return null;

    return (
      <TouchableOpacity
        style={styles.clearButton}
        onPress={() => {
          autocompleteRef.current?.setAddressText('');
          setInputText('');
          setIsLocationSelected(false);
          setShowSuggestions(false);
          Keyboard.dismiss();

          onLocationSelect?.(null, null);
          onTyping?.('');
        }}
      >
        <Image source={Icons.close} style={styles.clearButtonIcon} />
      </TouchableOpacity>
    );
  };

  return (
    <GooglePlacesAutocomplete
      ref={autocompleteRef}
      placeholder={placeholder || 'Enter Address'}
      enablePoweredByContainer={false}
      minLength={2}
      fetchDetails={true}
      debounce={200}
      renderRow={renderLocationRow}
      renderRightButton={() =>
        Platform.OS === 'android' ? renderClearButton() : null
      }
      query={{
        key: 'AIzaSyCZ7D7QHZVpzkpYgX91tznbypaCGqYKO8Y',
        language: 'en',
      }}
      styles={{
        textInput: styles.textInput,
        listView: {
          ...styles.listView,
          height: showSuggestions ? undefined : 0,
          opacity: showSuggestions ? 1 : 0,
        },
        row: styles.row,
        description: styles.description,
        container: { width: '90%' },
      }}
      textInputProps={{
        onChangeText: (text: string) => {
          setInputText(text);

          //  send typing value to parent
          onTyping?.(text);

          if (text.trim().length > 0) {
            setShowSuggestions(true);
            setIsLocationSelected(false);
          } else {
            setShowSuggestions(false);
            setIsLocationSelected(false);
          }
        },
        onFocus: () => {
          if (inputText.trim().length > 0 && !isLocationSelected) {
            setShowSuggestions(true);
          }
        },
        placeholderTextColor: Colors.gray,
      }}
      onPress={(data: GooglePlaceData, details: GooglePlaceDetail | null) => {
        const address = data?.description || '';

        autocompleteRef.current?.setAddressText(address);
        setInputText(address);

        setIsLocationSelected(true);
        setShowSuggestions(false);

        Keyboard.dismiss();

        onLocationSelect?.(data, details);
      }}
    />
  );
};

export default PlacesAutocompleteInput;

const styles = StyleSheet.create({
  textInput: {
    paddingRight: normalize(30),
    height: normalize(45),
    backgroundColor: Colors.white_lilae,
    color: Colors.night_blue,
    fontSize: normalize(12),
    borderRadius: normalize(10),
    borderColor: Colors.white_chalk,
    borderWidth: normalize(1.5),
    paddingLeft: normalize(10),
    ...Platform.select({
      ios: { paddingVertical: normalize(10) },
      android: { paddingVertical: normalize(5) },
    }),
  },
  listView: {
    marginHorizontal: normalize(2),
    borderRadius: normalize(10),
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    paddingVertical: normalize(10),
  },
  description: { color: '#151515' },
  locationRowContainer: { flexDirection: 'column' },
  locationTextContainer: { flex: 1 },
  locationTitle: { fontSize: normalize(12), color: '#151515' },
  locationAddress: { fontSize: normalize(11), color: '#939393' },
  clearButton: {
    position: 'absolute',
    top: normalize(15),
    right: normalize(10),
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    height: normalize(18),
    width: normalize(18),
    backgroundColor: Colors.white,
    borderRadius: normalize(50),
  },
  clearButtonIcon: {
    width: normalize(15),
    height: normalize(15),
    tintColor: '#555',
  },
});
