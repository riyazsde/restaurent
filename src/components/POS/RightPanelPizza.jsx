/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import RightPanelAll from './RightPanelAll';

const RightPanelPizza = ({ showBoxes3, setShowBoxes3, cartItems, setCartItems }) => {
    // Reuse RightPanelAll component with different props
    return (
        <RightPanelAll
            selectedDining={null}
            onDiningTypeSelect={() => {}}
            onDropdownToggle={() => {}}
            showBoxes={showBoxes3}
            setShowBoxes={setShowBoxes3}
            cartItems={cartItems}
            setCartItems={setCartItems}
        />
    );
};

export default RightPanelPizza;
