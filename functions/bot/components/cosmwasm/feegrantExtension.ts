
const query_1 = require("cosmjs-types/cosmos/feegrant/v1beta1/query");
import * as queryClient from '@cosmjs/stargate/build/queryclient'
export function setupFeegrantExtension(base) {
    // Use this service to get easy typed access to query methods
    // This cannot be used for proof verification
    const rpc = queryClient.createProtobufRpcClient(base);
    const queryService = new query_1.QueryClientImpl(rpc);
    return {
        feegrant: {
            allowance: async (granter, grantee) => {
                const response = await queryService.Allowance({
                    granter: granter,
                    grantee: grantee,
                });
                return response;
            },
            allowances: async (grantee, paginationKey) => {
                const response = await queryService.Allowances({
                    grantee: grantee,
                    pagination: queryClient.createPagination(paginationKey),
                });
                return response;
            },
        },
    };
}
