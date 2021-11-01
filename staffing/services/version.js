class Version {
    static check() {
        console.log('The local script is version: ', version);
        return new Promise(resolve =>
            GM_xmlhttpRequest({
                method: 'GET',
                url: updateURL,
                onload: response => {
                    const source = response.responseText;
                    const versionMatches = source.match(/\/\/\s+@version\s+([0-9.]+)/i);
                    const remoteVersion = versionMatches ? versionMatches[1] : false;
                    if (remoteVersion) {
                        console.log('The remote script is version: ', remoteVersion);
                        if (remoteVersion > version) {
                            alert(`You are using an outdated version of the script. Please update it using the following URL:\n${updateURL}`);
                            return resolve(false);
                        }
                    } else console.log('Version metadata not found.');
                    return resolve(true);
                }
            }));
    }
}