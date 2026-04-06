/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, FC, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import KeyboardAvoidingTemplate from '@app/components/template/KeyboardAvoidingTemplate';
import { normalize } from '@app/utils/orientation';
import Header from '@app/components/common/Header';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import { Icons, Images } from '@app/themes';
import TextInput from '@app/components/common/TextInput';
import { Checkbox } from '@app/components/common/Checkbox';
import { RadioButton } from '@app/components/common/RadioButton';
import { NumberSelector } from '@app/components/common/NumberSelector';
import Button from '@app/components/common/Button';
import styles from './styles';
import { AllRoutes, navigate } from '@app/navigation/RootNaivgation';
import useKeyboardVisible from '@app/utils/hooks/useKeyboardVisible';
import { useAppDispatch, useAppSelector } from '@app/store';
import { useIsFocused } from '@react-navigation/native';
import CustomImagePicker from '@app/components/common/CustomImagePicker';
import Css from '@app/themes/Css';
import { StackScreenProps } from '@react-navigation/stack';
import { showMessage } from '@app/utils/helpers/Toast';
import Loader from '@app/utils/helpers/Loader';
import {
  disputeCreateRequest,
  disputeListCategoryRequest,
} from '@app/store/slice/interpreterSession.slice';

const TERMS_OPTIONS = [
  'I certify that the information provided is accurate and complete',
  'I understand that false claims may result in account suspension',
  'I agree to cooperate with the investigation process',
] as const;

type FileDisputeProps = {
  issueDetail: string;
  sessionDetails: string;
  clientName: string;
  wasClient: boolean | null;
  howLongDidYWaitH: string;
  howLongDidYWaitM: string;
  clientArrive: boolean | null;
  howLateWereTheyH: string;
  howLateWereTheyM: string;
  serviceDurationAgreed: boolean | null;
  actualDurationH: string;
  actualDurationM: string;
  legalAction: boolean | null;
  specifyType: string;
  safetyConcern: boolean | null;
  describe: string;
  amountPaid: string;
  terms: string[];
};

const INITIAL_STATE: FileDisputeProps = {
  issueDetail: '',
  sessionDetails: '',
  clientName: '',
  wasClient: null,
  howLongDidYWaitH: '',
  howLongDidYWaitM: '',
  clientArrive: null,
  howLateWereTheyH: '',
  howLateWereTheyM: '',
  serviceDurationAgreed: null,
  actualDurationH: '',
  actualDurationM: '',
  legalAction: null,
  specifyType: '',
  safetyConcern: null,
  describe: '',
  amountPaid: '',
  terms: [],
};

type DurationSelectorsProps = {
  selectionOne: string;
  setSelectionOne: (val: string) => void;
  selectionTwo: string;
  setSelectionTwo: (val: string) => void;
};

const DurationSelectors: FC<DurationSelectorsProps> = ({
  selectionOne,
  setSelectionOne,
  selectionTwo,
  setSelectionTwo,
}) => (
  <View style={styles.durationRow}>
    <NumberSelector
      value={selectionOne}
      onChange={setSelectionOne}
      min={0}
      max={12}
      unit="hr"
      marginRight={normalize(6)}
    />
    <NumberSelector
      value={selectionTwo}
      onChange={setSelectionTwo}
      min={0}
      max={60}
      unit="mins"
    />
  </View>
);

const FileDispute: FC<StackScreenProps<AllRoutes, 'RaiseDispute'>> = ({
  route,
}) => {
  const { item } = route?.params;
  console.log('item in filedispute', item);
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { status, loading, disputeListResponse, disputeCategoryListResponse } =
    useAppSelector(state => state.interpreterSession);
  const [disputeTypes, setDisputeTypes] = useState<string[]>([]);
  const { isKeyboardVisible, keyboardHeight } = useKeyboardVisible();
  const [info, setInfo] = useState<FileDisputeProps>(INITIAL_STATE);
  const [documents, setdocuments] = useState<{
    uri: string;
    name: string;
    type: string;
  }>({ name: '', type: '', uri: '' });
  const [imageVisibile, setImageVisible] = useState(false);
  const [imageErr, setImageErr] = useState(false);

  useEffect(() => {
    switch (status) {
      case 'interpreterSession/disputeCreateSuccess': {
        navigate('Success', {
          type: 'RaiseDispute',
          title: 'Dispute ',
          title1: 'Submitted',
          subTitle: 'Successfully',
        });
        break;
      }
      case 'interpreterSession/disputeCreateFailure': {
        break;
      }
    }
  }, [status]);

  useEffect(() => {
    if (isFocused) {
      dispatch(disputeListCategoryRequest({}));
    }
  }, [isFocused]);

  const updateValue = useCallback(
    (
      field: keyof FileDisputeProps,
      value: boolean | string | null | string[],
    ) => {
      setInfo(prev => ({ ...prev, [field]: value }));
    },
    [],
  );

  const toggleListItem = useCallback(
    (
      list: string[],
      setter: React.Dispatch<React.SetStateAction<string[]>>,
      item: string,
    ) => {
      setter(prev =>
        prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item],
      );
    },
    [],
  );

  const renderRadio = useCallback(
    (label: string, value: boolean | null, field: keyof FileDisputeProps) => (
      <View>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.radioRow}>
          <RadioButton
            label="Yes"
            selected={value === true}
            onSelect={() => updateValue(field, true)}
          />
          <RadioButton
            label="No"
            selected={value === false}
            onSelect={() => updateValue(field, false)}
          />
        </View>
      </View>
    ),
    [updateValue],
  );

  const handleSubmitDispute = () => {
    // === Validations ===
    if (!disputeTypes?.length) {
      showMessage('Please select at least one category');
      return;
    }

    if (!info?.sessionDetails?.trim()) {
      showMessage('Please write the session details');
      return;
    }

    if (info?.wasClient === undefined) {
      showMessage('Please confirm if the client was a no-show');
      return;
    }

    if (info?.clientArrive === undefined) {
      showMessage('Please select whether the client arrived on time');
      return;
    }

    if (info?.serviceDurationAgreed === undefined) {
      showMessage('Please confirm if the service duration was as agreed');
      return;
    }

    if (info?.legalAction === undefined) {
      showMessage('Please select the legal action');
      return;
    }

    if (info?.safetyConcern === undefined) {
      showMessage('Please select the safety concern');
      return;
    }

    if (!info?.terms || info?.terms?.length < 3) {
      showMessage('Please check all the terms');
      return;
    }

    // === Create FormData ===
    const formData = new FormData();
    formData.append('session_ref_number', item?._id);

    // Multiple category IDs
    disputeTypes?.forEach((itm: any) => {
      formData.append('category[]', String(itm?._id));
    });

    // Utility function for time padding
    const formatTime = (h: any, m: any) => {
      return `${String(h || 0).padStart(2, '0')}:${String(m || 0).padStart(
        2,
        '0',
      )}`;
    };

    formData.append('issue_details', info?.sessionDetails?.trim() || '');
    formData.append('client_noshow', info?.wasClient ? 'true' : 'false');

    if (info?.wasClient) {
      const waitingTime = formatTime(
        info?.howLongDidYWaitH,
        info?.howLongDidYWaitM,
      );
      formData.append('waiting_time', waitingTime);
    }

    formData.append('client_ontime', info?.clientArrive ? 'true' : 'false');
    if (info?.clientArrive === false) {
      const lateTime = formatTime(
        info?.howLateWereTheyH,
        info?.howLateWereTheyM,
      );
      formData.append('late_time', lateTime);
    }

    formData.append(
      'is_proper_duration',
      info?.serviceDurationAgreed ? 'true' : 'false',
    );
    if (!info?.serviceDurationAgreed) {
      const actualDuration = formatTime(
        info?.actualDurationH,
        info?.actualDurationM,
      );
      formData.append('actual_duration', actualDuration);
    }

    formData.append(
      'has_legal_violation',
      info?.legalAction ? 'true' : 'false',
    );
    if (info?.legalAction && info?.specifyType) {
      formData.append('legal_violation_type', info?.specifyType);
    }

    formData.append(
      'has_safety_concern',
      info?.safetyConcern ? 'true' : 'false',
    );
    if (info?.safetyConcern && info?.specifyType) {
      formData.append('safety_concern_type', info?.specifyType);
    }

    // Attach document if available
    if (documents?.uri) {
      formData.append('supporting_documents', {
        uri: documents.uri,
        type: documents.type || 'image/jpeg',
        name: documents.name || `support-doc-${Date.now()}.jpg`,
      });
    }

    console.log('Dispute FormData =>', formData);

    // === Dispatch API ===
    dispatch(disputeCreateRequest(formData));
  };

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
      <Header isBack isShowProfile={false} />
      <Loader visible={loading} />

      <Text style={styles.title}>
        File <Text style={styles.titleBold}>Dispute</Text>
      </Text>
      <Text style={styles.subheading}>
        Please fill in the following details
      </Text>

      <View style={styles.contentWrapper}>
        <KeyboardAvoidingTemplate
          contentContainerStyle={[
            styles.keyboardContainer,
            {
              paddingBottom: isKeyboardVisible ? keyboardHeight : normalize(45),
            },
          ]}
        >
          {/* Dispute Types */}
          <Text style={[styles.label, styles.mb10]}>
            What type of dispute are you filing?
          </Text>
          {disputeCategoryListResponse?.data?.map(
            (option: any, index: number) => (
              <View key={index} style={styles.checkboxRow}>
                <Checkbox
                  checked={disputeTypes.includes(option)}
                  onChange={() =>
                    toggleListItem(disputeTypes, setDisputeTypes, option)
                  }
                  style={styles.checkboxBorder}
                />
                <Text style={styles.checkboxLabel}>{option.title}</Text>
              </View>
            ),
          )}
          {/* Issue Details */}
          {/* <TextInput
            title="What is your session reference number?"
            placeholder="Enter session reference number"
            width="100%"
            value={info.issueDetail}
            onChangeText={txt => updateValue('issueDetail', txt)}
          /> */}
          <TextInput
            title="Please describe the issue in detail"
            height={normalize(180)}
            width="100%"
            multiline
            paddingTop={normalize(10)}
            bottomText="(500 characters limit)"
            value={info.sessionDetails}
            onChangeText={txt => updateValue('sessionDetails', txt)}
          />
          {/* <TextInput
            title="Please provide session number and Interpreter name"
            placeholder="Enter name / ID"
            width="100%"
            value={info.interpreterName}
            onChangeText={txt => updateValue('interpreterName', txt)}
          /> */}
          {/* Interpreter No-show */}
          {renderRadio(
            'Was the client a no-show?',
            info.wasClient,
            'wasClient',
          )}
          <Text style={styles.helperText}>If yes, how long did you wait?</Text>
          <DurationSelectors
            selectionOne={info.howLongDidYWaitH}
            selectionTwo={info.howLongDidYWaitM}
            setSelectionOne={v => updateValue('howLongDidYWaitH', v)}
            setSelectionTwo={v => updateValue('howLongDidYWaitM', v)}
          />
          {/* Interpreter Arrived */}
          {renderRadio(
            'Did the client arrive on time?',
            info.clientArrive,
            'clientArrive',
          )}
          <Text style={styles.helperText}>If no, how late were they?</Text>
          <DurationSelectors
            selectionOne={info.howLateWereTheyH}
            selectionTwo={info.howLateWereTheyM}
            setSelectionOne={v => updateValue('howLateWereTheyH', v)}
            setSelectionTwo={v => updateValue('howLateWereTheyM', v)}
          />
          {/* Service Duration */}
          {renderRadio(
            'Was the session duration as agreed?',
            info.serviceDurationAgreed,
            'serviceDurationAgreed',
          )}
          <Text style={styles.helperText}>If no, actual duration:</Text>
          <DurationSelectors
            selectionOne={info.actualDurationH}
            selectionTwo={info.actualDurationM}
            setSelectionOne={v => updateValue('actualDurationH', v)}
            setSelectionTwo={v => updateValue('actualDurationM', v)}
          />
          {/* Legal Action */}
          {renderRadio(
            'Does this dispute involve potential legal violations?',
            info.legalAction,
            'legalAction',
          )}
          <TextInput
            title="If yes, please specify type:"
            height={normalize(180)}
            width="100%"
            value={info.specifyType}
            multiline
            paddingTop={normalize(10)}
            titleStyle={styles.inputTitle}
            onChangeText={val => updateValue('specifyType', val)}
          />
          {/* Safety Concern */}
          {renderRadio(
            'Are there any safety concerns?',
            info.safetyConcern,
            'safetyConcern',
          )}
          <TextInput
            value={info.describe}
            title="If yes, please describe immediately:"
            height={normalize(180)}
            width="100%"
            multiline
            onChangeText={val => updateValue('describe', val)}
            paddingTop={normalize(10)}
            titleStyle={styles.inputTitle}
          />

          {/* File Upload */}
          <Text style={styles.label}>
            Please upload supporting documentation:
          </Text>
          {documents?.uri && !imageErr ? (
            <View style={styles.logoView}>
              <Image
                style={[Css.w100, Css.h100, Css.ofcover]}
                source={{ uri: documents.uri }}
                onError={() => {
                  setImageErr(true);
                }}
              />

              <TouchableOpacity
                style={styles.imageDeleteContainer}
                onPress={() => {
                  setdocuments({ name: '', type: '', uri: '' });
                }}
              >
                <Image
                  source={Icons.icon_cross}
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
              onPress={() => setImageVisible(true)}
            >
              <Image source={Icons.upload} style={styles.backup} />
              <Text style={styles.title1}>Upload your document</Text>
              <Text style={styles.title2}>(Max 5 files, 10MB each)</Text>
            </TouchableOpacity>
          )}
          {/* Terms Checkboxes */}
          {TERMS_OPTIONS.map(term => (
            <View key={term} style={styles.termsContainer}>
              <Checkbox
                checked={info.terms.includes(term)}
                onChange={() =>
                  updateValue(
                    'terms',
                    info.terms.includes(term)
                      ? info.terms.filter(t => t !== term)
                      : [...info.terms, term],
                  )
                }
              />
              <Text style={styles.terms}>{term}</Text>
            </View>
          ))}
          <Button
            title="Submit"
            width="100%"
            marginTop={normalize(35)}
            onPress={() => handleSubmitDispute()}
            // navigate('Success', {
            //   type: 'Dispute',
            //   title: 'Dispute ',
            //   title1: 'Submitted',
            //   subTitle: 'Successfully',
            // })
            // }
          />
        </KeyboardAvoidingTemplate>
      </View>
      <CustomImagePicker
        visible={imageVisibile}
        onClose={() => setImageVisible(false)}
        onSelect={(img: { uri: string; name: string; type: string }) => {
          setdocuments(img);
          setImageVisible(false);
        }}
      />
    </View>
  );
};

export default FileDispute;
