import React from 'react';
import PropTypes from 'prop-types';

import {FormLabel, FormControl,  OutlinedInput } from '@mui/material';

const Input = ({ onChange, placeholder, style, defaultValue, value, label,type }) => (
  <FormControl >
    {label && <FormLabel>{label}</FormLabel>}
    <OutlinedInput 
    sx={{borderRadius:"5px",...style}}
      onChange={onChange} 
      placeholder={placeholder} 
      defaultValue={defaultValue} 
      value={value} 
      type={type}
    />
  </FormControl>
);

Input.propTypes = {
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  type:PropTypes.string,
  style: PropTypes.object,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  label: PropTypes.string
};

Input.defaultProps = {
  style: {},
  defaultValue: '',
  value: '',
  label: ''
};

export default Input;
