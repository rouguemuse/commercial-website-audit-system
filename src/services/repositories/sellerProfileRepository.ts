import { db } from '../db';
import type { SellerProfile, ServiceOffering } from '../../types/sellerProfile';

const PRIMARY_PROFILE_ID = 'seller_profile_primary';

export const sellerProfileRepository = {
  /**
   * Returns the primary active seller profile, or undefined if none configured yet.
   */
  async getActive(): Promise<SellerProfile | undefined> {
    const list = await db.sellerProfiles.toArray();
    if (list.length === 0) return undefined;
    const active = list.find(p => p.isActive);
    return active || list[0];
  },

  /**
   * Retrieves profile by ID.
   */
  async getById(id: string): Promise<SellerProfile | undefined> {
    return db.sellerProfiles.get(id);
  },

  /**
   * Retrieves all profiles (supporting future multi-profile capability).
   */
  async getAll(): Promise<SellerProfile[]> {
    return db.sellerProfiles.toArray();
  },

  /**
   * Saves or updates a seller profile.
   */
  async save(profile: SellerProfile): Promise<void> {
    profile.updatedAt = new Date().toISOString();
    await db.sellerProfiles.put(profile);
  },

  /**
   * Deletes a profile by ID.
   */
  async delete(id: string): Promise<void> {
    await db.sellerProfiles.delete(id);
  },

  /**
   * Factory function that constructs an empty, validated profile structure.
   * Does NOT populate fake dummy services.
   */
  createDefault(initial?: Partial<SellerProfile>): SellerProfile {
    const now = new Date().toISOString();
    return {
      id: initial?.id || PRIMARY_PROFILE_ID,
      sellerName: initial?.sellerName || '',
      businessName: initial?.businessName || '',
      websiteUrl: initial?.websiteUrl || '',
      primaryRole: initial?.primaryRole || 'freelancer',
      customRoleTitle: initial?.customRoleTitle || '',
      tagline: initial?.tagline || '',
      servicesOffered: initial?.servicesOffered || [],
      servicesNotOffered: initial?.servicesNotOffered || [],
      idealClientProfile: initial?.idealClientProfile || {
        preferredIndustries: [],
        preferredClientTypes: [],
        minProjectBudget: undefined,
        idealProjectSize: '',
        geographicPreferences: '',
        engagementNotes: ''
      },
      proofPoints: initial?.proofPoints || [],
      outreachPreferences: initial?.outreachPreferences || {
        tonePreset: 'direct_consultative',
        customToneGuidance: '',
        preferredChannels: ['Email', 'LinkedIn'],
        preferredCtaStyle: 'Low-friction conversation / 10-min review',
        phrasesToAvoid: [],
        generalNotes: ''
      },
      isActive: true,
      createdAt: initial?.createdAt || now,
      updatedAt: now
    };
  }
};
