export type UrlStatus =
  | 'unchecked'
  | 'checking'
  | 'ok'
  | '403'
  | '404'
  | 'timeout'
  | 'error';

export type SourceType = 'primary' | 'secondary';

export interface SourceCandidate {
  id: string;
  archiveId: string;
  archiveName: string;
  url: string;
  query: string;
  sourceType: SourceType;
  note: string;
  urlStatus: UrlStatus;
}

export interface InboxEntry {
  id: string;
  eventId: string | number | null;
  eventTitle: string;
  archiveName: string;
  url: string;
  query: string;
  sourceType: SourceType;
  note: string;
  urlStatus: UrlStatus;
  addedAt: string;
  userMemo: string;
}
