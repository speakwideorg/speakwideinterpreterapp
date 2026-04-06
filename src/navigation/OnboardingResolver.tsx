import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@app/store';
import { navigationRef } from '@app/navigation/RootNaivgation';

const OnboardingResolver = () => {
  const { onBoardingStatus } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (onBoardingStatus === 'incomplete') return;

    const screenMap: Record<string, string> = {
      profile_setup: 'ProfileSetup',
      persona_validate: 'PersonaValidation',
      availability_setup: 'AvailabilitySetup',
      add_payment_card: 'AddPaymentCard',
      select_subscription: 'SubscriptionSetup',
      add_bank_account: 'AddBankAccount',
    };

    const target = screenMap[onBoardingStatus];
    if (!target) return;

    setTimeout(() => {
      navigationRef.current?.navigate(target as never);
    }, 50);
  }, [onBoardingStatus]);

  return null;
};

export default OnboardingResolver;
