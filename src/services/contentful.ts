import { createClient } from 'contentful';

const SPACE_ID = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;

export const contentfulClient = SPACE_ID && ACCESS_TOKEN
  ? createClient({
      space: SPACE_ID,
      accessToken: ACCESS_TOKEN,
    })
  : null;

export interface ContentfulPage {
  title: string;
  content: any;
  slug: string;
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

export const getContentfulPage = async (entryId: string): Promise<ContentfulPage | null> => {
  if (!contentfulClient) {
    console.warn('Contentful client not initialized - missing environment variables');
    return null;
  }

  try {
    const entry = await contentfulClient.getEntry(entryId);
    const title = entry.fields.title as string;
    return {
      title,
      content: entry.fields.content,
      slug: entry.fields.slug as string || generateSlug(title),
    };
  } catch (error) {
    console.error('Error fetching Contentful page:', error);
    return null;
  }
};

export const getAllLegalPages = async (): Promise<ContentfulPage[]> => {
  if (!contentfulClient) {
    console.warn('Contentful client not initialized - missing environment variables');
    return [];
  }

  try {
    const entries = await contentfulClient.getEntries({
      content_type: 'legalPage',
    });

    return entries.items.map(entry => {
      const title = entry.fields.title as string;
      return {
        title,
        content: entry.fields.content,
        slug: entry.fields.slug as string || generateSlug(title),
      };
    });
  } catch (error) {
    console.error('Error fetching legal pages:', error);
    return [];
  }
};