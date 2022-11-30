module.exports.handler = function () {
    return {
        body: `
            <script>
                let data = JSON.parse(atob(encodeURIComponent(window.location.hash.replace('#'))));
                window.keplr.suggestToken(data.chainId, data.contractAddress).catch(console.error)
            </script>
        `,
        statusCode: 200
    }
}