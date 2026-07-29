/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import KeyboardAvoidingTemplate from '@app/components/template/KeyboardAvoidingTemplate';
import {
  horizontalScale,
  moderateScale,
  normalize,
} from '@app/utils/orientation';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import Button from '@app/components/common/Button';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { goBack, navigate } from '@app/navigation/RootNaivgation';
import { isIos, validEIN, validSSN } from '@app/utils/helpers/Validation';
import TextInput from '@app/components/common/TextInput';
import Selection from '@app/components/common/Selection';
import LanguagePicker, {
  languageInterface,
} from '@app/components/template/LanguagePicker';
import { useAppDispatch, useAppSelector } from '@app/store';
import { useIsFocused } from '@react-navigation/native';
import ExpertisePicker, {
  expertiseInterface,
} from '@app/components/template/ExpertisePicker';
import Css from '@app/themes/Css';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import CustomImagePicker from '@app/components/common/CustomImagePicker';
import { showMessage } from '@app/utils/helpers/Toast';
import { IMAGES_BUCKET_URL } from '@app/utils/constants';
import {
  deleteDocumentRequest,
  profileUpdateRequest,
  resetAuthDefaults,
} from '@app/store/slice/auth.slice';
import { getFileFromLocal } from '@app/utils/helpers/FileActions';
import CustomImageFilePicker from '@app/components/common/CustomImageFilePicker';
import { formatPhoneNumber } from '@app/utils/helpers';
import PlacesAutocompleteInput from '@app/components/common/PlaceAutocompleteInput';

// Fixed interfaces with proper typing
interface CertificateDocument {
  _id?: string;
  certificate_document?: string;
  certificate_expiration_date?: string;
  // Add other properties as needed
}

interface IdentityProof {
  _id?: string;
  identity_proof?: string;
  // Add other properties as needed
}

type ProfileSetupProps = {
  logo: any;
  profile_image?: any;
  fullname: string;
  email: string;
  phone: string;
  street_address: string;
  ssn: string;
  ein: string;
  about_me: string;
  preferred_gender: string;
  business_name: string;
  certificates: CertificateDocument[];
  identity_proofs: IdentityProof[];
  w9Form: string;
};

interface ProfileData {
  full_name: string;
  address: string;
  email: string;
  phone: string;
  profile_image: string;
  gender: string;
  areas_of_expertise: expertiseInterface[];
  languages: languageInterface[];
  social_security_number: string;
  ein: string;
  objectives: string;
  identity_proofs: IdentityProof[];
  certificate_documents: CertificateDocument[];
  w9Form: string;
}

// Fixed certificate item interface
interface CertificateItem {
  image: { uri: string; name: string; type: string };
  expire_date: string;
  _id?: string;
}

// Fixed identification item interface
interface IdentificationItem {
  uri: string;
  name: string;
  type: string;
  _id?: string;
}

const ProfileSetup = () => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const profileDetails: ProfileData = useAppSelector(
    state => state.auth.profileDetailsResponse,
  );
  const { languageListResponse, areaOfExpertiseListResponse } = useAppSelector(
    state => state.default,
  );
  const { status, isLoading } = useAppSelector(state => state.auth);

  // Initialize info state with proper fallbacks
  const [info, setInfo] = useState<ProfileSetupProps>({
    profile_image: null,
    email: profileDetails?.email || '',
    fullname: profileDetails?.full_name || '',
    phone: profileDetails?.phone || '',
    logo: null,
    street_address: profileDetails?.address || '',
    ssn: profileDetails?.social_security_number || '',
    ein: profileDetails?.ein || '',
    about_me: profileDetails?.objectives || '',
    preferred_gender: profileDetails?.gender || '',
    business_name: '',
    certificates: profileDetails?.certificate_documents || [],
    identity_proofs: profileDetails?.identity_proofs || [],
    w9Form: profileDetails?.w9Form || '',
  });

  const [languageIsVisible, setLanguageIsVisible] = useState(false);
  const [expertiseIsVisible, setExpertiseIsVisible] = useState(false);
  const [expertise, setExpertise] = useState<expertiseInterface[]>(
    profileDetails?.areas_of_expertise || [],
  );
  const [languages, setLanguages] = useState<languageInterface[]>(
    profileDetails?.languages || [],
  );

  // Initialize certificate list from info.certificates
  const initializeCertificateList = (): CertificateItem[] => {
    if (
      profileDetails?.certificate_documents &&
      profileDetails?.certificate_documents?.length > 0
    ) {
      return profileDetails?.certificate_documents?.map((cert: any) => ({
        expire_date: cert?.expiration_date?.slice(0, 10) || '',
        image: {
          name: cert?.document || '',
          type: ['jpg', 'jpeg', 'png', 'gif'].includes(
            cert?.document?.split('.').pop()?.toLowerCase(),
          )
            ? 'image/jpeg'
            : 'application/pdf',
          uri: cert?.document
            ? `${IMAGES_BUCKET_URL.certificates}${cert?.document}`
            : '',
        },
        _id: cert?._id,
      }));
    }
    return [{ expire_date: '', image: { name: '', type: '', uri: '' } }];
  };

  // Initialize identification list from info.identity_proofs
  const initializeIdentificationList = (): IdentificationItem[] => {
    if (
      profileDetails?.identity_proofs &&
      profileDetails?.identity_proofs?.length > 0
    ) {
      return profileDetails?.identity_proofs?.map((proof, i) => ({
        name: proof || '',
        type: ['jpg', 'jpeg', 'png', 'gif'].includes(
          proof?.split('.').pop()?.toLowerCase(),
        )
          ? 'image/jpeg'
          : 'application/pdf',
        uri: proof ? `${IMAGES_BUCKET_URL.identitities}${proof}` : '',
        _id: i,
      }));
    }
    return [{ name: '', type: '', uri: '' }];
  };

  const initializeW9Form = (): { uri: string; name: string; type: string } => {
    if (profileDetails?.w9Form) {
      return {
        uri: `${IMAGES_BUCKET_URL.w9Form}${profileDetails?.w9Form}`,
        name: profileDetails?.w9Form || '',
        type: ['jpg', 'jpeg', 'png', 'gif'].includes(
          profileDetails?.w9Form?.split('.')?.pop()?.toLowerCase(),
        )
          ? 'image/jpeg'
          : 'application/pdf',
      };
    }
    return { uri: '', name: '', type: '' };
  };

  const [certificateList, setCertificateList] = useState<CertificateItem[]>([]);
  const [w99FormData, setW99FormData] = useState<{
    uri: string;
    name: string;
    type: string;
  }>({ name: '', type: '', uri: '' });

  const [identificationList, setIdentificationList] = useState<
    IdentificationItem[]
  >([]);

  const [profileImg, setProfileImg] = useState<{
    uri: string;
    name: string;
    type: string;
  }>({ name: '', type: '', uri: '' });

  const [imageIsVisible, setImageIsVisible] = useState<boolean>(false);
  const [imageModalIsVisible, setImageModalIsVisible] =
    useState<boolean>(false);
  const [dateVisibleId, setDateVisibleId] = useState<number | null>(null);
  const [imagePickerData, setImagePickerData] = useState<{
    type: 'doc' | 'id' | 'image' | 'w9';
    index: number;
  }>({
    type: 'doc',
    index: 0,
  });

  // Update states when profile details change
  useEffect(() => {
    if (profileDetails) {
      const updatedInfo = {
        profile_image: null,
        email: profileDetails?.email || '',
        fullname: profileDetails?.full_name || '',
        phone: profileDetails?.phone || '',
        logo: null,
        street_address: profileDetails?.address || '',
        ssn: profileDetails?.social_security_number || '',
        ein: profileDetails?.ein || '',
        about_me: profileDetails?.objectives || '',
        preferred_gender: profileDetails?.gender || '',
        business_name: '',
        certificates: profileDetails?.certificate_documents || [],
        identity_proofs: profileDetails?.identity_proofs || [],
        w9Form: profileDetails?.w9Form || '',
      };

      setInfo(updatedInfo);
      setExpertise(profileDetails?.areas_of_expertise || []);
      setLanguages(profileDetails?.languages || []);
    }
  }, [profileDetails]);

  // Initialize lists when info changes
  useEffect(() => {
    setCertificateList(initializeCertificateList());
    setIdentificationList(initializeIdentificationList());
    setW99FormData(initializeW9Form());
    setProfileImg({
      name: '',
      type: '',
      uri: profileDetails?.profile_image
        ? IMAGES_BUCKET_URL.profile + profileDetails?.profile_image
        : '',
    });
  }, [
    info.certificates,
    info.identity_proofs,
    info.w9Form,
    info.profile_image,
  ]);

  const updateValue = (field: keyof ProfileSetupProps, value: string) => {
    setInfo(prev => ({ ...prev, [field]: value }));
  };

  console.log('identificationList', identificationList);

  useEffect(() => {
    if (isFocused) {
      switch (status) {
        case 'auth/profileUpdateSuccess': {
          navigate('Success', {
            type: 'ProfileSave',
            title: 'Profile ',
            title1: 'Saved',
            subTitle: 'Successfully',
          });
          dispatch(resetAuthDefaults());
          break;
        }
        case 'auth/profileUpdateFailure': {
          dispatch(resetAuthDefaults());
          break;
        }
      }
    }
  }, [status]);

  const getDeletedIdentityProofs = (
    serverList: string[],
    currentList: any[],
  ) => {
    const currentNames = currentList
      .filter(item => item?.uri)
      .map(item => item.name);

    return serverList.filter(name => !currentNames.includes(name));
  };

  const getDeletedCertificates = (serverList: any[], currentList: any[]) => {
    return serverList.filter(serverItem => {
      const exists = currentList.some(
        item => item?._id === serverItem._id && item?.image?.uri,
      );
      return !exists;
    });
  };

  const handleSave = () => {
    const deletedIdentityProofs = getDeletedIdentityProofs(
      profileDetails.identity_proofs,
      identificationList,
    );

    const deletedCertificates = getDeletedCertificates(
      profileDetails.certificate_documents,
      certificateList,
    );

    deletedIdentityProofs.forEach(fileName => {
      dispatch(
        deleteDocumentRequest({
          type: 'identity_proofs',
          value: fileName,
        }),
      );
    });

    deletedCertificates.forEach(cert => {
      dispatch(
        deleteDocumentRequest({
          type: 'certificate_documents',
          value: cert._id,
        }),
      );
    });

    console.log('certification===>', certificateList);
    if (!info.fullname) {
      showMessage('Full Name is required.');
      // } else if (!info.phone) {
      // showMessage('Phone is Required');
      // } else if (!isValidPhoneNumber(info.phone)) {
      // showMessage('Phone Number is not valid');
    } else if (!info.preferred_gender) {
      showMessage('Gender is Required');
    } else if (!info.ssn && !info.ein) {
      showMessage('EIN or SSN is required.');
    } else if (info.ssn && !validSSN(info.ssn)) {
      showMessage('Invalid SSN provided');
    } else if (info.ein && !validEIN(info.ein)) {
      showMessage('Invalid EIN provided');
    } else if (expertise.length === 0) {
      showMessage('Please add expertise');
    } else if (languages.length === 0) {
      showMessage('Please add language');
    } else if (!info.street_address) {
      showMessage('Please add address');
    } else if (!info.about_me) {
      showMessage('Please add your description');
    } else if (
      certificateList.some(item => item.image?.uri && !item.expire_date)
    ) {
      showMessage('Please add or complete expiry date and certificate.');
    } else if (!identificationList.every(item => item.uri)) {
      showMessage('Please add or complete identification card.');
    } else {
      const payload = new FormData();
      payload.append('full_name', info.fullname);
      payload.append('objectives', info.about_me);
      payload.append('phone', info.phone);
      payload.append('gender', info.preferred_gender);
      payload.append('ein', info.ein);
      payload.append('social_security_number', info.ssn);
      payload.append('address', info.street_address);

      // Only send profile_image when the user picked a NEW local file. When the
      // photo is unchanged, profileImg.uri holds the existing S3 URL (http...),
      // which is not a valid file part and would error/clear the image on save.
      if (profileImg.uri && !profileImg.uri.startsWith('http')) {
        payload.append('profile_image', profileImg as any);
      }

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

      if (certificateList?.length === 1) {
        if (certificateList[0]?.image?.uri === '') {
          payload.append('certificate_documents', [] as any);
        }
      }

      certificateList?.forEach(item => {
        if (item?.image?.uri !== '') {
          payload.append('certificate_expiration_date', item?.expire_date);
        }
      });

      if (w99FormData.uri) {
        payload.append('w9Form', w99FormData as any);
      }

      console.log('certificate list==>', certificateList);

      console.log('payload inupdate==>', payload);

      // dispatch(
      //   deleteDocumentRequest({
      //     certificate_documents: '',
      //     identity_proofs: '',
      //   }),
      // );

      dispatch(profileUpdateRequest(payload));
    }
  };

  console.log('profile image==>', profileImg);

  return (
    <KeyboardAvoidingTemplate
      contentContainerStyle={styles.container}
      loaderEnable={isLoading}
    >
      <View style={styles.main}>
        <ImageBackground source={Images.top_shape} style={styles.background}>
          <MyStatusBar
            backgroundColor="transparent"
            barStyle="dark-content"
            translucent
          />
          <View style={styles.v}>
            <TouchableOpacity onPress={goBack} style={styles.backContainer}>
              <Image source={Icons.arrow_right} style={styles.arrow_right} />
            </TouchableOpacity>
            <Text style={styles.title}>
              Edit{' '}
              <Text style={{ fontFamily: Fonts.Manrope_SemiBold }}>
                Profile
              </Text>
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.v1}>
          <Image
            source={Images.backgroundHeader}
            style={styles.backgroundHeader}
          />
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              <Image
                source={
                  profileImg.uri
                    ? profileImg
                    : profileDetails?.profile_image === '' ||
                      profileDetails?.profile_image === null ||
                      profileDetails?.profile_image === undefined
                    ? Icons.icon_user
                    : {
                        uri:
                          IMAGES_BUCKET_URL.profile +
                          profileDetails?.profile_image,
                      }
                }
                style={styles.profileImage}
                tintColor={
                  profileDetails?.profile_image === '' ||
                  profileDetails?.profile_image === null ||
                  profileDetails?.profile_image === undefined
                    ? Colors.melrose
                    : undefined
                }
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.profileImageEditContainer}
              onPress={() => {
                setImageIsVisible(true);
                setImagePickerData({ type: 'image', index: 0 });
              }}
            >
              <Image source={Icons.edit} style={styles.profileImageEdit} />
            </TouchableOpacity>
          </View>

          <TextInput
            title="Full Name"
            value={info.fullname}
            onChangeText={txt => updateValue('fullname', txt)}
            placeholder="Enter full name"
          />
          <TextInput
            title="Email"
            value={info.email}
            onChangeText={txt => updateValue('email', txt)}
            placeholder="Enter email"
            keyboardType="email-address"
            editable={false}
          />
          <TextInput
            title="Phone"
            value={formatPhoneNumber(info?.phone)}
            onChangeText={txt => updateValue('phone', txt)}
            placeholder="Enter phone"
            editable={false}
          />
          <TextInput
            title="Social Security Number"
            value={info.ssn}
            onChangeText={txt => updateValue('ssn', txt)}
            placeholder="Enter SSN"
          />
          <TextInput
            title="EIN"
            value={info.ein}
            onChangeText={txt => updateValue('ein', txt)}
            placeholder="Enter EIN"
          />

          <View style={styles.section}>
            <Text style={[styles.label]}>Area of Expertise</Text>
            <View style={styles.languageBox}>
              <View style={styles.chipWrapper}>
                {expertise.length > 0 ? (
                  expertise.map((item: any, i) => (
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
                    E.g. English, Spanish
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
                  languages.map((item: any, i) => (
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

          {/* <GoogleAutoInput
            title="Address"
            value={info.street_address}
            onChangeText={txt => updateValue('street_address', txt)}
            placeholder="Enter address"
          /> */}
          <Text style={styles.streetAddressLabel}>Address</Text>
          <PlacesAutocompleteInput
            placeholder="Enter address"
            defaultAddress={info.street_address} // Pre-fill with existing value
            onLocationSelect={async (data: any, details = null) => {
              console.log('data', data, details);
              // const place = {
              //   name: data.description,
              //   lat: details?.geometry.location.lat,
              //   lng: details?.geometry.location.lng,
              // };

              updateValue('street_address', data?.description);
            }}
          />

          <Selection
            title="Gender"
            value={info.preferred_gender}
            placeholder="Select gender"
            options={[
              { label: 'Male' },
              { label: 'Female' },
              { label: 'Choose not to disclose' },
            ]}
            onChange={val => updateValue('preferred_gender', val.label)}
          />

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
              console.log('item in certificates===>', item);
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
                                          type: files[0]?.path?.type,
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
                      certificateList.length > 1 &&
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
                          //               type: files[0]?.path?.type,
                          //             }
                          //           : itm,
                          //       ),
                          //     );
                          //   },
                          // });
                          setImageModalIsVisible(true);
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
                      identificationList.length === 1 &&
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
                            type: files[0]?.path?.type,
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

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={goBack}
              width="47.5%"
              colors={[Colors.white, Colors.white]}
              textColor={Colors.purple}
              elevation={0}
              shadowOpacity={0}
            />
            <Button
              title="Save"
              onPress={() => handleSave()}
              width="47.5%"
              angle={60}
            />
          </View>
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
      <CustomImagePicker
        visible={imageIsVisible}
        onClose={() => setImageIsVisible(false)}
        onSelect={(img: { uri: string; name: string; type: string }) => {
          if (imagePickerData.type === 'doc') {
            setCertificateList(prev =>
              prev.map((item, i) =>
                i === imagePickerData.index
                  ? {
                      ...item,
                      expire_date: item.expire_date, // Keep existing expiry date
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
                      type: img?.type || 'image/jpeg',
                      uri: img?.uri || '',
                    }
                  : item,
              ),
            );
            setImagePickerData({ index: 0, type: 'id' });
          } else if (imagePickerData.type === 'image') {
            setProfileImg({
              name: img?.name || '',
              type: img?.type || 'image/jpeg',
              uri: img?.uri || '',
            });
            setImagePickerData({ index: 0, type: 'image' });
          } else if (imagePickerData.type === 'w9') {
            console.log('w9 img===>', img);
            setW99FormData({
              name: img?.name || '',
              type: img?.type || 'image/jpeg',
              uri: img?.uri || '',
            });
            setImagePickerData({ index: 0, type: 'w9' });
          }
          setImageIsVisible(false);
        }}
      />

      <CustomImageFilePicker
        visible={imageModalIsVisible}
        onClose={() => setImageModalIsVisible(false)}
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
  container: {
    paddingBottom: normalize(45),
  },
  main: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  background: {
    width: '100%',
    height: normalize(300),
    position: 'absolute',
  },
  v: {
    paddingHorizontal: normalize(15),
  },
  backContainer: {
    height: normalize(35),
    width: normalize(35),
    marginTop: normalize(isIos() ? 10 : 26),
    backgroundColor: Colors.white,
    borderRadius: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.dark_grey,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  arrow_right: {
    height: normalize(22),
    width: normalize(22),
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
  buttonContainer: {
    marginTop: normalize(8),
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
  },
  avatar: {
    width: normalize(72),
    height: normalize(72),
    borderWidth: normalize(2),
    borderColor: Colors.white,
    marginTop: normalize(10),
    marginBottom: normalize(18),
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },

  backup: {
    height: normalize(18),
    width: normalize(18),
    resizeMode: 'contain',
  },
  title1: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.purple,
    fontSize: normalize(12),
    textDecorationLine: 'underline',
    marginTop: normalize(15),
  },
  title2: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dust,
    fontSize: normalize(9),
    marginTop: normalize(8),
  },
  section: { width: '90%', marginBottom: normalize(2) },
  label: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(13),
    marginTop: normalize(6),
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
    backgroundColor: '#F8F4FF',
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
  logoContainer1: { width: '100%' },
  logoView1: {
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
  addMore: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.night_blue,
    fontSize: normalize(11),
  },
  addMoreBtn: {
    paddingVertical: normalize(5),
    alignSelf: 'flex-start',
  },
  placeholderStyle: {
    fontSize: normalize(12),
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dust,
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
  profileImageContainer: {
    width: normalize(80),
    height: normalize(80),
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: normalize(20),
  },
  profileImageWrapper: {
    width: normalize(80),
    height: normalize(80),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(80),
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: normalize(2),
    borderColor: Colors.lilac,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileImageEditContainer: {
    width: normalize(22),
    height: normalize(22),
    backgroundColor: Colors.white,
    borderRadius: normalize(22),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.dark_grey,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    bottom: normalize(-3),
    right: normalize(7),
    elevation: 4,
    position: 'absolute',
  },
  profileImageEdit: {
    width: normalize(12),
    height: normalize(12),
  },
  streetAddressLabel: {
    textAlign: 'left',
    alignSelf: 'flex-start',
    fontFamily: Fonts.DMSans_SemiBold,
    color: Colors.night_blue,
    fontSize: normalize(13),
    marginBottom: normalize(3),
    marginLeft: normalize(15),
    marginTop: normalize(10),
  },
});
