async function loadImports() {
    const fetch = import('node-fetch');
    const fs = import('fs/promises');
    await Promise.all( [fetch, fs] );
    return { fetch, fs }
}

const {apiKey, refreshDelay} = require('./config.json');


async function getData() {
    const imports = await loadImports();
    const { fetch, fs } = await imports;


    // products currently
    const {products} = await (await fetch)('https://api.hypixel.net/skyblock/bazaar');


    for (let okey of Object.keys(products)) {

        // make sure files exist
        const key = okey.replace(/:/, '-')
        const path = `./data/${key}`

        try {
            await (await fs).stat(path);
        } catch {
            console.log('Does not exist, so writing: ' + key)
            await (await fs).writeFile(path, '')
        }

        // write the current prices to the file along with a timestamp - the number of ms
        const product = products[okey].quick_status;
        const toWrite = `${Math.floor(Date.now()/1000/60)}-${product.sellPrice}-${product.sellVolume}-${product.sellMovingWeek}-${product.sellOrders}-${product.buyPrice}-${product.buyVolume}-${product.buyMovingWeek}-${product.buyOrders}\n`

        await (await fs).appendFile(path, toWrite);
    }
    console.log('Done getting and writing data')
    
}

getData();

setInterval(() => {
    console.log('starting next batch');
    getData()
}, refreshDelay)
