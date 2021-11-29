import got, { OptionsOfBufferResponseBody, CancelableRequest, Response } from 'got';

// TODO: should accept basePath: URL | string
export async function getSettlementInitiationReport(basePath: string, settlementId: number): Promise<CancelableRequest<Response<Buffer>>> {
  const bufferResponseOpts: OptionsOfBufferResponseBody = {
    responseType: 'buffer',
    isStream: false,
    resolveBodyOnly: false,
  };
  return got.get(`${basePath}/settlementInitiation.xlsx?settlementId=${settlementId}`, {
    ...bufferResponseOpts,
  });
}

export default {
  getSettlementInitiationReport,
}
