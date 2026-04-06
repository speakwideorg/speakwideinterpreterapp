import { Platform } from 'react-native';

const validateEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
  return emailRegex.test(email?.trim());
};

const validMinLength = /.{8,}/;
const validZipCode = /^\d{5,6}$/;

const validateName = (name: string) => {
  const nameRegex = /^[A-Za-z]+$/;
  return nameRegex.test(name?.trim());
};

const validateFullName = (name: string) => {
  const nameRegex = /^[A-Za-z\s]+$/;
  return nameRegex.test(name?.trim());
};

const validateUserName = (name: string) => {
  const nameRegex = /^[A-Za-z0-9]+$/;
  return nameRegex.test(name?.trim());
};

const validatePassword = (password: string) => {
  const isValid =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  return isValid.test(password?.trim());
};

const validPhoneNumber = (phone: string) => {
  const validPhoneNum = /^[1-9][0-9]{9}$/;
  return validPhoneNum.test(phone?.trim());
};

const validEIN = (text: string) => {
  const validPhoneNum = /^[0-9]{9}$/;
  return validPhoneNum.test(text?.trim());
};

const validSSN = (text: string) => {
  const validPhoneNum = /^[0-9]{9}$/;
  return validPhoneNum.test(text?.trim());
};

const capitalizeString = (str: string) => {
  return str
    .toLowerCase()
    .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
};

const formatString = (str: string) => {
  if (!str) return str;

  const lowerCaseStr = str.toLowerCase(); // Convert entire string to lowercase
  return lowerCaseStr.charAt(0).toUpperCase() + lowerCaseStr.slice(1); // Capitalize the first letter
};

function isValidPhoneNumber(phoneNumber: string) {
  // This regex checks that the number is 10 digits long and not all zeros.
  const regex = /^(?!0{10})\d{10}$/;
  return regex.test(phoneNumber?.trim());
}

const countUppercase = (text: string) => {
  return (text?.match(/[A-Z]/g) || []).length;
};

const getFirstName = (fullName: string) => {
  if (!fullName) return '';
  const nameParts = fullName.trim().split(' ');
  return nameParts[0];
};

const customData = require('../../assets/json/countries.json');

const countriesArray = Object.keys(customData).map(key => {
  return {
    code: key,
    ...customData[key],
  };
});

const createFrom = (payload: object) => {
  let formData: any = new FormData();

  (Object.keys(payload) as Array<keyof typeof payload>).forEach(key => {
    const value: any = payload[key];

    if (value && typeof value === 'object' && !(value instanceof Blob)) {
      if (value.uri && value.name && value.type) {
        formData.append(key, {
          uri: value.uri,
          name: value.name,
          type: value.type,
        });
      } else {
        formData.append(key, JSON.stringify(value));
      }
    } else {
      formData.append(key, value);
    }
  });

  return formData;
};

const decodeHTMLEntities = (text: string) => {
  return text.replace(/&lt;/g, '<');
};

const isArray = (variable: []) => Array.isArray(variable);

function isObjectEmpty(obj: object) {
  return obj && typeof obj === 'object' && Object.keys(obj).length === 0;
}

function isArrayEmpty(arr: any[]) {
  return Array.isArray(arr) && arr.length === 0;
}

function isIos() {
  return Platform.OS === 'ios';
}

export {
  isIos,
  validateName,
  validateFullName,
  validateEmail,
  countUppercase,
  validMinLength,
  validZipCode,
  countriesArray,
  validPhoneNumber,
  validEIN,
  validSSN,
  validatePassword,
  createFrom,
  decodeHTMLEntities,
  isArray,
  isValidPhoneNumber,
  formatString,
  capitalizeString,
  isObjectEmpty,
  isArrayEmpty,
  getFirstName,
  validateUserName,
};
