async function loadImports() {
    const fetch = import('node-fetch');
    const fs = import('fs/promises');
    await Promise.all( [fetch, fs] );
    return { fetch, fs }
}

const {apiKey} = require('config.js');

async function getData() {
    const imports = await loadImports();
    const { fetch, fs } = await imports;

    async function get(endpoint, args) {

        let url = 'https://api.hypixel.net/' + endpoint + `?key=${apiKey}`
        for (let key in args) { url += `&${key}=${args[key]}` }

        const request = await ( await fetch ).default(url);
        return request.json()
    }

    // products currently
    const {products} = await get("skyblock/bazaar");


    for (let okey of Object.keys(products)) {

        // make sure files exist
        const key = okey.replace(/:/, '-')
        const path = `./data/${key}`

        try {
            await (await fs).stat(path);
        } catch {
            console.log('Does nto exist, so writing: ' + key)
            await (await fs).writeFile(path, '')
        }

        // write the current prices to the file along with a timestamp - the number of ms
        const product = products[okey].quick_status;
        const toWrite = `${Date.now()}-${product.sellPrice}-${product.sellVolume}-${product.sellMovingWeek}-${product.sellOrders}-${product.buyPrice}-${product.buyVolume}-${product.buyMovingWeek}-${product.buyOrders}\n`

        await (await fs).appendFile(path, toWrite);
    }

    setTimeout(getData, 120000);
}
getData();