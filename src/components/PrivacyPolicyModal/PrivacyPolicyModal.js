import React from 'react';
import styles from './PrivacyPolicyModal.module.css';

const PrivacyPolicyModal = ({ isOpen, onClose, pageType }) => {
  if (!isOpen) return null;

  const getPrivacyPolicyContent = () => {
    switch (pageType) {
      case 'top':
        return {
          title: 'The Cat & Wickets Pub Company Privacy Policy',
          content: [
            'This privacy policy describes The Cat & Wickets Pub Company current policies and practices with regard to personal data collected through this website or our social media platforms. The term \'personal data\' refers to personally identifiable information about you, such as your name, email address, date of birth or mailing address and any other information that you disclose.',
            'Personal data collected through The The Cat & Wickets Pub Company other than cookies, as described below*, the only personal data currently collected through this website or our social media platforms is the information that you voluntarily disclose.',
            'Use of Personal data collected through The Cat & Wickets Pub Company - By sending us an electronic message (email), you may be sending us personal information such as your name, address and email address. The Cat & Wickets Pub Company uses the personal data you provide to process your request. We also use this information to help us improve the content and functionality of our website, to better understand our customers and markets, and to improve our services.',
            'The Cat & Wickets Pub Company will not forward any personal information received to any third party. The Cat & Wickets Pub Company may use this information to contact you in the future to tell you about products or services we believe will be of interest to you. If we do so, each communication we send to you will contain an \'opt-out\' clause preventing you receiving future such communications. Please bear in mind that the email is not necessarily secure against interception. If your communication is very sensitive or includes personal information, you might wish to send it by postal mail instead. The information that you provide through will be used only for its intended purpose, except as required by law or if pertinent to judicial or governmental investigations or proceedings.',
            'Anonymous data collected through The Cat & Wickets Pub Company - We may collect and store information for statistical purposes. For example, we may count the number of visitors to the different pages of our Web site to help make them more useful to visitors. This information does not identify you personally. We automatically collect and store only the following information about your visit: The internet domain (for example, "xcompany.com" if you use a private internet access account, or "yourschool.ed" if you connect from a university\'s domain) and IP address (an IP address is a number that is automatically assigned to your computer whenever you are surfing the web) from which you access our website',
            '· The type of browser and operating system used to access our site',
            '· The area that you are situated · The date and time you access our site',
            '· The pages you visit',
            '· If you visited the The Cat & Wickets Pub Company website from a link or another website, the address of that website.'
          ]
        };
      
      case 'griffin':
        return {
          title: 'The Cat & Wickets Pub Company Privacy Policy',
          content: [
            'This privacy policy describes The Cat & Wickets Pub Company current policies and practices with regard to personal data collected through this website or our social media platforms. The term \'personal data\' refers to personally identifiable information about you, such as your name, email address, date of birth or mailing address and any other information that you disclose.',
            'Personal data collected through The The Cat & Wickets Pub Company other than cookies, as described below*, the only personal data currently collected through this website or our social media platforms is the information that you voluntarily disclose.',
            'Use of Personal data collected through The Cat & Wickets Pub Company - By sending us an electronic message (email), you may be sending us personal information such as your name, address and email address. The Cat & Wickets Pub Company uses the personal data you provide to process your request. We also use this information to help us improve the content and functionality of our website, to better understand our customers and markets, and to improve our services.',
            'The Cat & Wickets Pub Company will not forward any personal information received to any third party. The Cat & Wickets Pub Company may use this information to contact you in the future to tell you about products or services we believe will be of interest to you. If we do so, each communication we send to you will contain an \'opt-out\' clause preventing you receiving future such communications. Please bear in mind that the email is not necessarily secure against interception. If your communication is very sensitive or includes personal information, you might wish to send it by postal mail instead. The information that you provide through will be used only for its intended purpose, except as required by law or if pertinent to judicial or governmental investigations or proceedings.',
            'Anonymous data collected through The Cat & Wickets Pub Company - We may collect and store information for statistical purposes. For example, we may count the number of visitors to the different pages of our Web site to help make them more useful to visitors. This information does not identify you personally. We automatically collect and store only the following information about your visit: The internet domain (for example, "xcompany.com" if you use a private internet access account, or "yourschool.ed" if you connect from a university\'s domain) and IP address (an IP address is a number that is automatically assigned to your computer whenever you are surfing the web) from which you access our website',
            '· The type of browser and operating system used to access our site',
            '· The area that you are situated · The date and time you access our site',
            '· The pages you visit',
            '· If you visited the The Cat & Wickets Pub Company website from a link or another website, the address of that website.'
          ]
        };
      
      default:
        return {
          title: 'Privacy Policy',
          content: [
            'We are committed to protecting your privacy and ensuring the security of your personal information.',
            'Your personal data is collected and used in accordance with applicable data protection laws.',
            'We use your information to provide our services and improve your experience.',
            'Your privacy is important to us and we take all necessary measures to protect your data.'
          ]
        };
    }
  };

  const { title, content } = getPrivacyPolicyContent();

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.policyContent}>
            {content.map((paragraph, index) => (
              <p key={index} className={styles.policyParagraph}>
                {paragraph}
              </p>
            ))}
          </div>
          <div className={styles.scrollIndicator}>
            <div className={styles.scrollBar}></div>
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.acceptButton} onClick={onClose}>
            I Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;
