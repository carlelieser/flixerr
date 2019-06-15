"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var ProxyList = function ProxyList() {
	var request = require("axios");
	var url = "https://proxy.rudnkh.me/txt";

	var getProxies = function getProxies(text) {
		return new Promise(function (resolve, reject) {
			var proxies = text.split("\n");
			for (var i = 0; i < proxies.length; i++) {
				var info = proxies[i].split(":");
				var proxy = {
					host: info[0],
					port: info[1]
				};

				proxies[i] = proxy;
			}

			resolve(proxies);
		}).catch(function (err) {
			console.log(err);
		});
	};

	var listProxies = function listProxies() {
		return new Promise(function (resolve, reject) {
			request.get(url).then(function (response) {
				var text = response.data;
				getProxies(text).then(function (proxies) {
					resolve(proxies);
				}).catch(function (err) {
					return reject(err);
				});
			}).catch(function (err) {
				return reject(err);
			});
		}).catch(function (err) {
			console.log(err);
		});
	};

	return { listProxies: listProxies };
};

exports.default = ProxyList;