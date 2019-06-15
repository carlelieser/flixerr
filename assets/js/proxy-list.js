process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

let proxyList = (function () {
    let request = require('request');
    let cheerio = require('cheerio');
    let url = 'https://proxy.rudnkh.me/txt';

    let getProxies = (text) => {
        return new Promise((resolve, reject) => {
            let proxies = text.split('\n');
            for(let i = 0; i < proxies.length; i++){
                let info = proxies[i].split(':');
                let proxy = {
                    ip: info[0],
                    port: info[1]
                }

                proxies[i] = proxy;
            }

            resolve(proxies)

        }).catch(err => {
            console.log(err);
        });
    }

    let listProxies = () => {
        return new Promise((resolve, reject) => {
            request(url, (err, response, text) => {
                if (!err) {
                    getProxies(text).then(proxies => {
                        resolve(proxies);
                    }).catch(err => reject);
                }else{
                    reject(err);
                }
            });
        }).catch(err => {
            console.log(err);
        });
    }

    return {listProxies}
})();