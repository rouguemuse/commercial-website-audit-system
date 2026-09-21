export interface BrandingConfig {
  appName: string;
  shortName: string;
  companyName: string;
  tagline: string;
  frameworkVersionDefault: string;
  reportTitle: string;
  supportEmail: string;
  website: string;
  currencySymbol: string;
  footerMetadataTemplate: string;
}

export const brandingConfig: BrandingConfig = {
  appName: 'ContextMuse Website Audit System',
  shortName: 'ContextMuse Audits',
  companyName: 'ContextMuse',
  tagline: 'One framework. Every product.',
  frameworkVersionDefault: '1.0',
  reportTitle: 'Website Conversion Checkup',
  supportEmail: 'hello@contextmuse.com',
  website: 'https://contextmuse.com',
  currencySymbol: '$',
  footerMetadataTemplate: 'Website Conversion Checkup • ContextMuse • Evaluation framework {version} • {date}'
};
