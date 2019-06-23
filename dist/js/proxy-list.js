"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var ProxyList = function ProxyList() {
	var axios = require("axios");
	var request = axios.create({
		timeout: 4000
	});
	var url = "https://proxy.rudnkh.me/txt";

	var getProxies = function getProxies(text) {
		var proxies = text.split("\n");
		for (var i = 0; i < proxies.length; i++) {
			var info = proxies[i].split(":");
			var proxy = {
				host: info[0],
				port: info[1]
			};

			proxies[i] = proxy;
		}

		return proxies;
	};

	var listProxies = function listProxies() {
		return new Promise(function (resolve, reject) {
			request.get(url).then(function (response) {
				var text = response.data;
				var proxies = getProxies(text);
				resolve(proxies);
			}).catch(function (err) {
				return resolve(err);
			});
		});
	};

	return {
		listProxies: listProxies
	};
};

exports.default = ProxyList;