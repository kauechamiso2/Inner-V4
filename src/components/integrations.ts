/* Integrações conectadas nesta sessão (protótipo). As marcadas como
   notConnected no menu pedem conexão antes do primeiro uso. */
export const connectedIntegrations = new Set<string>()
export const isIntegrationReady = (item: { id: string; notConnected?: boolean }) =>
  !item.notConnected || connectedIntegrations.has(item.id)
