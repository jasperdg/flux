(function() {
    const CONTRACT_NAME = 'flux_protocol_4';
    const DEFAULT_ENV = 'staging';

    function getConfig(env) {
        switch (env) {

            case 'production':
            case 'development':
                    return {
                        networkId: 'staging',
                        nodeUrl: 'https://staging-rpc.nearprotocol.com/',
                        contractName: CONTRACT_NAME,
                        walletUrl: 'https://near-wallet-staging.onrender.com',
                        initialBalance: 10000000000,
                    };
                return {
                    networkId: 'default',
                    nodeUrl: 'https://rpc.nearprotocol.com',
                    contractName: CONTRACT_NAME,
                    walletUrl: 'https://wallet.nearprotocol.com',
                    initialBalance: 1000000000,
                };
            case 'staging':
                return {
                    networkId: 'staging',
                    nodeUrl: 'https://staging-rpc.nearprotocol.com/',
                    contractName: CONTRACT_NAME,
                    walletUrl: 'https://near-wallet-staging.onrender.com',
                    initialBalance: 100000000,
                };
            case 'local':
                return {
                    networkId: 'local',
                    nodeUrl: 'http://localhost:3030',
                    keyPath: `${process.env.HOME}/.near/validator_key.json`,
                    walletUrl: 'http://localhost:3000/wallet',
                    contractName: CONTRACT_NAME,
                    initialBalance: 10000000000000,
                };
            case 'test':
                return {
                    networkId: 'local',
                    nodeUrl: 'http://localhost:3030',
                    contractName: CONTRACT_NAME,
                    masterAccount: 'test.near',
                    initialBalance: 100000000,
                };
            case 'test-remote':
            case 'ci':
                return {
                    networkId: 'shared-test',
                    nodeUrl: 'http://shared-test.nearprotocol.com:3030',
                    contractName: CONTRACT_NAME,
                    masterAccount: 'test.near',
                    initialBalance: 100000000,
                };
            case 'ci-staging':
                return {
                    networkId: 'shared-test-staging',
                    nodeUrl: 'http://staging-shared-test.nearprotocol.com:3030',
                    contractName: CONTRACT_NAME,
                    masterAccount: 'test.near',
                    initialBalance: 100000000,
                };
            default:
                throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`);
        }
    }

    const cookieConfig = typeof Cookies != 'undefined' && Cookies.getJSON('fiddleConfig');
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = getConfig;
    } else {
        window.nearConfig =  cookieConfig && cookieConfig.nearPages ? cookieConfig : getConfig(DEFAULT_ENV);
    }
})();
