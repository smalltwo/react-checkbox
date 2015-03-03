'use strict';

var React  = require('react')
var assign = require('object-assign')
var hasOwn = function(obj, prop){
    return Object.prototype.hasOwnProperty.call(obj, prop)
}

var DISPLAY_NAME = 'ReactCheckbox'

function emptyFn(){}

module.exports = React.createClass({

    displayName: DISPLAY_NAME,

    propTypes: {
        nextValue: React.PropTypes.func,
        onChange : React.PropTypes.func,

        checked: React.PropTypes.any,
        defaultChecked: React.PropTypes.any,

        indeterminateValue: React.PropTypes.any,
        supportIndeterminate: React.PropTypes.bool
    },

    getDefaultProps: function() {
        return {
            'data-display-name' : DISPLAY_NAME,

            stopChangePropagation: false,
            indeterminateValue   : null,
            supportIndeterminate : false,

            defaultStyle: null,
            defaultFocusedStyle: null,
            focusedStyle: null,

            nextValue: function(oldValue, props) {
                return oldValue === props.indeterminateValue?
                        //indeterminate -> checked
                        true:
                        oldValue === true?
                            // checked -> unchecked
                            false:
                            // unchecked -> indeterminate
                            props.indeterminateValue

            }
        }
    },

    getInitialState: function() {
        return {
            defaultChecked: this.props.defaultChecked
        }
    },

    render: function() {

        var props = this.prepareProps(this.props, this.state)

        return React.createElement("input", React.__spread({type: "checkbox"},  props, {checked: this.isChecked()}))
    },

    componentDidMount: function() {
        this.checkIndeterminate()
    },

    componentDidUpdate: function() {
        this.checkIndeterminate()
    },

    checkIndeterminate: function() {
        if (this.props.supportIndeterminate){
            //it's not safe to store the prev indeterminate value
            //and only set it if isIndeterminate is different from prev indeterminate value
            //so we have to do this all the time
            this.getDOMNode().indeterminate = this.isIndeterminate()
        }
    },

    isIndeterminate: function() {

        var props         = this.props
        var checked       = this.getValue()
        var indeterminate = props.supportIndeterminate && checked === props.indeterminateValue

        return indeterminate === true
    },

    prepareProps: function(thisProps, state) {

        var props = {}

        assign(props, thisProps)

        props.style    = this.prepareStyle(props, state)
        props.onChange = this.handleChange
        props.onFocus  = this.handleFocus
        props.onBlur  = this.handleBlur

        return props
    },

    prepareStyle: function(props) {
        var defaultFocusedStyle
        var focusedStyle

        if (this.state.focused){
            defaultFocusedStyle = props.defaultFocusedStyle
            focusedStyle = props.focusedStyle
        }

        var style = assign({}, props.defaultStyle, defaultFocusedStyle, props.style, focusedStyle)

        ;(props.onStyleReady || emptyFn)(style)

        return style
    },

    handleFocus: function(event) {
        this.setState({
            focused: true
        })

        ;(this.props.onFocus || emptyFn)(event)
    },

    handleBlur: function(event) {
        this.setState({
            focused: false
        })

        ;(this.props.onBlur || emptyFn)(event)
    },

    getValue: function() {
        var props = this.props

        return hasOwn(props, 'checked')?
                    props.checked:
                    this.state.defaultChecked
    },

    isChecked: function() {
        return this.getValue() || false
    },

    handleChange: function(event) {

        var value = event.target.checked
        var props = this.props

        if (props.supportIndeterminate){
            var oldValue = this.getValue()

            if (typeof props.nextValue == 'function'){
                value = props.nextValue(oldValue, this.props)
            }
        }

        ;(props.onChange || emptyFn)(value, event)

        if (!hasOwn(props, 'checked')){
            this.setState({
                defaultChecked: value
            })
        }

        props.stopChangePropagation && event.stopPropagation()
    }
})