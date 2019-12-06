/**
 * =========================================
 * file role: base class for validation
 * =========================================
 */
// dependencies
//  define validation class
class Validator {
  constructor () {
    this.imagMimeTypes = {
      'image/png': '.png',
      'image/jpeg': '.jpeg',
      'image/jpg': '.jpg',
      'image/webp': '.webp',
      'image/tiff': '.tif',
      'image/bmp': '.bnp',
      'image/gif': '.gif',
    };
  }
  // remove strip tags
  strip_html_tag(str) {
    if (str === null || str === '') return false;
    else str = str.toString ();
    return str.replace (/<[^>]*>/g, '');
  };
  // validate the email
  checkEmail(string, cb) {
    var elementVal = string;
    elementVal = elementVal.trim ();
    var regEx = new RegExp ('@', 'gi');
    if (elementVal !== '' || elementVal.length < 1) {
      if (cb) {
        var test = regEx.test (elementVal);
        return cb (test);
      } else {
        return regEx.test (elementVal);
      }
    }
  };
  notEmptyString(string, cb) {
    let elementVal = string !== undefined ? string : '';
    elementVal = elementVal.trim ();
    if (elementVal === '' || elementVal.length < 1) {
      if (!cb) {
        return false;
      }
      if (cb) {
        var empty = false;
        return cb (empty);
      }
    } else {
      if (cb) {
        return cb (elementVal);
      } else {
        return elementVal;
      }
    }
  };
  // method to check if the value is contains a number
  checkContainsNumber(string, count, cb) {
    var elementVal = string.trim ();
    if (typeof count === 'function' && !cb) {
      cb = count;
    }
    count = typeof count === 'number' ? count : 1;
    var numArr = [];
    if (elementVal !== '' || elementVal.length < 1) {
      Array.from (elementVal).forEach (function (letter) {
        if (Number.isInteger (Number (letter))) {
          numArr.push (letter);
        }
      });
      if (numArr.length === count) {
        let result = true;
        if (cb) {
          return cb (result);
        } else {
          return result;
        }
      } else {
        let result = false;
        if (cb) {
          return cb (result);
        } else {
          return result;
        }
      }
    }
  };
  // method to check if the input is Object
  isObject(obj) {
    if (typeof obj == 'object') {
      return obj;
    } else {
      return false;
    }
  };
  // method to check if the object is not empty
  notEmpty(obj) {
    if (Object.keys (obj).length > 0) {
      return obj;
    } else {
      return false;
    }
  };
  // method to check if the input is string
  isString(str) {
    if (typeof str === 'string') {
      return str;
    } else {
      return false;
    }
  };
  // method to check if the input is number
  checkIsNumber(element, cb) {
    var elementVal = element;
    if (elementVal !== '') {
      var testNumber = Number.isInteger (Number (elementVal));
      if (cb) {
        return cb (testNumber);
      } else {
        return testNumber;
      }
    }
  };
  // method to validate all types of inputs
  validateRequired (inputs) {
    // define validation result
    const validations = [];
    // loop through data array
    for (let input of inputs) {
      if (input.type == 'string-number') {
        if (
          this.validation.isString (input.data) &&
          this.validation.notEmptyString (input.data)
        ) {
          // continue
        } else {
          if (Number.isNaN (input.data - input.data)) {
            let result = {
              message: input.message ||
                `${input.name} is required and should be string or number`,
              fieldName: input.name,
            };
            // push the result into validations array
            validations.push (result);
          }
        }
      }
      // check if type of input is string
      if (input.type == 'string') {
        if (
          this.validation.isString (input.data) &&
          this.validation.notEmptyString (input.data)
        ) {
          // continue
        } else {
          let result = {
            message: input.message ||
              `${input.name} is required and should be a valid ${input.type}`,
            fieldName: input.name,
          };
          validations.push (result);
        }
      }
      // method to check if the input is number
      if (input.type == 'number') {
        if (Number.isNaN (input.data - input.data)) {
          let result = {
            message: input.message ||
              `${input.name} is required and should be a valid ${input.type}`,
            fieldName: input.name,
          };
          // push the result into validations array
          validations.push (result);
        }
      }
      // check if type of input is object
      if (input.type == 'object') {
        if (
          this.validation.isObject (input.data) &&
          this.validation.notEmpty (input.data)
        ) {
          // continue
        } else {
          let result = {
            message: input.message ||
              `${input.name} is required and should be an ${input.type}`,
            fieldName: input.name,
          };
          validations.push (result);
        }
      }
      // check if the input is email
      if (input.type == 'email') {
        // continue
        if (
          this.validation.isString (input.data) &&
          this.validation.notEmptyString (input.data) &&
          this.validation.checkEmail (input.data)
        ) {
          // continue
        } else {
          let result = {
            message: input.message ||
              `${input.name} is required and should be a valid ${input.type}`,
            fieldName: input.name,
          };
          validations.push (result);
        }
      }
      // check if the input is phone number
      if (input.type == 'phone') {
        if (
          this.validation.isString (input.data) &&
          this.validation.notEmptyString (input.data) &&
          input.data.length == 11 &&
          input.data.startsWith ('0')
        ) {
          // continue
        } else {
          let result = {
            message: input.message ||
              `${input.name} is required and should be a valid ${input.type}, with 11 digit`,
            fieldName: input.name,
          };
          validations.push (result);
        }
      }
      // check if the type is file
      if (input.type == 'image') {
        // check if there are data
        if (!input.data) {
          // return error
          let result = {
            message: input.message ||
              `${input.name} is required and should be an ${input.type}`,
            fieldName: input.name,
          };
          // push validation errors into validations array
          validations.push (result);
        } else {
          // check if the mime type is image
          if (this.imagMimeTypes[input.data.mimetype]) {
            // continue
          } else {
            let result = {
              message: input.message ||
                `${input.name} should be an ${input.type}`,
              fieldName: input.name,
            };
            validations.push (result);
          }
        }
      }
      if (input.type == 'array') {
        if (Array.isArray (input.data) && input.data.length > 0) {
          // continue
        } else {
          let result = {
            message: input.message ||
              `${input.name} should be an ${input.type} and shouldn't be empty`,
            fieldName: input.name,
          };
          validations.push (result);
        }
      }
      // check the object has two properties
      if (input.type == 'object' && input.length == '>=2') {
        if (
          this.validation.isObject (input.data) &&
          this.validation.notEmpty (input.data) &&
          Object.keys (input.data).length >= 2
        ) {
          // continue
        } else {
          let result = {
            message: input.message ||
              `${input.name} should be an ${input.type} and shouldn't be empty`,
            fieldName: input.name,
          };
          validations.push (result);
        }
      }
      if (input.type == 'boolean') {
        if (input.data == true || input.data == false) {
          // continue
        } else {
          let result = {
            message: input.message || `${input.name} should be a ${input.type}`,
            fieldName: input.name,
          };
          validations.push (result);
        }
      }
    }
    // return validations array
    return validations;
  }
  // method to validate optional fields
  validateOptional (inputs) {
    const validations = [];
    // loop through data array
    for (let input of inputs) {
      // check if the type of input is number
      if (input.type == 'number') {
        // check if the input is exist
        if (input.data && Number.isNaN (input.data - input.data)) {
          let result = {
            message: input.message ||
              `${input.name} should be an ${input.type}`,
            fieldName: input.name,
          };
          validations.push (result);
        }
      }
    }
    // return validations errors
    return validations;
  }
  cleanString(str) {
    return this.strip_html_tag(str);
  }
}

// export validation class
export default new Validator ();
