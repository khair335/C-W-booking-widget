import React from "react";
import PropTypes from "prop-types";
import NamedLink from "../NamedLink/NamedLink";
import css from './EmptyCard.module.css';


const EmptyCard = (props) => {
    const { icon, title, text, linkprops } = props;

    if (linkprops && Object.keys(linkprops || {}).length > 0) {
        return (
            <NamedLink {...linkprops} className={css.emptyCardLinkWrapper}>
                <div className={css.emptyCard}>
                    <span>{icon}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                </div>
            </NamedLink>
        )
    };

    return (
        <div className={css.emptyCardLinkWrapper}>
        <div className={css.emptyCard} style={{ maxWidth: 269 }}>
            <span>{icon}</span>
            <h3>{title}</h3>
            <p>{text}</p>
        </div>
        </div>
    )
}

EmptyCard.propTypes = {
    icon: PropTypes.elementType, // Accepts a React component
    title: PropTypes.string,
    text: PropTypes.string
};

export default EmptyCard