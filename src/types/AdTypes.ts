export type AdMediaType = 'IMAGE' | 'VIDEO';

export type Ad = {
  adId: number;
  title: string;
  mediaType: AdMediaType;
  mediaUrl: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isActive: boolean;
};

export type GetAdsResponse = {
  ads: Ad[];
  totalCount: number;
};
