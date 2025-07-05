/**
 * MenuLabel is the only always visible part of Menu.
 * Clicking it toggles visibility of MenuContent.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './MenuLabel.module.css';

class MenuLabel extends Component {
  constructor(props) {
    super(props);

    this.state = { clickedWithMouse: false };
    this.onClick = this.onClick.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  onClick(e) {
    e.stopPropagation();
    e.preventDefault();
    
    // Ensure onToggleActive is defined before calling
    if (this.props.onToggleActive) {
      this.props.onToggleActive();
    }

    // Don't show focus outline if user just clicked the element with mouse
    const nativeEvent = e.nativeEvent;
    const isRealClick = !(nativeEvent.clientX === 0 && nativeEvent.clientY === 0);
    if (isRealClick) {
      this.setState({ clickedWithMouse: true });
    }
  }

  onBlur() {
    // Delay the state update to ensure it doesn't interfere with click events
    setTimeout(() => {
      this.setState({ clickedWithMouse: false });
    }, 0);
  }
  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }

  handleClickOutside = (event) => {
    if (this.menuLabelRef && !this.menuLabelRef.contains(event.target)) {
      // Only close the menu if it is currently open
      if (this.props.isOpen) {
        this.props.onToggleActive(); // Close the menu
      }
    }
  }
  render() {
    const { children, className, rootClassName, isOpen, isOpenClassName } = this.props;

    const rootClass = rootClassName || css.root;
    const isOpenClass = isOpenClassName || css.isOpen;
    const classes = classNames(rootClass, className, {
      [css.clickedWithMouse]: this.state.clickedWithMouse,
      [isOpenClass]: isOpen,
    });
    return (
      <div ref={(node) => { this.menuLabelRef = node; }} style={{ height: '100%' }}>
      <button className={classes} onClick={this.onClick} onBlur={this.onBlur}>
        {children}
      </button>
      </div>
    );
  }
}

MenuLabel.defaultProps = {
  className: null,
  isOpenClassName: null,
  isOpen: false,
  onToggleActive: null,
  rootClassName: '',
};

const { bool, func, node, string } = PropTypes;

MenuLabel.propTypes = {
  children: node.isRequired,
  className: string,
  isOpenClassName: string,
  isOpen: bool,
  onToggleActive: func,
  rootClassName: string,
};

export default MenuLabel;
