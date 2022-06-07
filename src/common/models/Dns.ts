export interface DNS_BLACKLIST_DOC {
  _id: string;
  list: DNS_BLACKLIST;
}

export interface DNS_BLACKLIST {
  [url: string]: string;
}

export const DNS_DEFAULT_BLACKLIST_DATABASE = "dns_blacklist";