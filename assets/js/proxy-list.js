let ProxyList = function() {
	let request = require("axios");
	let url = "https://proxy.rudnkh.me/txt";

	let getProxies = (text) => {
		return new Promise((resolve, reject) => {
			let proxies = text.split("\n");
			for (let i = 0; i < proxies.length; i++) {
				let info = proxies[i].split(":");
				let proxy = {
					host: info[0],
					port: info[1]
				};

				proxies[i] = proxy;
			}

			resolve(proxies);
		}).catch((err) => {
			console.log(err);
		});
	};

	let listProxies = () => {
		return new Promise((resolve, reject) => {
			request.get(url).then((response) => {
				let text = response.data;
				getProxies(text)
					.then((proxies) => {
						resolve(proxies);
					})
					.catch((err) => reject(err));
			}).catch((err) => reject(err));
		}).catch((err) => {
			console.log(err);
		});
	};

	return { listProxies };
};

export default ProxyList;
