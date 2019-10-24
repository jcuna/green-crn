/**
 * Created by Jon on 9/21/16.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FORM_VALIDATION, VALIDATE_FUNC_SUFFIX, VALIDATE_TRANSFORM_FUNC } from '../constants';
import { dateToDatetimeString } from './helpers';

class FormGenerator extends React.Component {
    constructor(props) {
        super(props);

        const references = {};
        const onChangeCall = {};
        const transformable = {};
        const parts = [];
        if (props.elements) {
            parts.push(props.elements);
        }

        if (props.sections) {
            props.sections.forEach(section => {
                if (section.elements) {
                    parts.push(section.elements);
                }
                if (section.wrapper) {
                    section.wrapper.sections.forEach(nestedSection => parts.push(nestedSection.elements));
                }
            });
        }

        parts.forEach(part => part.forEach(element => {
            if (React.isValidElement(element)) {
                return;
            }

            let isTransformable = false;

            if (typeof element.validate === 'object') {
                isTransformable = element.validate.includes(FORM_VALIDATION.PHONE);
            } else if (typeof element.validate === 'string') {
                isTransformable = element.validate === FORM_VALIDATION.PHONE;
            }
            transformable[element.name] = isTransformable;
            references[element.name] = FormGenerator.getInitialValidationValue(element, isTransformable);
            onChangeCall[element.name] = element.onChange;
        }));
        this.state = {
            transformable,
            references,
            onChangeCall,
            currentEvent: null,
        };
    }

    /**
     *
     * @returns {*}
     */
    render() {
        return this.generateForm(
            this.props.elements,
            this.props.sections,
            this.props.formName,
            this.props.button,
            this.props.className || 'form-section'
        );
    }

    componentDidUpdate(prevProps, prevState) {
        const refKeys = Object.keys(this.state.references);

        refKeys.forEach(key => {
            if (typeof key !== 'undefined' && this.state.references[key].value !== prevState.references[key].value) {
                const references = { ...this.state.references };

                refKeys.forEach(item => {
                    if (this.state.transformable[item]) {
                        references[item].value = FormGenerator.transformValue(references[item]);
                    }
                });

                this.state.onChangeCall[[key]] &&
                this.state.onChangeCall[key](this.state.currentEvent, references);
            }
        });
    }

    static transformValue(reference) {
        /**
         * for now there's only one transformable
         */
        return reference.value.replace(/\D/g, '');
    }

    /**
     * @private
     *
     * @param {array} elements
     * @param {array} sections
     * @param {string} formName
     * @param {object} button
     * @param {string} sectionClass
     * @returns {*}
     */
    generateForm(elements, sections, formName, button, sectionClass) {
        return React.createElement(
            'form',
            {
                className: formName,
                onSubmit: event => {
                    event.preventDefault();
                    this.props.onSubmit(event, this.state.references);
                }
            },
            sections && this.getFormSections(sections, sectionClass),

            React.createElement('section', { className: sectionClass },
                elements && elements.map((element, k) => {
                    if (React.isValidElement(element)) {
                        return element;
                    }
                    return this.createInputElement(element, k);
                }),
                this.props.inlineSubmit && FormGenerator.getSubmitButton(button)
            ),
            !this.props.inlineSubmit && typeof button !== 'undefined' && FormGenerator.getSubmitButton(button)
        );
    }

    getFormSections(sections, sectionClass = '') {
        return sections.map((section, k) => {
            if (section.wrapper) {
                return <section key={ k } className={ (section.wrapper.className || '') }>
                    { section.wrapper.sections.map((nestedSection, i) => this.getSection(nestedSection, i)) }
                </section>;
            }
            return this.getSection(section, k, sectionClass);
        });
    }
    getSection(section, k, sectionClass = '') {
        return <section key={ k } className={ section.className || '' }>
            <div className={ (section.elementsWrapperClass || '') }>
                <div className={ 'card' }>
                    <div className="card-header">
                        { section.title }
                    </div>
                    <div className={ 'card-body ' + sectionClass +
                    (section.cardBodyClass && ' ' + section.cardBodyClass || '') }>
                        { section.elements.map((element, key) => {
                            if (React.isValidElement(element)) {
                                return element;
                            }
                            return this.createInputElement(element, key);
                        })}
                    </div>
                </div>
            </div>
        </section>;
    }

    static getSubmitButton(button) {
        let className = 'form-group';

        if (button.className) {
            className += ` ${button.className}`;
        }

        return React.createElement(
            'div',
            { className },
            React.createElement(
                'button', { ...button, className: `btn btn-${ button.type || 'primary' }` },
                button.value || 'Submit',
            ),
        );
    }

    createInputElement(element, key) {
        const isMultiCol = FormGenerator.colForm(element);
        const formElement = typeof element.formElement === 'undefined' ? 'input' : element.formElement;
        const reference = FormGenerator.getReference(element);
        const labelBefore = element.type !== 'radio' && element.type !== 'checkbox';

        const children = [];

        if (element.label && labelBefore) {
            children.push(React.createElement('label', { htmlFor: element.name, key: 1 }, element.label));
        }
        children.push(React.createElement(
            formElement, {
                key: 2,
                type: element.type,
                name: element.name,
                id: element.id,
                htmlFor: element.for,
                placeholder: element.placeholder,
                className: FormGenerator.getClassName(element, isMultiCol),
                onChange: this.bindValidate(element, element.ref),
                ref: element.ref,
                reference,
                value: element.value,
                defaultValue: this.state.references[element.name].value,
                defaultChecked: element.checked,
                disabled: element.disabled || false,
                readOnly: element.readOnly || false,
                autoComplete: element.autoComplete
            },
            element.options && this.getSecondParam(element)
        ));
        if (element.label && !labelBefore) {
            children.push(React.createElement('label', { htmlFor: element.name, key }, element.label));
        }
        return <div key={ key } className={ FormGenerator.getParentClassName(element, isMultiCol) }>{ children }</div>;
    }

    static getInitialValidationValue(element, isTransformable) {
        let isValid = true;
        const isArray = typeof element.validate === 'object';
        const isEmpty = typeof element.defaultValue === 'undefined' || element.defaultValue === '';
        let value = typeof element.defaultValue === 'undefined' ? '' : element.defaultValue;
        const isString = typeof element.validate === 'string';

        if ((isArray && element.validate.indexOf(FORM_VALIDATION.REQUIRED) > -1 || isString &&
            element.validate === FORM_VALIDATION.REQUIRED) && isEmpty) {
            isValid = false;
        }
        if (!isEmpty && isTransformable && (typeof element.defaultValue !== 'undefined' || element.defaultValue !== '')) {
            if (isArray) {
                element.validate.forEach(method => {
                    if (typeof FormGenerator[method + VALIDATE_TRANSFORM_FUNC] === 'function') {
                        value = FormGenerator[method + VALIDATE_TRANSFORM_FUNC](value);
                    }
                });
            } else if (isString) {
                value = FormGenerator[element.validate + VALIDATE_TRANSFORM_FUNC](value);
            }
        }
        return {
            isValid,
            value,
        };
    }

    setElementState(key, isValid, event) {
        let value = '';

        if (event.target.type === 'radio' || event.target.type === 'checkbox') {
            value = event.target.checked;
        } else if (event.target.type === 'date') {
            value = dateToDatetimeString(event.target.value);
        } else {
            value = event.target.value;
        }

        const currentReferences = { ...this.state.references, [key]: {
            isValid,
            value,
        }};

        event.persist();

        this.setState({
            references: currentReferences,
            currentEvent: event,
        });
    }

    bindValidate(element) {
        return (event) => {
            if (typeof element.validate === 'function') {
                const isValid = element.validate(event);

                this.setElementState(element.name, isValid, event);
                FormGenerator.updateElementValidate(event, isValid);
            } else if (typeof element.validate === 'object') {
                /**
                 |_____________________________________________________________________________
                 | when we have many validation methods to run, we want to run required        |
                 | last since other methods will not validate if empty                         |
                 | @type {boolean}                                                             |
                 |_____________________________________________________________________________|
                 */
                let hasRequiredFunc = false;

                let isValid = true;

                for (const strFunction of element.validate) {
                    if (strFunction === FORM_VALIDATION.REQUIRED) {
                        hasRequiredFunc = true;
                    } else {
                        isValid = this.runValidateFunction(strFunction, event, element);

                        if (!isValid) {
                            break;
                        }
                    }
                }
                if (hasRequiredFunc && isValid) {
                    this.runValidateFunction(FORM_VALIDATION.REQUIRED, event, element);
                }
            } else if (typeof element.validate === 'string') {
                this.runValidateFunction(element.validate, event, element);
            } else {
                this.setElementState(element.name, true, event);
            }
        };
    }

    runValidateFunction(inputFunc, event, element) {
        let extraArgs = [];

        let strFunction = inputFunc;

        if (inputFunc.indexOf(':') > -1) {
            const parts = inputFunc.split(':');

            strFunction = parts.shift();
            extraArgs = inputFunc.split(`${strFunction}:`).filter(el => el !== '');
        }

        if (typeof FormGenerator[strFunction + VALIDATE_FUNC_SUFFIX] === 'function') {
            const isValid = FormGenerator[strFunction + VALIDATE_FUNC_SUFFIX](event, extraArgs);

            this.setElementState(element.name, isValid, event);
            FormGenerator.updateElementValidate(event, isValid);
            return isValid;
        }

        throw new Error(`Invalid validate function: ${strFunction}`);
    }

    static updateElementValidate(event, isValid) {
        if (typeof isValid !== 'boolean') {
            throw new Error(
                'Invalid type returned by validation function. Must return a boolean indicating validity.'
            );
        }
        if (isValid) {
            FormGenerator.removeErrorClass(event);
        } else {
            FormGenerator.addErrorClass(event);
        }
    }

    static addErrorClass({ target }) {
        if (!target.classList.contains('is-invalid')) {
            target.classList.add('is-invalid');
        }
    }

    static removeErrorClass({ target }) {
        if (target.classList.contains('is-invalid')) {
            target.classList.remove('is-invalid');
        }
    }

    static getParentClassName(element, isMultiCol) {
        if (isMultiCol) {
            return element.className + ' ' + 'row-item';
        } else if (element.type === 'checkbox' || element.type === 'radio') {
            return 'form-check';
        }
        return 'form-group';
    }

    static colForm(element) {
        return typeof element.className !== 'undefined' && element.className.includes('col-');
    }

    static getClassName(element, multiForm = false) {
        let className = '';

        if (element.type === 'checkbox' || element.type === 'radio') {
            className = 'form-check-input';
        } else if (element.formElement !== 'label') {
            className = 'form-control';
        }

        if (!multiForm && element.className) {
            className += ' ' + element.className;
        }

        return className;
    }

    static getReference(key) {
        return key.name.replace(/[^\w]/g, '_').toLowerCase();
    }

    getSecondParam(element) {
        return element.options.map((val, p) => {
            if (Array.isArray(val)) {
                return React.createElement('option', { value: p, key: p }, val);
            }
            return React.createElement('option', { value: val.value, key: val.value }, val.label);
        });
    }

    static get alpha_num_re() {
        return '^[a-zA-Z0-9_]*$';
    }

    static get email_re() {
        return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    }

    static get phone_re() {
        return /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    }

    static elementsShape = {
        elements: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string.required,
            formElement: PropTypes.string,
            type: PropTypes.string,
            placeholder: PropTypes.string,
            className: PropTypes.string,
            htmlFor: PropTypes.string,
            onChange: PropTypes.func,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            disabled: PropTypes.bool,
            readOnly: PropTypes.bool,
            validate: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.func,
                PropTypes.arrayOf(PropTypes.string),
            ]),
        })),
    };

    static propTypes = {
        formName: PropTypes.string.isRequired,
        onSubmit: PropTypes.func,
        inlineSubmit: PropTypes.bool,
        sections: PropTypes.arrayOf(PropTypes.shape({
            elementsWrapperClass: PropTypes.string,
            className: PropTypes.string,
            cardBodyClass: PropTypes.string,
            title: PropTypes.string,
            elements: FormGenerator.elementsShape.elements,
            wrapper: PropTypes.shape({
                className: PropTypes.string,
                sections: PropTypes.arrayOf(PropTypes.shape({
                    elementsWrapperClass: PropTypes.string,
                    className: PropTypes.string,
                    cardBodyClass: PropTypes.string,
                    title: PropTypes.string,
                    elements: FormGenerator.elementsShape.elements,
                    wrapper: PropTypes.shape({
                        className: PropTypes.string,
                        sections: PropTypes.array.isRequired, // same as parents sections without the wrapper
                    }),
                })),
            }),
        })),
        elements: FormGenerator.elementsShape.elements,
        button: PropTypes.object,
        className: PropTypes.string,
    };
}

FormGenerator[FORM_VALIDATION.NUMBER + VALIDATE_FUNC_SUFFIX] = ({ target }) => {
    if (target.value.replace(' ', '') !== '') {
        return !isNaN(target.value);
    }
    return true;
};

FormGenerator[FORM_VALIDATION.REQUIRED + VALIDATE_FUNC_SUFFIX] = ({ target }) => {
    return target.value.replace(' ', '') !== '' && Number(target.value) !== 0;
};

FormGenerator[FORM_VALIDATION.ALPHA_NUM + VALIDATE_FUNC_SUFFIX] = ({ target }) => {
    if (target.value.replace(' ', '') !== '') {
        return new RegExp(FormGenerator.alpha_num_re).test(target.value);
    }
    return true;
};

FormGenerator[FORM_VALIDATION.EMAIL + VALIDATE_FUNC_SUFFIX] = ({ target }) => {
    if (target.value.replace(' ', '') !== '') {
        return FormGenerator.email_re.test(String(target.value).toLowerCase());
    }
    return true;
};

FormGenerator[FORM_VALIDATION.NO_SPACE + VALIDATE_FUNC_SUFFIX] = ({ target }) => {
    return target.value.indexOf(' ') === -1;
};

FormGenerator[FORM_VALIDATION.PHONE + VALIDATE_FUNC_SUFFIX] = ({ target }) => {
    if (target.value.replace(' ', '') !== '') {
        if (FormGenerator.phone_re.test(target.value)) {
            target.value = FormGenerator[FORM_VALIDATION.PHONE + VALIDATE_TRANSFORM_FUNC](target.value);
            return true;
        }
        return false;
    }
    return true;
};

FormGenerator[FORM_VALIDATION.PHONE + VALIDATE_TRANSFORM_FUNC] = (value) => {
    return value.replace(FormGenerator.phone_re, '($1) $2-$3');
};

FormGenerator[FORM_VALIDATION.REGEX + VALIDATE_FUNC_SUFFIX] = ({ target }, regexArr) => {
    if (regexArr.length === 0) {
        throw new Error('No regex passed to regex function, use regex:exp');
    }
    if (target.value.replace(' ', '') !== '') {
        return new RegExp(regexArr[0]).test(target.value);
    }
    return true;
};

/**
 * Call like: validate: 'required:min:max', i.e. required:4:10 - the second arg is optional.
 *
 * @param {object} target
 * @param {array} args
 * @return {boolean}
 */
FormGenerator[FORM_VALIDATION.LENGTH + VALIDATE_FUNC_SUFFIX] = ({ target }, args) => {
    if (target.value.replace(' ', '') !== '') {
        if (target.value.length < Number(args[0])) {
            return false;
        }
        if (args[1] && target.value.length > Number(args[1])) {
            return false;
        }
    }
    return true;
};

export default FormGenerator;
