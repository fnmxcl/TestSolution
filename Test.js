function t(time, value = time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(value);
        }, time);
    });
}

    async function doIt() {
        console.time("test1");
        const v0 = await t(1000)
        const v1 = await t(3000);
        const v2 = await t(2000);
        console.timeEnd("test1");

        console.log(v0, v1, v2);
    }