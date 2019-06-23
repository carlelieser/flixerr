let ProxyList = function () {
	let axios = require("axios");
	let request = axios.create({
		timeout: 4000
	});
	let url = "https://proxy.rudnkh.me/txt";

	let getProxies = (text) => {
		let proxies = text.split("\n");
		for (let i = 0; i < proxies.length; i++) {
			let info = proxies[i].split(":");
			let proxy = {
				host: info[0],
				port: info[1]
			};

			proxies[i] = proxy;
		}

		return proxies;
	};

	let listProxies = () => {
		return new Promise((resolve, reject) => {
			request.get(url).then((response) => {
				let text = response.data;
				let proxies = getProxies(text);
				resolve(proxies);
			}).catch((err) => resolve(err));
		})
	};

	return {
		listProxies
	};
};

export default ProxyList;