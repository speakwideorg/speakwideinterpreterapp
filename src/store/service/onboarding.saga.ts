import { takeLatest } from 'redux-saga/effects';
import { replace } from '@app/navigation/RootNaivgation';
import { profileDetailsSuccess } from '../slice/auth.slice';

function* handleProfileNavigation(action: any) {
    const data = action.payload?.data;

    try {
        if (data.isOnboardingComplete && data.isBankAccountAdded) {
            replace('Success');
            return;
        }

        if (data.subscriptionDetails) {
            replace('AddBankAccount');
            return;
        }

        if (data.isPaymentCardAdded) {
            replace('SubscriptionSetUp');
            return;
        }

        if (data.isAvailabilityAdded) {
            replace('AddPaymentCard');
            return;
        }

        if (
            data.personaVerifyStatus === 'approved' ||
            data.personaVerifyStatus === 'completed' ||
            data.personaVerifyStatus === 'pending'
        ) {
            replace('AvailabilitySetup');
            return;
        }

        if (data.isProfileCompleted) {
            replace('PersonaValidation');
            return;
        }

        replace('ProfileSetup');
        // replace('SubscriptionSetUp');
    } catch (e) {
        console.log('Onboarding navigation error', e);
    }
}

export function* onboardingSaga() {
    yield takeLatest(profileDetailsSuccess.type, handleProfileNavigation);
}
