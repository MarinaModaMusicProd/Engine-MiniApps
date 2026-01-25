let customAuthEndpoint: string | undefined;

export function setCustomEchoAuthEndpoint(endpoint: string) {
  customAuthEndpoint = endpoint;
}

export function getCustomEchoAuthEndpoint() {
  return customAuthEndpoint;
}
