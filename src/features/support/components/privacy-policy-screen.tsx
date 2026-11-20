import { PrivacyPolicyContent } from '@/features/support/components/privacy-policy-content';
import { SupportPage } from '@/features/support/components/support-page';

export function PrivacyPolicyScreen() {
  return (
    <SupportPage fallbackHref="/support" title="Chính sách quyền riêng tư">
      <PrivacyPolicyContent />
    </SupportPage>
  );
}
