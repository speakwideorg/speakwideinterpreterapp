/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect } from 'react';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import Header from '@app/components/common/Header';
import { normalize } from '@app/utils/orientation';
import { navigate } from '@app/navigation/RootNaivgation';
import { useAppDispatch, useAppSelector } from '@app/store';
import { useIsFocused } from '@react-navigation/native';
import { IMAGES_BUCKET_URL } from '@app/utils/constants';
import { profileDetailsRequest } from '@app/store/slice/auth.slice';
// import { SaveToGallery } from '@app/utils/helpers';
import moment from 'moment';
import Css from '@app/themes/Css';
import { downloadFile } from '@app/utils/helpers/FileActions';
import { formatPhoneNumber } from '@app/utils/helpers';
import { maskSSN, maskEIN } from '@app/utils/helpers/DataFormat';

const { width } = Dimensions.get('screen');

interface ProfileData {
  full_name: string;
  address: string;
  email: string;
  phone: string;
  profile_image: string;
  gender: string;
  areas_of_expertise: Array<object>;
  languages: Array<object>;
  social_security_number?: string;
  ssn_last4?: string;
  ein?: string;
  ein_last4?: string;
  objectives: string;
  identity_proofs: Array<object>;
  certificate_documents: Array<object>;
  createdAt: string;
  w9Form: string;
}

const ICON_SIZE = normalize(40);
const RADIUS_CARD = normalize(16);

type LabeledRowProps = {
  icon: any;
  label?: string;
  value: string;
};

const IconBox = ({ name }: { name: any }) => (
  <View style={styles.iconBox}>
    <Image
      source={name}
      style={{
        height: normalize(22),
        width: normalize(22),
        tintColor: Colors.white,
      }}
    />
  </View>
);

const Row = ({ icon, value }: { icon: string; value: string }) => (
  <View style={styles.row}>
    <IconBox name={icon} />
    <Text numberOfLines={0} style={styles.rowValue}>
      {value}
    </Text>
  </View>
);

const LabeledRow = ({ icon, label, value }: LabeledRowProps) => (
  <View style={styles.row}>
    <IconBox name={icon} />
    <View style={Css.f1}>
      {!!label && <Text style={styles.rowLabel}>{label}</Text>}
      <Text numberOfLines={1} style={styles.rowValue}>
        {value}
      </Text>
    </View>
  </View>
);

const Profile = () => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const profileDetails: ProfileData = useAppSelector(
    state => state.auth.profileDetailsResponse,
  );

  const fetchProfileDetails = () => {
    dispatch(profileDetailsRequest());
  };

  useEffect(() => {
    if (isFocused) {
      fetchProfileDetails();
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <Image
        source={Images.top_shape}
        resizeMode="contain"
        style={styles.topShape}
      />
      <MyStatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />
      <Header />

      <View style={styles.contentWrapper}>
        <Image
          source={Images.backgroundHeader}
          style={styles.backgroundHeader}
        />
        <View style={styles.profileImageWrapper}>
          <Image
            source={
              profileDetails?.profile_image === '' ||
              profileDetails?.profile_image === null ||
              profileDetails?.profile_image === undefined
                ? Icons.icon_user
                : {
                    uri:
                      IMAGES_BUCKET_URL.profile + profileDetails?.profile_image,
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
        <View
          style={{
            paddingHorizontal: normalize(15),
            marginTop: normalize(50),
            marginBottom: normalize(10),
          }}
        >
          <Text style={styles.name}>{profileDetails?.full_name}</Text>
          <Text style={styles.joined}>
            Joined since {moment(profileDetails?.createdAt)?.format('YYYY')}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.editBtn}
          onPress={() => navigate('EditProfile')}
        >
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: normalize(30) }}
        >
          {/* Personal */}
          <Text style={styles.sectionTitle}>Personal</Text>
          <View style={styles.card}>
            <Row
              icon={Icons.email}
              value={profileDetails?.email ? profileDetails?.email : 'N/A'}
            />
            <Row
              icon={Icons.call}
              value={
                profileDetails?.phone
                  ? formatPhoneNumber(profileDetails?.phone)
                  : 'N/A'
              }
            />
            <Row
              icon={Icons.distance}
              value={profileDetails?.address ? profileDetails?.address : 'N/A'}
            />
            <Row
              icon={Icons.transgender}
              value={profileDetails?.gender ? profileDetails?.gender : 'N/A'}
            />
          </View>

          {/* Business Information */}
          <Text style={styles.sectionTitle}>Business Information</Text>
          <View
            style={[
              styles.card,
              { gap: normalize(18), paddingVertical: normalize(13) },
            ]}
          >
            {/* SSN and EIN are masked to the last 4 digits. Interpreters stay
                permanently signed in to receive session notifications, so a full
                SSN on screen is readable by anyone with the unlocked device. */}
            <LabeledRow
              icon={Icons.admin_panel_settings}
              label="Social Security Number"
              value={maskSSN(
                profileDetails?.social_security_number || profileDetails?.ssn_last4,
              )}
            />
            <LabeledRow
              icon={Icons.frame_person}
              label="EIN"
              value={maskEIN(profileDetails?.ein || profileDetails?.ein_last4)}
            />
            <LabeledRow
              icon={Icons.person_play}
              label="Area of Expertise"
              value={
                profileDetails?.areas_of_expertise
                  ? profileDetails?.areas_of_expertise
                      ?.map((itm: any) => itm.expertise_display_name)
                      .join(',')
                  : 'N/A'
              }
            />
            <LabeledRow
              icon={Icons.g_translate}
              label="Supported Language"
              value={
                profileDetails?.languages
                  ? profileDetails?.languages
                      ?.map((itm: any) => itm.language_display_name)
                      .join(',')
                  : 'N/A'
              }
            />
          </View>

          <Text style={styles.sectionTitle}>About Me</Text>
          <View style={[styles.card]}>
            <Text style={styles.about}>
              {profileDetails?.objectives ? profileDetails?.objectives : 'N/A'}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>CERTIFICATES / DOCUMENTS</Text>
          <View style={[styles.card]}>
            {profileDetails?.certificate_documents?.map((item: any, i) => {
              const docName = typeof item === 'string' ? item : item?.document || item?.name || '';
              if (!docName) return null;
              return (
                <View key={i} style={styles.fileCard}>
                  <View style={[Css.fdr, Css.aic]}>
                    <Image
                      source={Icons.picture_as_pdf}
                      style={{
                        height: normalize(20),
                        width: normalize(20),
                      }}
                    />
                    <Text style={styles.fileName}>{docName}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      downloadFile({
                        fileUrl: `${IMAGES_BUCKET_URL.certificates}${docName}`,
                        fileName: docName,
                      })
                    }
                  >
                    <Image
                      source={Icons.file_save}
                      style={{
                        height: normalize(20),
                        width: normalize(20),
                      }}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>
            Driver License / Identification Card
          </Text>
          <View style={[styles.card]}>
            {profileDetails?.identity_proofs?.map((item: any, i) => {
              const docName = typeof item === 'string' ? item : item?.document || item?.uri || item?.name || '';
              if (!docName) return null;
              return (
                <View key={i} style={styles.fileCard}>
                  <View style={[Css.fdr, Css.aic]}>
                    <Image
                      source={Icons.photo_library}
                      style={{
                        height: normalize(20),
                        width: normalize(20),
                      }}
                    />
                    <Text style={styles.fileName}>{docName}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      downloadFile({
                        fileUrl: `${IMAGES_BUCKET_URL.identitities}${docName}`,
                        fileName: docName,
                      })
                    }
                  >
                    <Image
                      source={Icons.file_save}
                      style={{
                        height: normalize(20),
                        width: normalize(20),
                      }}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>w9 Form</Text>
          <View style={[styles.card]}>
            {profileDetails?.w9Form ? (
              <View style={styles.fileCard}>
                <View style={[Css.fdr, Css.aic]}>
                  <Image
                    source={Icons.photo_library}
                    style={{
                      height: normalize(20),
                      width: normalize(20),
                    }}
                  />
                  <Text style={styles.fileName}>{profileDetails?.w9Form}</Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    // SaveToGallery(
                    //   `${IMAGES_BUCKET_URL.w9Form}${profileDetails?.w9Form}`,
                    //   profileDetails?.w9Form,
                    // )
                    downloadFile({
                      fileUrl: `${IMAGES_BUCKET_URL.w9Form}${profileDetails?.w9Form}`,
                      fileName: profileDetails?.w9Form,
                    })
                  }
                >
                  <Image
                    source={Icons.file_save}
                    style={{
                      height: normalize(20),
                      width: normalize(20),
                    }}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.fileName}>N/A</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ceramic,
  },
  topShape: {
    height: normalize(340),
    width,
    position: 'absolute',
    top: 0,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: Colors.white,
    marginTop: normalize(55),
    borderTopLeftRadius: normalize(20),
    borderTopRightRadius: normalize(20),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    paddingTop: normalize(15),
  },
  backgroundHeader: {
    width: '100%',
    height: normalize(50),
    resizeMode: 'contain',
    top: normalize(-12),
    position: 'absolute',
  },
  avatar: {
    width: normalize(72),
    height: normalize(72),
    borderRadius: normalize(36),
    borderWidth: normalize(2),
    borderColor: Colors.white,
    position: 'absolute',
    left: normalize(25),
    top: normalize(-28),
  },
  name: {
    fontFamily: Fonts.Inter_SemiBold,
    fontSize: normalize(15),
    color: Colors.night_blue,
  },
  joined: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(10),
    color: '#3A3A3A',
  },
  editBtn: {
    backgroundColor: '#F4EEFF',
    right: normalize(15),
    top: normalize(16),
    paddingHorizontal: normalize(18),
    paddingVertical: normalize(8),
    borderRadius: normalize(8),
    alignSelf: 'flex-end',
    position: 'absolute',
  },
  editBtnText: {
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(12),
    color: Colors.purple,
  },
  sectionTitle: {
    paddingHorizontal: normalize(15),
    fontFamily: Fonts.Inter_Medium,
    fontSize: normalize(12),
    color: Colors.night_blue,
    marginTop: normalize(10),
    textTransform: 'capitalize',
  },
  card: {
    marginHorizontal: normalize(15),
    backgroundColor: Colors.white,
    borderRadius: RADIUS_CARD,
    padding: normalize(12),
    shadowColor: '#9191cdff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    marginVertical: normalize(10),
    gap: normalize(12),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: normalize(10),
    backgroundColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(12),
  },
  rowLabel: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(11),
    color: '#3A3A3A',
    marginBottom: normalize(2),
  },
  rowValue: {
    fontFamily: Fonts.Inter_Regular,
    fontSize: normalize(13),
    color: Colors.night_blue,
    width: '80%',
  },
  about: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dark_grey,
    fontSize: normalize(11),
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(15),
    backgroundColor: '#FFF4E9',
    borderRadius: normalize(8),
    marginVertical: normalize(5),
    justifyContent: 'space-between',
  },
  fileName: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(12),
    marginLeft: normalize(10),
    width: '80%',
  },

  profileImageWrapper: {
    width: normalize(80),
    height: normalize(80),
    position: 'absolute',
    left: normalize(25),
    top: normalize(-28),
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
});
