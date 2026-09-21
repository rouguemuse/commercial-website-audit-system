import { db } from '../db';
import type { Company, CompanyWithStats, CompanyRelationshipType } from '../../types/company';

export const companyRepository = {
  /**
   * Retrieves all companies, sorted by most recently updated.
   */
  async getAll(includeArchived = false): Promise<Company[]> {
    let list = await db.companies.toArray();
    if (!includeArchived) {
      list = list.filter(c => !c.isArchived);
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  /**
   * Retrieves companies enriched with their analysis count, latest analysis, and linked audit details.
   */
  async getAllWithStats(includeArchived = false): Promise<CompanyWithStats[]> {
    const companies = await this.getAll(includeArchived);
    const allAnalyses = await db.companyAnalyses.toArray();
    const allAudits = await db.audits.toArray();

    return companies.map(comp => {
      const compAnalyses = allAnalyses
        .filter(a => a.companyId === comp.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const latestAnalysis = compAnalyses[0];
      let latestAuditScoreFormatted: string | undefined;
      let latestAuditDate: string | undefined;

      if (latestAnalysis?.auditId) {
        const linkedAudit = allAudits.find(aud => aud.id === latestAnalysis.auditId);
        if (linkedAudit) {
          latestAuditDate = linkedAudit.updatedAt || linkedAudit.createdAt;
          // Calculate score formatted
          let scoreSum = 0;
          let hasScore = false;
          Object.values(linkedAudit.scores || {}).forEach(s => {
            if (typeof s.score === 'number') {
              scoreSum += s.score;
              hasScore = true;
            }
          });
          if (hasScore) {
            latestAuditScoreFormatted = `${scoreSum} / 60`;
          }
        }
      }

      return {
        ...comp,
        analysesCount: compAnalyses.length,
        latestAnalysis,
        latestAuditScoreFormatted,
        latestAuditDate
      };
    });
  },

  /**
   * Retrieves single company by ID.
   */
  async getById(id: string): Promise<Company | undefined> {
    return db.companies.get(id);
  },

  /**
   * Saves or updates a company record.
   */
  async save(company: Company): Promise<void> {
    company.updatedAt = new Date().toISOString();
    await db.companies.put(company);
  },

  /**
   * Archives a company without deleting historical audits or analyses.
   */
  async archive(id: string): Promise<void> {
    const comp = await db.companies.get(id);
    if (!comp) return;
    comp.isArchived = true;
    comp.updatedAt = new Date().toISOString();
    await db.companies.put(comp);
  },

  /**
   * Unarchives a company.
   */
  async unarchive(id: string): Promise<void> {
    const comp = await db.companies.get(id);
    if (!comp) return;
    comp.isArchived = false;
    comp.updatedAt = new Date().toISOString();
    await db.companies.put(comp);
  },

  /**
   * Transitions relationship type (e.g. Prospect -> Existing Client)
   * while preserving company ID, notes, and analysis history.
   */
  async updateRelationship(id: string, relationshipType: CompanyRelationshipType, clientSince?: string): Promise<void> {
    const comp = await db.companies.get(id);
    if (!comp) return;
    comp.relationshipType = relationshipType;
    if (clientSince) {
      comp.clientSince = clientSince;
    } else if (relationshipType === 'existing_client' && !comp.clientSince) {
      comp.clientSince = new Date().toISOString().split('T')[0];
    }
    comp.updatedAt = new Date().toISOString();
    await db.companies.put(comp);
  },

  /**
   * Safe deletion: Deletes company and its analysis wrappers,
   * but explicitly preserves independent historical audit records.
   */
  async delete(id: string): Promise<void> {
    // Delete company analysis wrapper records only
    await db.companyAnalyses.where('companyId').equals(id).delete();
    await db.companies.delete(id);
  },

  /**
   * Factory function to create a validated Company object.
   */
  create(data: Partial<Company>): Company {
    const now = new Date().toISOString();
    const cleanId = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      id: data.id || cleanId,
      name: data.name || '',
      websiteUrl: data.websiteUrl || '',
      relationshipType: data.relationshipType || 'prospect',
      industry: data.industry || '',
      location: data.location || '',
      primaryContact: data.primaryContact || {},
      clientSince: data.clientSince,
      engagementNotes: data.engagementNotes || '',
      notes: data.notes || '',
      isArchived: false,
      createdAt: data.createdAt || now,
      updatedAt: now
    };
  }
};
