import React from 'react';
//import classnames
import classnames from 'classnames';
import PropTypes from 'prop-types';

//This file has a lot of properties: which are passed in
const SelectListGroup = ({
  name,
  value,
  error,
  info,
  onChange,
  //Step 1: we need this new one
  options
}) => {
  //Step 2: pull options out of the options array
  const selectOptions = options.map(option => (
    <option key={option.label} value={option.value}>
      {option.label}
    </option>
  ));

  return (
    <div className="form-group">
      <select
        // Modfied this part for Redux
        className={classnames('form-control form-control-lg', {
          'is-invalid': error
        })}
        name={name}
        // Step 3: link this input to that state value
        value={value}
        onChange={onChange}
      >
        {selectOptions}
      </select>
      {info && <small className="form-text text-muted"> {info}</small>}
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

SelectListGroup.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  info: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired
};

export default SelectListGroup;
