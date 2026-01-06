export type AdMediaType = 'IMAGE' | 'VIDEO';

export type Ad = {
  adId: number;
  title: string;
  mediaType: AdMediaType;
  mediaUrl: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isActive: boolean;

  // Optional targeting fields when backend joins ad_target_rule
  ageGroup?: string | null;
  gender?: string | null;
  targetRules?: Array<{
    ageGroup?: string | null;
    gender?: string | null;
  }>;
};

export type GetAdsResponse = {
  ads: Ad[];
  totalCount: number;
};
