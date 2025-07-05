import React from 'react'
import { LayoutSingleColumn, Modal, NamedLink, Page } from '../../components';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';
import css from './PaymentCompletedPage.module.css';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

const PaymentCompletedPage = (props) => {
    const history = useHistory();
    const { params } = props;

    const topbar = <TopbarContainer />;

    const PaymentCompletedModal = (
        <Modal
            id="PaymentCompletedPage.paymentCompleted"
            isOpen={true}
            onClose={() => history.push('/s')}
            usePortal
            onManageDisableScrolling={() => { }}
            className={css.paymentCompletedModal}
        >
            <div className={css.paymentCompletedModal}>
                <h4 className={css.paymentCompletedHeading}>
                    <FormattedMessage id="PaymentCompletedPage.heading" />
                </h4>
                <div>
                    <p className={css.paymentCompletedSubHeading}>
                        <FormattedMessage id="PaymentCompletedPage.subHeading" />
                    </p>
                    <div>

                        <NamedLink name="MyLibraryPage"
                            className={css.paymentCompletedStartWatching}
                            params={{ tab: "purchases" }}
                        >
                            <FormattedMessage id="PaymentCompletedPage.startWatching" />
                        </NamedLink>
                    </div>

                    <NamedLink name="SearchPageOld" className={css.paymentCompletedMoreContent}>
                        <FormattedMessage id="PaymentCompletedPage.moreContent" />
                    </NamedLink>

                </div>
            </div>
        </Modal>
    )

    return (
        <Page>
            <LayoutSingleColumn className={css.pageRoot} topbar={topbar} footer={<FooterContainer />}>
                <div className={css.contentWrapperForProductLayout}>
                    {PaymentCompletedModal}
                </div>
            </LayoutSingleColumn>
        </Page>
    )
};

export default PaymentCompletedPage;
