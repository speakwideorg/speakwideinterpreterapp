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
import { Colors, Icons, Fonts } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import { GOOGLE_MAPS_API_KEY } from '@env';

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
  const lastDefaultAddressRef = useRef<string | undefined>(undefined);

  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isLocationSelected, setIsLocationSelected] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');

  useEffect(() => {
    if (
      defaultAddress !== undefined &&
      defaultAddress !== '' &&
      defaultAddress !== lastDefaultAddressRef.current &&
      autocompleteRef.current
    ) {
      lastDefaultAddressRef.current = defaultAddress;
      autocompleteRef.current.setAddressText(defaultAddress);
      setInputText(defaultAddress);
      setIsLocationSelected(true);
      setShowSuggestions(false);
    }
  }, [defaultAddress]);

  const renderLocationRow = (rowData: GooglePlaceData) => {
    const title =
      rowData.structured_formatting?.main_text || rowData.description || '';
    const address = rowData.structured_formatting?.secondary_text || '';

    return (
      <View style={styles.locationRowContainer} pointerEvents="none">
        <Image source={Icons.location} style={styles.locationPinIcon} />
        <View style={styles.locationTextContainer}>
          <Text style={styles.locationTitle}>{title}</Text>
          {address ? (
            <Text style={styles.locationAddress}>{address}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  const renderClearButton = () => {
    if (!inputText) return null;

    return (
      <TouchableOpacity
        style={styles.clearButton}
        onPress={() => {
          lastDefaultAddressRef.current = '';
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
      enablePoweredByContainer={true}
      keyboardShouldPersistTaps="always"
      minLength={2}
      fetchDetails={true}
      debounce={200}
      renderRow={renderLocationRow}
      renderRightButton={() =>
        Platform.OS === 'android' ? renderClearButton() : null
      }
      query={{
        key: GOOGLE_MAPS_API_KEY,
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
        container: { width: '90%', zIndex: 1000 },
      }}
      textInputProps={{
        onChangeText: (text: string) => {
          lastDefaultAddressRef.current = text;
          setInputText(text);

          // send typing value to parent
          onTyping?.(text);

          if (text.trim().length >= 2) {
            setShowSuggestions(true);
            setIsLocationSelected(false);
          } else {
            setShowSuggestions(false);
            setIsLocationSelected(false);
          }
        },
        onFocus: () => {
          if (inputText.trim().length >= 2) {
            setShowSuggestions(true);
          }
        },
        placeholderTextColor: Colors.gray,
      }}
      onPress={(data: GooglePlaceData, details: GooglePlaceDetail | null) => {
        const address = data?.description || details?.formatted_address || '';

        lastDefaultAddressRef.current = address;
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
    marginTop: normalize(5),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: { elevation: 5 },
    }),
  },
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBEBEB',
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(8),
  },
  description: { color: '#151515' },
  locationRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPinIcon: {
    width: normalize(15),
    height: normalize(15),
    tintColor: '#9E9E9E',
    marginRight: normalize(8),
    resizeMode: 'contain',
  },
  locationTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  locationTitle: {
    fontSize: normalize(12),
    fontFamily: Fonts.DMSans_Bold,
    color: '#151515',
    marginRight: normalize(5),
  },
  locationAddress: {
    fontSize: normalize(11),
    fontFamily: Fonts.DMSans_Regular,
    color: '#8E8E93',
  },
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
