"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _uniqid = require("uniqid");

var _uniqid2 = _interopRequireDefault(_uniqid);

var _movieItem = require("./movie-item");

var _movieItem2 = _interopRequireDefault(_movieItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SearchContainer = function (_Component) {
	_inherits(SearchContainer, _Component);

	function SearchContainer(props) {
		_classCallCheck(this, SearchContainer);

		return _possibleConstructorReturn(this, (SearchContainer.__proto__ || Object.getPrototypeOf(SearchContainer)).call(this, props));
	}

	_createClass(SearchContainer, [{
		key: "shouldComponentUpdate",
		value: function shouldComponentUpdate(nextProps, nextState) {
			if (nextProps.searchContent === this.props.searchContent) {
				return false;
			} else {
				return true;
			}
		}
	}, {
		key: "componentDidUpdate",
		value: function componentDidUpdate(prevProps, prevState) {
			if (prevProps.searchContent !== this.props.searchContent) {
				this.props.setHeader(this.props.searchContent);
			}
		}
	}, {
		key: "componentDidMount",
		value: function componentDidMount() {
			this.props.setHeader(this.props.searchContent);
		}
	}, {
		key: "render",
		value: function render() {
			var _this2 = this;

			var searchContent = this.props.searchContent.$$typeof ? this.props.searchContent : this.props.searchContent.map(function (movie) {
				return _react2.default.createElement(_movieItem2.default, {
					key: (0, _uniqid2.default)(),
					movie: movie,
					fallback: true,
					openBox: _this2.props.openBox
				});
			});

			return _react2.default.createElement(
				"div",
				{ className: "search-container" },
				this.props.searchContent.$$typeof ? "" : _react2.default.createElement(
					"div",
					{ className: "search-title" },
					"Search Results (" + this.props.searchContent.length + ")"
				),
				_react2.default.createElement(
					"div",
					{ className: "search-results" },
					searchContent
				)
			);
		}
	}]);

	return SearchContainer;
}(_react.Component);

exports.default = SearchContainer;