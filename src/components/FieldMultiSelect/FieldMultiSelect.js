import React, { useState } from 'react';
import { Field } from 'react-final-form';

import css from './FieldMultiSelect.module.css';
import { ValidationError } from '../../components';
import classNames from 'classnames';

const FieldMultiSelect = props => {
    const [selectedOptions, setSelectedOptions] = useState();
    const [isSelected, setIsSelected] = useState(false);
    // REACT-SELECT DOESNT PLAY WELL WITH SSR
    // IF NO WINDOW DONT RENDER
    if (typeof window === 'undefined') {
        return null;
    }
    // CONDITIONALLY IMPORT SELECT MODULES
    const { default: Select, components } = require('react-select'); // eslint-disable-line global-require

    const {
        validate,
        name,
        options,
        label,
        className,
        placeholder,
        meta,
        isMulti,
        isRequired,
        disabled,
        defaultValue,
        ...rest
    } = props;

    const status =
        isSelected && isRequired && !selectedOptions
            ? css.error
            : selectedOptions && selectedOptions.value !== ''
                ? css.success
                : css.attention;
    const Option = props => (
        <div>
            <components.Option {...props}>
                <label className={css.multiselectValueLabel}>{props.label}</label>
            </components.Option>
        </div>
    );
    const MultiValue = props => (
        <components.MultiValue {...props}>
            <span className={css.multiSelectLabel}>{props.data.label}</span>
        </components.MultiValue>
    );
    const InputOption = ({
        getStyles,
        Icon,
        isDisabled,
        isFocused,
        isSelected,
        children,
        innerProps,
        ...rest
    }) => {
        const [isActive, setIsActive] = useState(false);
        const onMouseDown = () => setIsActive(true);
        const onMouseUp = () => setIsActive(false);
        const onMouseLeave = () => setIsActive(false);

        // styles
        let bg = '#171819';
        let color = '#fff';
        if (isFocused) bg = '#000';
        if (isActive) bg = '#ED2124';
        if (isFocused) color = '#fff';
        if (isActive) color = '#000';
        if (isSelected) color = '#000';
        if (isSelected) bg = '#ED2124';
        const style = {
            alignItems: 'center',
            backgroundColor: bg,
            color: color,
            display: 'flex ',
            fontFamily: "Sofia Pro",
        };

        // prop assignment
        const props = {
            ...innerProps,
            onMouseDown,
            onMouseUp,
            onMouseLeave,
            style,
        };

        return (
            <components.Option
                {...rest}
                isDisabled={isDisabled}
                isFocused={isFocused}
                isSelected={isSelected}
                getStyles={getStyles}
                innerProps={props}
            >
                <div className={css.inputWrapper} style={{backgroundColor:isSelected ? "#ED2124" : isActive ? "#ED2124" : "",}}>
                    {/* <input type="checkbox" checked={isSelected} /> */}
                    <label style={{ fontWeight: isSelected ? 400 : 300, color: isSelected ? "#000" : isActive ? "#fff" : "#fff",backgroundColor:isSelected ? "#ED2124" : "", fontFamily: "Sofia Pro" }}>{children}</label>
                </div>
            </components.Option>
        );
    };

    const renderSelect = typeof window !== 'undefined';
    return options && renderSelect ? (
        <Field name={name} validate={validate}>
            {props => {
                const { input, meta } = props;
                // PULLING INPUT ONCHANGE OUT OF OBJECT SO THAT WE CAN IMPLEMENT OUT OWN
                const { onChange, ...rest } = input;
                const { invalid, touched, error } = meta;
                const hasError = touched && invalid && error;
       
                return (
                    <div className={className}>
                        {label ? <label className={css.gap}>{label}</label> : null}
                        <div className={status}>
                            <Select
                                closeMenuOnSelect={!isMulti}
                                hideSelectedOptions={false}
                                isMulti={isMulti}
                                maxMenuHeight={180}

                                // components={[Option, MultiValue]}
                                components={{
                                    Option: InputOption,
                                }}
                                defaultValue={
                                    defaultValue && Object.keys(defaultValue).length ? defaultValue : undefined
                                }
                                
                                options={options}
                                isSearchable={true}
                                className={classNames(css.multiSelectBox,!isMulti && css.singleSelect)}
                                isDisabled={disabled}
                                placeholder={<div className="select-placeholder-text" style={{color:"hsl(240 3% 70%)"}}>{placeholder ? placeholder : "Select"}</div>} 
                                selected={selectedOptions}
                                getOptionValue={value => {
                                    setIsSelected(true);
                                    return value.key || value.label;
                                }}
                                {...rest}
                                onBlur={() => input.onBlur(input.value)}
                                onChange={item => {
                                    setSelectedOptions(item);
                                    input.onChange(item);
                                }}
                                theme={theme => ({
                                    ...theme,
                                    borderRadius: 0,
                                    fontFamily: "Sofia Pro",
                                    backgroundColor:"#171819",
                                    color: "white",
                                    colors: {
                                        ...theme.colors,
                                        text: '#ED2124',
                                        primary25: '#ddd',
                                        primary: '#000',

                                    },
                                })}
                            />
                            <ValidationError fieldMeta={meta} name={name} selectedOptions={selectedOptions} />
                        </div>
                    </div>
                );
            }}
        </Field>
    ) : null;
};
export default FieldMultiSelect;
