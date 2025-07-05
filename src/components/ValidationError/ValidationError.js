import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './ValidationError.module.css';
import { FormattedMessage } from 'react-intl';
import { PUB_PRIMARY_GENRE, PUB_SERIES_PRIMARY_GENRE, PUB_SERIES_SUB_GENRE, PUB_SUBTITLE_SELECTION, PUB_SUB_GENRE } from '../../util/types';

/**
 * This component can be used to show validation errors next to form
 * input fields. The component takes the final-form Field component
 * `meta` object as a prop and infers if an error message should be
 * shown.
 */
const ValidationError = props => {
  const { rootClassName, className, fieldMeta, selectedOptions, name } = props;
  const { touched, error } = fieldMeta;

  const handleErrors = (name, selectedOptions, error) => {
    switch (name) {
      case PUB_SUBTITLE_SELECTION:
        return (<FormattedMessage id="EditListingDetailsForm.subTitleError" />)
        break;
      case (PUB_SUB_GENRE || PUB_SERIES_SUB_GENRE):
        if (selectedOptions?.length > 2) {
          return <FormattedMessage id="EditListingDetailsForm.subGenreError" values={{ maxCount: 2 }} />;
        }
      case PUB_SERIES_PRIMARY_GENRE:
        if (selectedOptions?.length > 3) {
          return <FormattedMessage id="EditListingDetailsForm.subGenreError" values={{ maxCount: 3 }} />;
        } else {
          return <FormattedMessage id="EditListingDetailsForm.primaryGenre" />;
        }
      // case PUB_PRIMARY_GENRE:
      //   if (selectedOptions?.length > 3) {
      //     return <FormattedMessage id="EditListingDetailsForm.primaryGenre" />;
      //   } else {
      //     return <FormattedMessage id="EditListingDetailsForm.primaryGenre" />;
      //   }
      default:
        return error;
    }
  }

  const classes = classNames(rootClassName || css.root, className);
  return touched && error ? <div className={classes}>{handleErrors(name, selectedOptions, error)}
  </div> : null;
};

ValidationError.defaultProps = { rootClassName: null, className: null };

const { shape, bool, string } = PropTypes;

ValidationError.propTypes = {
  rootClassName: string,
  className: string,
  fieldMeta: shape({
    touched: bool.isRequired,
    error: string,
  }).isRequired,
};

export default ValidationError;
