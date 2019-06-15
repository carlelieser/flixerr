"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Fade = require("react-reveal/Fade");

var _Fade2 = _interopRequireDefault(_Fade);

var _reactLazyLoad = require("react-lazy-load");

var _reactLazyLoad2 = _interopRequireDefault(_reactLazyLoad);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MovieItem = function (_React$Component) {
	_inherits(MovieItem, _React$Component);

	function MovieItem(props) {
		_classCallCheck(this, MovieItem);

		var _this = _possibleConstructorReturn(this, (MovieItem.__proto__ || Object.getPrototypeOf(MovieItem)).call(this, props));

		_this.loadImage = function () {
			_this.setState({ backdrop: "url(" + (_this.props.featured ? _this.backdropImageURL : _this.imageURL) + ")" });
		};

		_this.handleImage = function () {
			_this.image = new Image();
			_this.imageURL = "https://image.tmdb.org/t/p/w780" + _this.props.movie.poster_path;
			_this.image.src = _this.imageURL;

			_this.backdropImage = new Image();
			_this.backdropImageURL = "https://image.tmdb.org/t/p/original" + _this.props.movie.backdrop_path;
			_this.backdropImage.src = _this.backdropImageURL;

			if (_this.props.featured) {
				_this.backdropImage.onload = _this.loadImage;
			} else {
				_this.image.onload = _this.loadImage;
			}
		};

		_this.state = {
			backdrop: false,
			fontSize: 1
		};
		return _this;
	}

	_createClass(MovieItem, [{
		key: "componentDidMount",
		value: function componentDidMount() {
			this.setState({ fontSize: -0.0195 * this.props.movie.title.length + 1.6 });
		}
	}, {
		key: "componentWillUnmount",
		value: function componentWillUnmount() {
			if (this.props.featured) {
				if (this.backdropImage) {
					this.backdropImage.onload = false;
				}
			} else {
				if (this.image) {
					this.image.onload = false;
				}
			}
		}
	}, {
		key: "render",
		value: function render() {
			var _this2 = this;

			var movie = this.props.movie;

			return React.createElement(
				_Fade2.default,
				{ delay: 50, distance: "10%", bottom: true },
				React.createElement(
					"div",
					{
						className: "movie-item",
						onClick: function onClick() {
							return _this2.props.openBox(movie);
						}
					},
					React.createElement(
						"div",
						{ className: "movie-item-desc" },
						React.createElement(
							"div",
							{
								className: "movie-item-title",
								style: {
									fontSize: this.state.fontSize + "em"
								}
							},
							movie.title
						),
						React.createElement(
							"div",
							{ className: "movie-item-summary" },
							this.props.strip(movie.overview, 80) + "..."
						)
					),
					React.createElement("div", { className: "movie-item-bg" }),
					React.createElement("div", { className: "movie-item-blurred", style: {
							backgroundImage: "url(https://image.tmdb.org/t/p/" + (this.props.featured ? 'w300' : 'w92') + (this.props.featured ? this.props.movie.backdrop_path : this.props.movie.poster_path) + ")"
						} }),
					React.createElement(
						_reactLazyLoad2.default,
						{ onContentVisible: this.handleImage },
						React.createElement("div", { className: "movie-backdrop" + (this.state.backdrop ? " movie-backdrop-show" : ""), style: {
								backgroundImage: this.state.backdrop
							} })
					)
				)
			);
		}
	}]);

	return MovieItem;
}(React.Component);