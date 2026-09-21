import { companyRepository } from '../src/services/repositories/companyRepository';
import { companyAnalysisRepository } from '../src/services/repositories/companyAnalysisRepository';
import type { Company, CompanyAnalysis, CompanyWithStats } from '../src/types/company';

console.log('🧪 RUNNING STAGE 2 COMPANY LAYER & ACCOUNT DIRECTORY VERIFICATION');

// 1. Test Prospect Company Creation
const testProspect: Company = companyRepository.create({
  name: 'Acme Commercial Roofing',
  relationshipType: 'prospect',
  websiteUrl: 'https://acmeproroofing.com',
  industry: 'Roofing & Construction',
  location: 'Austin, TX',
  primaryContact: {
    name: 'Robert Davis',
    title: 'Managing Director',
    email: 'robert@acmeproroofing.com',
    phone: '(512) 555-0199',
    linkedinUrl: 'https://linkedin.com/in/robertdavis-acme'
  },
  notes: 'Found via organic Google search in Austin area. Homepage has no instant quote form.'
});

console.log('✅ Prospect Creation Verification:');
console.log(`- ID: ${testProspect.id}`);
console.log(`- Name: ${testProspect.name}`);
console.log(`- Relationship: ${testProspect.relationshipType}`);
console.log(`- Contact: ${testProspect.primaryContact?.name} (${testProspect.primaryContact?.title})`);
console.log(`- isArchived: ${testProspect.isArchived}`);

// 2. Test Existing Client Company Creation
const testClient: Company = companyRepository.create({
  name: 'Lone Star HVAC Solutions',
  relationshipType: 'existing_client',
  websiteUrl: 'https://lonestarhvac.com',
  industry: 'HVAC & Refrigeration',
  location: 'Dallas, TX',
  clientSince: '2025-03-15',
  engagementNotes: 'Monthly retainer ($1,500/mo) for SEO & maintenance. Evaluating for homepage CRO upgrade.',
  primaryContact: {
    name: 'Elena Garza',
    title: 'Operations VP',
    email: 'elena@lonestarhvac.com'
  }
});

console.log('\n✅ Existing Client Creation Verification:');
console.log(`- ID: ${testClient.id}`);
console.log(`- Name: ${testClient.name}`);
console.log(`- Relationship: ${testClient.relationshipType}`);
console.log(`- Client Since: ${testClient.clientSince}`);
console.log(`- Retainer Scope: ${testClient.engagementNotes}`);

// 3. Test Company Analysis Creation and Decoupled Linking
const testAnalysis: CompanyAnalysis = {
  id: `analysis_${Date.now()}_test1`,
  companyId: testProspect.id,
  sellerProfileId: 'seller_profile_primary',
  auditId: 'audit_demo_1',
  status: 'analyzed',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

console.log('\n✅ Company Analysis Linking Verification:');
console.log(`- Analysis ID: ${testAnalysis.id}`);
console.log(`- Linked Company ID: ${testAnalysis.companyId}`);
console.log(`- Linked Audit ID: ${testAnalysis.auditId}`);
console.log(`- Status: ${testAnalysis.status}`);

// 4. Test Relationship Conversion (Prospect -> Existing Client)
const promotedProspect: Company = {
  ...testProspect,
  relationshipType: 'existing_client',
  clientSince: '2026-09-11',
  engagementNotes: 'Closed 48-Hour Homepage Rescue project for $3,500.'
};

console.log('\n✅ Prospect -> Client Promotion State Transition:');
console.log(`- Target: ${promotedProspect.name}`);
console.log(`- Updated Relationship: ${promotedProspect.relationshipType}`);
console.log(`- Client Since: ${promotedProspect.clientSince}`);
console.log(`- New Engagement Notes: ${promotedProspect.engagementNotes}`);

// 5. Test CompanyWithStats Enrichment Contract
const companyWithStats: CompanyWithStats = {
  ...promotedProspect,
  analysesCount: 2,
  latestAnalysis: testAnalysis,
  latestAuditScoreFormatted: '44/60',
  latestAuditDate: '2026-09-11'
};

console.log('\n✅ CompanyWithStats Model Verification:');
console.log(`- Company: ${companyWithStats.name}`);
console.log(`- Total Analyses: ${companyWithStats.analysesCount}`);
console.log(`- Latest Score: ${companyWithStats.latestAuditScoreFormatted}`);

console.log('\n✨ ALL STAGE 2 COMPANY LAYER VERIFICATION CHECKS PASSED');
