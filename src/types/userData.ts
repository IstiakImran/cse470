export interface BaseUserData {
  firstName: string;
  lastName: string;
  email: string;
  bloodType: string;
  contactNumber: string;
  address: string;
  division: string;
  district: string;
  upazila: string;
  cityCorporation?: string;
  latitude: number;
  longitude: number;
  lastDonated?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  medicalConditions: string;
  isSmoker: boolean;
  hasHypertension: boolean;
  lastMedicalCheckup?: string;
  isEligible: boolean;
  donationMode: boolean;
  showPhoneNumber: boolean;
}

export interface ExtendedUserData extends BaseUserData {
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isEligible: boolean;
  donationMode: boolean;
  showPhoneNumber: boolean;
}

export interface UserProfileData extends BaseUserData {}
export interface EditProfileData extends BaseUserData {}
