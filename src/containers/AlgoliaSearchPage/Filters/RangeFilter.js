import React, { useState, useEffect } from 'react';
import { useRange } from 'react-instantsearch';
import { FormattedMessage } from '../../../util/reactIntl';
import { Button, RangeSlider } from '../../../components';
import css from './Filters.module.css';
import { ALL_SEARCH_ID, LISTING_SEARCH_ID } from '../../../constants';
import { createResourceLocatorString } from '../../../util/routes';
import { clickedFilter } from '../../../util/searchInsight';

const unsetNumberInputValue = '';

function CustomRangeInput({ attribute, precision = 2, history, initialCategory, searchId, routes, queryParams, currentUser, indexName }) {
    const [error, setError] = useState(null);
    const { start, range, canRefine, precision: valuePrecision, refine } = useRange({ attribute, precision });
    const step = 1 / Math.pow(10, valuePrecision || 0);

    const initialValues = {
        min: start[0] !== -Infinity && start[0] !== range.min ? start[0] : unsetNumberInputValue,
        max: start[1] !== Infinity && start[1] !== range.max ? start[1] : unsetNumberInputValue,
    };

    const [prevValues, setPrevValues] = useState(initialValues);
    const [{ from, to }, setRange] = useState({
        from: initialValues.min?.toString(),
        to: initialValues.max?.toString(),
    });

    // Update state if values change
    useEffect(() => {
        if (initialValues.min !== prevValues.min || initialValues.max !== prevValues.max) {
            setRange({
                from: initialValues.min?.toString(),
                to: initialValues.max?.toString(),
            });
            setPrevValues(initialValues);
        }
    }, [initialValues, prevValues]);

    const handleInputChange = (value, isMin) => {
        const convertedValue = value ? (Number(value) * 100) : null;
        if (isMin) {
            setRange({ from: convertedValue?.toString() || unsetNumberInputValue, to });
        } else {
            setRange({ from, to: convertedValue?.toString() || unsetNumberInputValue });
        }
    };

    const handleSliderChange = (sliderValues) => {
        const [min, max] = sliderValues;
        setRange({ from: (min * 100).toString(), to: (max * 100).toString() });
    };

    const validHandles = range && range.min
        ? [
            Math.max(Number(from) / 100, range.min / 100) || range.min / 100, // Limit `from` to at least `range.min`
            Math.min(Number(to) / 100, range.max / 100) || range.max / 100   // Limit `to` to at most `range.max`
        ]
        : [];

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                // refine([from ? Number(from) : undefined, to ? Number(to) : undefined]);
                const pageName = [LISTING_SEARCH_ID, ALL_SEARCH_ID].includes(searchId) && initialCategory
                    ? 'SearchPageGenre' : 'SearchPage';

                if (!from || !to) {
                    setError('Please enter the range');
                    return;
                }
                if (+from > +to) {
                    setError('Invalid range');
                    return;
                };

                // handle event
                clickedFilter({
                    userToken: currentUser?.id?.uuid,
                    index: indexName,
                    eventName: 'Facet Clicked',
                    filters: [`${attribute}: ${from}-${to}`]
                });

                const genereMaybe = initialCategory ? { genre: initialCategory } : {};
                const updateQueryParams = { ...queryParams, [attribute]: `${from}-${to}` };
                history.push(
                    createResourceLocatorString(
                        pageName,
                        routes,
                        {
                            searchId: LISTING_SEARCH_ID,
                            ...genereMaybe
                        },
                        updateQueryParams
                    )
                );
            }}
            className={css.rangeFilter}
        >
            <label>
                <span>Price (USD)</span>
            </label>
            <div className={css.rangeFilterFieldsWrapper}>


                <div className={css.rangeFields}>

                    <label>
                        <input
                            type="number"
                            value={stripLeadingZeroFromInput(from || unsetNumberInputValue)}
                            step={step}
                            placeholder={(range.min / 100).toString() || '0'}
                            disabled={!canRefine}
                            onInput={(e) => handleInputChange(e.currentTarget.value, true)}
                        />
                    </label>
                    <span><FormattedMessage id='RangeInputFilter.to' /></span>
                    <label>
                        <input
                            type="number"
                            value={stripLeadingZeroFromInput(to || unsetNumberInputValue)}
                            step={step}
                            placeholder={(range.max / 100).toString() || '1'}
                            disabled={!canRefine}
                            onInput={(e) => handleInputChange(e.currentTarget.value, false)}
                        />
                    </label>
                </div>

                <RangeSlider
                    min={range.min / 100}
                    max={range.max / 100}
                    step={step}
                    handles={validHandles}
                    onChange={handleSliderChange}
                />
                {error && <span className={css.error}>{error}</span>}
            </div>
            <Button className={css.applyRange} type="submit"><FormattedMessage id='RangeInputFilter.apply' /></Button>
        </form>
    );
}

export default CustomRangeInput;

function stripLeadingZeroFromInput(value) {
    let updateValue = value ? Number(value) / 100 : null;
    return updateValue ? updateValue.toString().replace(/^0+/, '') : '';
}
