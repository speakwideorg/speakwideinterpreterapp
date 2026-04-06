/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import KeyboardAvoidingTemplate from '@app/components/template/KeyboardAvoidingTemplate';
import {
  horizontalScale,
  moderateScale,
  normalize,
} from '@app/utils/orientation';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import Button from '@app/components/common/Button';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { validEIN, validSSN } from '@app/utils/helpers/Validation';
import TextInput from '@app/components/common/TextInput';
import Selection from '@app/components/common/Selection';
import {
  formatEIN,
  formatSSN,
  unformatEIN,
  unformatSSN,
} from '@app/utils/helpers/DataFormat';
import CustomImagePicker from '@app/components/common/CustomImagePicker';
import Css from '@app/themes/Css';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { showMessage } from '@app/utils/helpers/Toast';
import { useAppDispatch, useAppSelector } from '@app/store';
import { logoutRequest } from '@app/store/slice/auth.slice';
import ExpertisePicker, {
  expertiseInterface,
} from '@app/components/template/ExpertisePicker';
import LanguagePicker, {
  languageInterface,
} from '@app/components/template/LanguagePicker';
import ExitAppModal from '@app/components/template/ExitPopup';
import {
  profileSetupRequest,
  resetUserDefaults,
} from '@app/store/slice/user.slice';
import { useIsFocused } from '@react-navigation/native';
import PlacesAutocompleteInput from '@app/components/common/PlaceAutocompleteInput';
import { getFileFromLocal } from '@app/utils/helpers/FileActions';
import CustomImageFilePicker from '@app/components/common/CustomImageFilePicker';

type ProfileSetupProps = {
  street_address: string;
  ssn: string;
  ein: string;
  about_me: string;
  preferred_gender: string;
  expertise_temp: string;
};

const ProfileSetup = () => {
  const dispatch = useAppDispatch();
  const { languageListResponse, areaOfExpertiseListResponse } = useAppSelector(
    state => state.default,
  );
  const { status, isLoading } = useAppSelector(state => state.user);
  const [info, setInfo] = useState<ProfileSetupProps>({
    street_address: '',
    ssn: '',
    ein: '',
    about_me: '',
    preferred_gender: 'Male',
    expertise_temp: '',
  });

  const [certificateList, setCertificateList] = useState<
    {
      image: { uri: string; name: string; type: string };
      expire_date: string;
    }[]
  >([{ expire_date: '', image: { name: '', type: '', uri: '' } }]);
  const [identificationList, setIdentificationList] = useState<
    {
      uri: string;
      name: string;
      type: string;
    }[]
  >([{ name: '', type: '', uri: '' }]);
  const [w99FormData, setW99FormData] = useState<{
    uri: string;
    name: string;
    type: string;
  }>({ name: '', type: '', uri: '' });
  const [imageIsVisible, setImageIsVisible] = useState<boolean>(false);
  const [dateVisibleId, setDateVisibleId] = useState<number | null>(null);
  const [languageIsVisible, setLanguageIsVisible] = useState(false);
  const [expertiseIsVisible, setExpertiseIsVisible] = useState(false);
  const [imagePickerData, setImagePickerData] = useState<{
    type: 'doc' | 'id' | 'w9';
    index: number;
  }>({
    type: 'doc',
    index: 0,
  });
  const [expertise, setExpertise] = useState<expertiseInterface[]>([]);
  const [languages, setLanguages] = useState<languageInterface[]>([]);
  const [isExit, setIsExit] = useState(false);

  useEffect(() => {
    switch (status) {
      case 'user/profileSetupSuccess': {
        dispatch(resetUserDefaults());
        break;
      }
      case 'user/profileSetupFailure': {
        dispatch(resetUserDefaults());
        break;
      }
    }
  }, [status]);

  const updateValue = (field: keyof ProfileSetupProps, value: string) => {
    setInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    console.log('certificateList', certificateList);
    if (!info.ssn && !info.ein) {
      showMessage('EIN or SSN is required.');
      return;
    } else if (info.ssn && !validSSN(info.ssn)) {
      showMessage('Invalid SSN provided');
      return;
    } else if (info.ein && !validEIN(info.ein)) {
      showMessage('Invalid EIN provided');
      return;
    } else if (expertise.length === 0) {
      showMessage('Please add expertise');
      return;
    } else if (languages.length === 0) {
      showMessage('Please add language');
      return;
    } else if (!info.street_address) {
      showMessage('Please add address');
      return;
    } else if (!info.about_me) {
      showMessage('Please add your description');
      return;
    } else if (!info.preferred_gender) {
      showMessage('Please add Your Gender');
      return;
    } else if (
      certificateList.some(item => item.image?.uri && !item.expire_date)
    ) {
      showMessage('Please add or complete expiry date and certificate.');
      return;
    } else if (!identificationList.every(item => item.uri)) {
      showMessage('Please add or complete identification card.');
      return;
    } else if (info.ein && info.ssn) {
      showMessage('Please provide either EIN or SSN, not both.');
      return;
    } else {
      const payload = new FormData();
      payload.append('ein', info.ein);
      payload.append('social_security_number', info.ssn);
      payload.append('address', info.street_address);
      payload.append('gender', info.preferred_gender);
      payload.append('objectives', info.about_me);
      expertise?.forEach((item, index) => {
        payload.append(`area_of_expertise_id[${index}]`, item._id);
      });

      languages?.forEach((item, index) => {
        payload.append(`language_id[${index}]`, item._id);
      });

      identificationList?.forEach(item => {
        payload.append('identity_proofs', item as any);
      });

      certificateList?.forEach(item => {
        if (item?.image?.uri !== '') {
          payload.append('certificate_documents', item?.image as any);
        }
      });

      certificateList?.forEach(item => {
        if (item?.image?.uri !== '') {
          payload.append('certificate_expiration_date', item?.expire_date);
        }
      });
      if (w99FormData?.uri) payload.append('w9Form', w99FormData as any);

      console.log('payload is ===>', payload);

      dispatch(profileSetupRequest(payload));
    }
  };

  return (
    <KeyboardAvoidingTemplate
      contentContainerStyle={styles.container}
      loaderEnable={isLoading}
    >
      <View style={styles.main}>
        <ImageBackground source={Images.background} style={styles.background}>
          <MyStatusBar
            backgroundColor={'transparent'}
            barStyle={'dark-content'}
            translucent
          />
          <View style={styles.v}>
            <View style={styles.logoRowContainer}>
              <Image source={Icons.logo} style={styles.logo} />
              <TouchableOpacity
                style={styles.exitContainer}
                onPress={() => {
                  setIsExit(true);
                }}
              >
                <Image
                  source={Icons.icon_exit}
                  style={styles.exit}
                  tintColor={Colors.purple}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>
              Add{' '}
              <Text style={{ fontFamily: Fonts.Manrope_SemiBold }}>
                Profile Details
              </Text>
            </Text>
          </View>
          {isExit && (
            <ExitAppModal
              visible={isExit}
              onCancel={() => setIsExit(false)}
              onConfirm={() => {
                setIsExit(false);
                dispatch(logoutRequest({}));
              }}
            />
          )}
        </ImageBackground>

        <View style={styles.v1}>
          <Image
            source={Images.backgroundHeader}
            style={styles.backgroundHeader}
          />

          {/* SSN */}
          <TextInput
            title={'Social Security Number'}
            value={formatSSN(info.ssn)}
            onChangeText={txt => updateValue('ssn', unformatSSN(txt))}
            placeholder="Enter social security number"
            maxLength={11}
          />

          <View style={styles.divider}>
            <Text style={styles.orText}>Or</Text>
          </View>

          {/* EIN */}
          <TextInput
            title={'EIN'}
            value={formatEIN(info.ein)}
            onChangeText={txt => updateValue('ein', unformatEIN(txt))}
            placeholder="Enter EIN"
            maxLength={10}
          />

          <View style={styles.section}>
            <Text style={[styles.label]}>Area of Expertise</Text>
            <View style={styles.languageBox}>
              <View style={styles.chipWrapper}>
                {expertise.length > 0 ? (
                  expertise.map((item, i) => (
                    <View key={i} style={styles.chip}>
                      <Text
                        style={[styles.chipText, { fontSize: normalize(11) }]}
                      >
                        {item?.expertise_display_name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          const isChecked = expertise.includes(item);
                          let updated: expertiseInterface[];
                          if (isChecked) {
                            updated = expertise.filter(
                              lang => lang?._id !== item?._id,
                            );
                          } else {
                            updated = [...expertise, item];
                          }
                          setExpertise?.(updated);
                        }}
                      >
                        <Image
                          source={Icons.close}
                          style={styles.chipCloseLg}
                        />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={styles.placeholderStyle}>
                    E.g. Legal, Medical
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.touch}
                onPress={() => setExpertiseIsVisible(true)}
              >
                <Image
                  source={Icons.arrow_drop_down}
                  style={styles.dropdownIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Languages */}
          <View style={styles.section}>
            <Text style={[styles.label]}>Select your supported languages</Text>
            <View style={styles.languageBox}>
              <View style={styles.chipWrapper}>
                {languages.length > 0 ? (
                  languages.map((item, i) => (
                    <View key={i} style={styles.chip}>
                      <Text
                        style={[styles.chipText, { fontSize: normalize(11) }]}
                      >
                        {item?.language_display_name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          const isChecked = languages.includes(item);
                          let updated: languageInterface[];
                          if (isChecked) {
                            updated = languages.filter(
                              lang => lang?._id !== item?._id,
                            );
                          } else {
                            updated = [...languages, item];
                          }
                          setLanguages?.(updated);
                        }}
                      >
                        <Image
                          source={Icons.close}
                          style={styles.chipCloseLg}
                        />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={styles.placeholderStyle}>
                    E.g. English, Spanish
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.touch}
                onPress={() => setLanguageIsVisible(true)}
              >
                <Image
                  source={Icons.arrow_drop_down}
                  style={styles.dropdownIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.streetAddressLabel}>Street Address</Text>

          <PlacesAutocompleteInput
            placeholder="Enter address"
            defaultAddress={''}
            onTyping={(text: string) => {
              updateValue('street_address', text);
            }}
            onLocationSelect={(data: any, details = null) => {
              updateValue('street_address', data?.description);
            }}
          />

          {/* Gender */}
          <Selection
            title={'Gender'}
            value={info.preferred_gender}
            placeholder="Select gender"
            options={[
              { label: 'Male' },
              { label: 'Female' },
              { label: 'Choose not to disclose' },
            ]}
            onChange={val => {
              updateValue('preferred_gender', val.label);
            }}
          />

          {/* About me */}
          <TextInput
            title="About Me"
            value={info.about_me}
            onChangeText={txt => updateValue('about_me', txt)}
            placeholder="Please write a brief description about yourself"
            height={normalize(130)}
            multiline
            paddingTop={normalize(10)}
          />

          {/* Upload Docs */}
          <View style={styles.uploadBox}>
            <Text style={styles.uploadTitle}>
              Upload your Documents/Certificates
            </Text>
            {certificateList?.map((item, index) => {
              return (
                <View style={Css.w100} key={index}>
                  <View style={styles.logoContainer}>
                    {item?.image?.uri ? (
                      <View style={styles.imageView}>
                        {item.image.type.startsWith('image/') ? (
                          <Image
                            source={{ uri: item?.image.uri }}
                            style={[Css.w100, Css.h100]}
                          />
                        ) : (
                          <View
                            style={{
                              justifyContent: 'center',
                              alignItems: 'center',
                              padding: normalize(10),
                            }}
                          >
                            <Image
                              source={Icons.upload}
                              style={styles.backup}
                            />
                            <Text style={styles.title1}>{item.image.name}</Text>
                          </View>
                        )}
                        <TouchableOpacity
                          style={styles.imageDeleteContainer}
                          onPress={() => {
                            setCertificateList(prev =>
                              prev.map((val, i) =>
                                i === index
                                  ? {
                                      ...val,
                                      expire_date: '',
                                      image: {
                                        name: '',
                                        type: '',
                                        uri: '',
                                      },
                                    }
                                  : val,
                              ),
                            );
                          }}
                        >
                          <Image
                            source={Icons.cross}
                            style={{
                              height: normalize(26),
                              width: normalize(26),
                            }}
                          />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.logoView}
                        onPress={() => {
                          getFileFromLocal({
                            isMultiple: false,
                            callback: files => {
                              console.log('Picked File:', files);
                              setCertificateList(prev =>
                                prev.map((itm, i) =>
                                  i === index
                                    ? {
                                        ...itm,
                                        expire_date: '',
                                        image: {
                                          name: files[0]?.path?.name || '',
                                          uri: files[0]?.path?.uri || '',
                                          type:
                                            files[0]?.path?.type ||
                                            'image/jpeg',
                                        },
                                      }
                                    : itm,
                                ),
                              );
                            },
                          });

                          // setImageIsVisible(true);
                          // setImagePickerData({ type: 'doc', index: index });
                        }}
                      >
                        <Image source={Icons.upload} style={styles.backup} />
                        <Text style={styles.title1}>Upload your file</Text>
                        <Text style={styles.title2}>
                          (Max 5 files, 10MB each)
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TextInput
                    title={'Add Certification Expiration Date'}
                    value={item?.expire_date}
                    onChangeText={txt =>
                      setCertificateList(prev =>
                        prev.map((val, i) =>
                          i === index ? { ...val, expire_date: txt } : val,
                        ),
                      )
                    }
                    placeholder="Select Expiration Date"
                    width={'100%'}
                    editable={false}
                    backgroundColor={Colors.white}
                    titleStyle={{ fontSize: normalize(10) }}
                    rightIcon={Icons.calendar}
                    onRightIconPress={() => {
                      setDateVisibleId(index);
                    }}
                  />
                  <DatePicker
                    modal
                    open={dateVisibleId === index}
                    date={
                      item?.expire_date
                        ? new Date(item?.expire_date)
                        : new Date()
                    }
                    onConfirm={date => {
                      setCertificateList(prev =>
                        prev.map((val, i) =>
                          i === index
                            ? {
                                ...val,
                                expire_date: moment(date).format('YYYY-MM-DD'),
                              }
                            : val,
                        ),
                      );
                      setDateVisibleId(null);
                    }}
                    onCancel={() => {
                      setDateVisibleId(null);
                    }}
                    mode="date"
                    minimumDate={new Date()}
                    maximumDate={
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() + 25),
                      )
                    }
                  />
                  <TouchableOpacity
                    disabled={
                      certificateList.length === 1 &&
                      index === 0 &&
                      item.expire_date === '' &&
                      item.image.uri === ''
                    }
                    style={styles.deleteButton}
                    activeOpacity={0.5}
                    onPress={() => {
                      setCertificateList(prev =>
                        prev.length === 1
                          ? prev.map((val, i) =>
                              i === index
                                ? {
                                    ...val,
                                    expire_date: '',
                                    image: { name: '', type: '', uri: '' },
                                  }
                                : val,
                            )
                          : prev.filter((_, i) => i !== index),
                      );
                    }}
                  >
                    <Image
                      source={Icons.delete}
                      style={styles.deleteIcon}
                      tintColor={Colors.white}
                    />
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                  <View style={styles.horrizontalLine} />
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.addMoreContainer}
              onPress={() => {
                setCertificateList(prev => [
                  ...prev,
                  {
                    expire_date: '',
                    image: {
                      name: '',
                      type: '',
                      uri: '',
                    },
                  },
                ]);
              }}
            >
              <Text style={styles.addMore}>+Add More</Text>
            </TouchableOpacity>
          </View>

          {/* Upload ID */}
          <View style={styles.uploadBox}>
            <Text style={styles.uploadTitle}>
              Upload Drivers License or Identification Card
            </Text>
            {identificationList?.map((item, index) => {
              return (
                <View style={Css.w100} key={index}>
                  <View style={styles.logoContainer}>
                    {item?.uri ? (
                      <View style={styles.imageView}>
                        {item.type.startsWith('image/') ? (
                          <Image
                            source={{ uri: item?.uri }}
                            style={[Css.w100, Css.h100]}
                          />
                        ) : (
                          <View
                            style={{
                              justifyContent: 'center',
                              alignItems: 'center',
                              padding: normalize(10),
                            }}
                          >
                            <Image
                              source={Icons.upload}
                              style={styles.backup}
                            />
                            <Text style={styles.title1}>{item.name}</Text>
                          </View>
                        )}
                        <TouchableOpacity
                          style={styles.imageDeleteContainer}
                          onPress={() => {
                            setIdentificationList(prev =>
                              prev.map((val, i) =>
                                i === index
                                  ? {
                                      name: '',
                                      type: '',
                                      uri: '',
                                    }
                                  : val,
                              ),
                            );
                          }}
                        >
                          <Image
                            source={Icons.cross}
                            style={{
                              height: normalize(26),
                              width: normalize(26),
                            }}
                          />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.logoView}
                        onPress={() => {
                          // getFileFromLocal({
                          //   isMultiple: false,
                          //   callback: files => {
                          //     console.log('Picked File:', files);

                          //     setIdentificationList(prev =>
                          //       prev.map((itm, i) =>
                          //         i === index
                          //           ? {
                          //               name: files[0]?.path?.name || '',
                          //               uri: files[0]?.path?.uri || '',
                          //               type:
                          //                 files[0]?.path?.type || 'image/jpeg',
                          //             }
                          //           : itm,
                          //       ),
                          //     );
                          //   },
                          // });

                          setImageIsVisible(true);
                          setImagePickerData({ type: 'id', index: index });
                        }}
                      >
                        <Image source={Icons.upload} style={styles.backup} />
                        <Text style={styles.title1}>Upload your file</Text>
                        <Text style={styles.title2}>
                          (Max 5 files, 10MB each)
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    disabled={
                      certificateList.length === 1 &&
                      index === 0 &&
                      item.uri === ''
                    }
                    style={styles.deleteButton}
                    activeOpacity={0.5}
                    onPress={() => {
                      setIdentificationList(prev =>
                        prev.length === 1
                          ? prev.map((val, i) =>
                              i === index
                                ? { name: '', type: '', uri: '' }
                                : val,
                            )
                          : prev.filter((_, i) => i !== index),
                      );
                    }}
                  >
                    <Image
                      source={Icons.delete}
                      style={styles.deleteIcon}
                      tintColor={Colors.white}
                    />
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                  <View style={styles.horrizontalLine} />
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.addMoreContainer}
              onPress={() => {
                setIdentificationList(prev => [
                  ...prev,
                  {
                    name: '',
                    type: '',
                    uri: '',
                  },
                ]);
              }}
            >
              <Text style={styles.addMore}>+Add More</Text>
            </TouchableOpacity>
          </View>

          {/* upload w9 form */}
          <View style={styles.uploadBox}>
            <Text style={styles.uploadTitle}>Upload W9 Form</Text>

            <View style={Css.w100}>
              <View style={styles.logoContainer}>
                {w99FormData?.uri ? (
                  <View style={styles.imageView}>
                    {w99FormData.type.startsWith('image/') ? (
                      <Image
                        source={{ uri: w99FormData?.uri }}
                        style={[Css.w100, Css.h100]}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: normalize(10),
                        }}
                      >
                        <Image source={Icons.upload} style={styles.backup} />
                        <Text style={styles.title1}>{w99FormData.name}</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.imageDeleteContainer}
                      onPress={() => {
                        setW99FormData({ name: '', type: '', uri: '' });
                      }}
                    >
                      <Image
                        source={Icons.cross}
                        style={{
                          height: normalize(26),
                          width: normalize(26),
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.logoView}
                    onPress={() => {
                      getFileFromLocal({
                        isMultiple: false,
                        callback: files => {
                          console.log('Picked File:', files);
                          setW99FormData({
                            name: files[0]?.path?.name || '',
                            uri: files[0]?.path?.uri || '',
                            type: files[0]?.path?.type || 'image/jpeg',
                          });
                        },
                      });
                      // setImageIsVisible(true);
                      // setImagePickerData({
                      //   type: 'w9', // explicit single document type
                      //   index: 3,
                      // });
                    }}
                  >
                    <Image source={Icons.upload} style={styles.backup} />
                    <Text style={styles.title1}>Upload your W9 document</Text>
                    <Text style={styles.title2}>(Single file, max 10MB)</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <Button
            title="Continue"
            marginTop={normalize(10)}
            onPress={() => {
              // navigate('AvailabilitySetup', {
              //   type: 'Select',
              // })
              handleContinue();
            }}
            angle={60}
          />
        </View>
      </View>

      <LanguagePicker
        visible={languageIsVisible}
        onClose={() => setLanguageIsVisible(false)}
        selected={languages}
        data={languageListResponse}
        onSelect={lang => setLanguages(lang)}
        containerStyle={{
          height: normalize(280),
        }}
      />
      <ExpertisePicker
        visible={expertiseIsVisible}
        onClose={() => setExpertiseIsVisible(false)}
        selected={expertise}
        data={areaOfExpertiseListResponse}
        onSelect={lang => setExpertise(lang)}
        containerStyle={{
          height: normalize(280),
        }}
      />

      {/* <CustomImagePicker
        visible={imageIsVisible}
        onClose={() => setImageIsVisible(false)}
        onSelect={(img: { uri: string; name: string; type?: string }) => {
          if (imagePickerData.type === 'doc') {
            setCertificateList(prev =>
              prev.map((item, i) =>
                i === imagePickerData.index
                  ? {
                      ...item,
                      expire_date: '',
                      image: {
                        name: img?.name || '',
                        type: img?.type || 'image/jpeg',
                        uri: img?.uri || '',
                      },
                    }
                  : item,
              ),
            );
            setImagePickerData({ index: 0, type: 'doc' });
          } else if (imagePickerData.type === 'id') {
            setIdentificationList(prev =>
              prev.map((item, i) =>
                i === imagePickerData.index
                  ? {
                      name: img?.name || '',
                      uri: img?.uri || '',
                      type: img?.type || 'image/jpeg',
                    }
                  : item,
              ),
            );
            setImagePickerData({ index: 0, type: 'id' });
          } else if (imagePickerData.type === 'w9') {
            setW99FormData({
              name: img?.name || '',
              uri: img?.uri || '',
              type: img?.type || 'image/jpeg',
            });
            setImagePickerData({ index: 0, type: 'w9' });
          }
          setImageIsVisible(false);
        }}
      /> */}

      <CustomImageFilePicker
        visible={imageIsVisible}
        onClose={() => setImageIsVisible(false)}
        onSelect={(_, __, file) => {
          console.log('file is ===>', file);
          if (!file) return;

          setIdentificationList(prev =>
            prev.map((item, i) =>
              i === imagePickerData.index
                ? {
                    name: file?.name || '',
                    uri: file?.uri || '',
                    type: file?.type || 'image/jpeg',
                  }
                : item,
            ),
          );
          setImagePickerData({ index: 0, type: 'id' });
        }}
      />
    </KeyboardAvoidingTemplate>
  );
};

export default ProfileSetup;

const styles = StyleSheet.create({
  container: { paddingBottom: normalize(45) },
  main: { flex: 1, backgroundColor: Colors.white },
  background: { width: '100%', height: normalize(300), position: 'absolute' },
  v: { paddingHorizontal: normalize(15) },
  logoRowContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: normalize(40),
    alignItems: 'center',
    marginTop: normalize(30),
  },
  logo: {
    height: normalize(40),
    width: normalize(40),
    resizeMode: 'contain',
  },
  exitContainer: {
    width: normalize(25),
    height: normalize(25),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.hawkes_blue,
    borderRadius: normalize(25),
  },
  exit: {
    height: '70%',
    width: '70%',
    resizeMode: 'contain',
  },
  title: {
    fontSize: normalize(18),
    color: Colors.night_blue,
    fontFamily: Fonts.Manrope_Regular,
    marginTop: normalize(10),
  },
  v1: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: normalize(15),
    borderTopRightRadius: normalize(15),
    marginTop: normalize(160),
    alignItems: 'center',
    paddingTop: normalize(5),
  },
  backgroundHeader: {
    width: '100%',
    height: normalize(50),
    resizeMode: 'contain',
    top: normalize(-12),
    position: 'absolute',
  },
  divider: {
    backgroundColor: '#E8E8E8',
    height: normalize(1),
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(15),
    marginBottom: normalize(12),
  },
  orText: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dark_grey,
    fontSize: normalize(10),
    position: 'absolute',
    backgroundColor: Colors.white,
    paddingHorizontal: normalize(8),
  },
  section: { width: '90%', marginBottom: normalize(2) },
  label: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(13),
    marginTop: normalize(6),
  },
  v2: {
    borderRadius: moderateScale(12),
    paddingHorizontal: horizontalScale(10),
    alignItems: 'center',
    backgroundColor: Colors.white_lilae,
    width: '100%',
    borderColor: Colors.white_chalk,
    borderWidth: normalize(1.5),
    marginTop: moderateScale(7),
    paddingBottom: normalize(2),
    paddingTop: normalize(6),
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(8),
    marginTop: moderateScale(7),
    minHeight: normalize(60),
    alignSelf: 'flex-start',
  },
  chip: {
    backgroundColor: Colors.white,
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(5),
    borderRadius: normalize(15),
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    color: Colors.night_blue,
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(9),
  },
  chipClose: {
    height: normalize(12),
    width: normalize(12),
    tintColor: Colors.night_blue,
    right: normalize(-5),
  },
  chipCloseLg: {
    height: normalize(15),
    width: normalize(15),
    tintColor: Colors.night_blue,
    marginLeft: normalize(5),
  },
  languageBox: {
    borderRadius: moderateScale(12),
    alignItems: 'center',
    backgroundColor: Colors.white_lilae,
    width: '100%',
    borderColor: Colors.white_chalk,
    borderWidth: normalize(1.5),
    marginTop: moderateScale(7),
    minHeight: normalize(46),
    flexDirection: 'row',
  },
  chipWrapper: {
    width: '85%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(8),
    paddingVertical: normalize(6),
    paddingHorizontal: horizontalScale(10),
  },
  dropdownIcon: {
    tintColor: Colors.night_blue,
    width: normalize(13),
    height: normalize(13),
    resizeMode: 'contain',
  },
  touch: {
    height: normalize(45),
    justifyContent: 'center',
    alignItems: 'center',
    width: normalize(45),
  },
  uploadBox: {
    backgroundColor: Colors.magnolia,
    padding: normalize(12),
    width: '90%',
    borderRadius: normalize(12),
    marginTop: normalize(10),
    marginBottom: normalize(5),
  },
  uploadTitle: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(12),
  },
  logoContainer: { width: '100%' },
  logoView: {
    borderWidth: normalize(1),
    borderStyle: 'dashed',
    borderColor: Colors.hawkes_blue,
    height: normalize(115),
    borderRadius: normalize(8),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(8),
    marginBottom: normalize(5),
  },
  imageView: {
    borderWidth: normalize(1),
    borderStyle: 'dashed',
    borderColor: Colors.hawkes_blue,
    height: normalize(115),
    borderRadius: normalize(8),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(8),
    marginBottom: normalize(5),
    overflow: 'hidden',
  },
  backup: {
    height: normalize(35),
    width: normalize(35),
    resizeMode: 'contain',
  },
  title1: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.purple,
    fontSize: normalize(12),
    textDecorationLine: 'underline',
    marginTop: normalize(10),
  },
  title2: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dust,
    fontSize: normalize(9),
    marginTop: normalize(8),
  },
  addMore: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.night_blue,
    fontSize: normalize(11),
  },
  addMoreContainer: { paddingVertical: normalize(5), alignSelf: 'flex-start' },
  imageDeleteContainer: {
    height: normalize(20),
    width: normalize(20),
    backgroundColor: Colors.white,
    position: 'absolute',
    top: normalize(10),
    left: normalize(10),
    borderRadius: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  horrizontalLine: {
    height: normalize(1),
    width: '100%',
    backgroundColor: Colors.lilac,
    marginVertical: normalize(5),
  },
  deleteButton: {
    width: normalize(70),
    height: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.aztec_purple,
    zIndex: 100,
    alignSelf: 'flex-end',
    borderRadius: normalize(10),
    flexDirection: 'row',
    gap: normalize(3),
  },
  deleteIcon: {
    height: normalize(15),
    width: normalize(15),
    objectFit: 'contain',
  },
  deleteText: {
    color: Colors.white,
    fontFamily: Fonts.DMSans_SemiBold,
    fontSize: normalize(10),
  },
  placeholderStyle: {
    fontSize: normalize(12),
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dust,
  },
  input: {
    width: '100%',
    height: normalize(45),
    borderColor: Colors.white_chalk,
    borderWidth: normalize(1.2),
    paddingLeft: normalize(10),
    borderRadius: normalize(10),
    fontSize: normalize(13),
    backgroundColor: Colors.white_lilae,
    color: Colors.night_blue,
  },
  inputContainer: {
    width: '90%',
  },
  streetAddressLabel: {
    textAlign: 'left',
    alignSelf: 'flex-start',
    fontFamily: Fonts.DMSans_SemiBold,
    color: Colors.night_blue,
    fontSize: normalize(13),
    marginTop: normalize(10),
    marginBottom: normalize(3),
    marginLeft: normalize(15),
  },
  rightIconContainer: {
    position: 'absolute',
    right: 10,
    justifyContent: 'center',
    height: '100%',
  },
  rightIcon: {
    width: 20,
    height: 20,
    tintColor: '#777',
  },
});
