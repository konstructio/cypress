const axios = require('axios');
const url: string = process.argv[2];
const totalDuration: number = Number(process.argv[3]);
const interval: number = 1000;
const startTime: number = Date.now();
async function checkStatus(): Promise<void> {
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            console.log(JSON.stringify({ code: 0, status: response.status }));
            process.exit(0);
        }
    } catch (error) {
        
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async function main(): Promise<void> {
    while (true) {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime > totalDuration) {
            console.log(JSON.stringify({ code: 1, status: null, error: 'Timed out' }));
            process.exit(1);
        }

        await checkStatus();
        await sleep(interval);
    }
})();
