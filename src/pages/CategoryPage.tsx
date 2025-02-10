import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'urql';
import { gql } from 'urql';
import { Loader2, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import SearchFilters from '../components/SearchFilters';
import SearchResults from '../components/SearchResults';
import MobileFilterMenu from '../components/MobileFilterMenu';
import BackToTop from '../components/BackToTop';
import SEO from '../components/SEO';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { formatPrice } from '../utils/formatPrice';

const COLLECTION_QUERY = gql`
  query GetCollection($handle: String!, $cursor: String) {
    collection(handle: $handle) {
      id
      title
      description
      descriptionHtml
      products(first: 250, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            productType
            vendor
            tags
            variants(first: 250) {
              edges {
                node {
                  id
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  quantityAvailable
                }
              }
            }
            images(first: 1) {
              edges {
                node {
                  originalSrc
                  altText
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;

const categoryConfig = {
  hondenvoeding: {
    collectionHandle: 'Hondenvoeding',
    productTypes: ['DROOGVOER', 'DIEPVRIESVOER', 'NATVOER']
  },
  hondenspeelgoed: {
    collectionHandle: 'hondenspeelgoed',
    productTypes: ['SPEELGOED']
  },
  hondensnacks: {
    collectionHandle: 'hondensnacks',
  },
  hondentraining: {
    collectionHandle: 'hondentraining',
  },
};

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const categoryData = category
    ? categoryConfig[category as keyof typeof categoryConfig]
    : null;

  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const PRODUCTS_PER_PAGE = 16;

  const [result] = useQuery({
    query: COLLECTION_QUERY,
    variables: { 
      handle: categoryData?.collectionHandle,
      cursor: cursor
    },
    pause: !categoryData?.collectionHandle,
  });

  const { data, fetching, error } = result;

  useEffect(() => {
    if (data?.collection?.products) {
      const newProducts = data.collection.products.edges.map(({ node }: any) => {
        const variants = node.variants.edges;
        const hasAvailableVariant = variants.some(
          ({ node: variant }: any) => variant.quantityAvailable > 0
        );
        const firstVariant = variants[0]?.node;
        const compareAtPrice = firstVariant?.compareAtPrice
          ? parseFloat(firstVariant.compareAtPrice.amount)
          : undefined;

        return {
          ...node,
          hasAvailableVariant,
          variantsCount: variants.length,
          firstVariantId: firstVariant?.id,
          compareAtPrice,
          formattedPrice: formatPrice(parseFloat(node.priceRange.minVariantPrice.amount)),
          formattedCompareAtPrice: compareAtPrice ? formatPrice(compareAtPrice) : undefined
        };
      });

      setAllProducts(prev => {
        const uniqueProducts = [...prev];
        newProducts.forEach(product => {
          if (!uniqueProducts.find(p => p.id === product.id)) {
            uniqueProducts.push(product);
          }
        });
        return uniqueProducts;
      });

      if (data.collection.products.pageInfo.hasNextPage) {
        setCursor(data.collection.products.pageInfo.endCursor);
      } else {
        setIsLoadingAll(false);
      }
    }
  }, [data]);

  useEffect(() => {
    if (!isLoadingAll) {
      const filtered = allProducts.filter((product: any) => {
        const price = parseFloat(product.priceRange.minVariantPrice.amount);

        const matchesPrice =
          selectedPriceRanges.length === 0 ||
          selectedPriceRanges.some((range) => {
            const [min, max] = range.split('-').map(parseFloat);
            return price >= min && price <= max;
          });

        const matchesTags =
          selectedTags.length === 0 ||
          selectedTags.some((tag) => product.tags.includes(tag));

        const matchesBrands =
          selectedBrands.length === 0 ||
          selectedBrands.includes(product.vendor);

        const matchesTypes =
          selectedTypes.length === 0 ||
          (category === 'hondenvoeding' && selectedTypes.includes(product.productType));

        return matchesPrice && matchesTags && matchesBrands && matchesTypes;
      });

      setFilteredProducts(filtered);
      setDisplayedProducts(filtered.slice(0, PRODUCTS_PER_PAGE));
    }
  }, [allProducts, selectedPriceRanges, selectedTags, selectedBrands, selectedTypes, category, isLoadingAll]);

  useEffect(() => {
    if (!isLoadingAll) {
      const tags = new Set<string>();
      const brands = new Set<string>();
      allProducts.forEach((product: any) => {
        product.tags.forEach((tag: string) => tags.add(tag));
        if (product.vendor) brands.add(product.vendor);
      });
      setAvailableTags(Array.from(tags));
      setAvailableBrands(Array.from(brands));
    }
  }, [allProducts, isLoadingAll]);

  const loadMoreProducts = useCallback(() => {
    const currentLength = displayedProducts.length;
    const nextProducts = filteredProducts.slice(
      currentLength,
      currentLength + PRODUCTS_PER_PAGE
    );
    
    if (nextProducts.length > 0) {
      setDisplayedProducts(prev => [...prev, ...nextProducts]);
      setIsFetching(false);
    }
  }, [filteredProducts, displayedProducts.length]);

  const { loadMoreRef, isFetching, setIsFetching } = useInfiniteScroll(loadMoreProducts);

  const handleFilterChange = (type: 'price' | 'tags' | 'brand' | 'type', value: string) => {
    switch (type) {
      case 'price':
        setSelectedPriceRanges((prev) =>
          prev.includes(value)
            ? prev.filter((range) => range !== value)
            : [value]
        );
        break;
      case 'tags':
        setSelectedTags((prev) =>
          prev.includes(value)
            ? prev.filter((tag) => tag !== value)
            : [...prev, value]
        );
        break;
      case 'brand':
        setSelectedBrands((prev) =>
          prev.includes(value)
            ? prev.filter((brand) => brand !== value)
            : [...prev, value]
        );
        break;
      case 'type':
        setSelectedTypes((prev) =>
          prev.includes(value)
            ? prev.filter((type) => type !== value)
            : [...prev, value]
        );
        break;
    }
  };

  const clearFilters = () => {
    setSelectedPriceRanges([]);
    setSelectedTags([]);
    setSelectedBrands([]);
    setSelectedTypes([]);
  };

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <SEO
          title="Categorie niet gevonden"
          description="De opgevraagde categorie bestaat niet."
          noindex={true}
        />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Categorie niet gevonden
          </h1>
          <p className="text-gray-500">
            De opgevraagde categorie bestaat niet.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <SEO
          title="Fout bij laden categorie"
          description="Er is een fout opgetreden bij het laden van de categorie."
          noindex={true}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Er is een fout opgetreden bij het laden van de categorie.
        </div>
      </div>
    );
  }

  const collection = data?.collection;
  const canonicalUrl = `https://teddyshondenshop.nl/categorie/${category}`;
  const categoryTitle = collection?.title || categoryData.collectionHandle;
  
  const categoryDescription = collection?.description || 
    `Ontdek ons uitgebreide assortiment ${categoryTitle.toLowerCase()}. ` +
    `De beste kwaliteit voor jouw hond, direct bij jou thuisbezorgd. ` +
    `${filteredProducts.length} producten beschikbaar.`;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`${categoryTitle} voor honden`}
        description={categoryDescription}
        canonical={canonicalUrl}
        type="website"
        image={filteredProducts[0]?.images?.edges[0]?.node?.originalSrc}
        imageAlt={`${categoryTitle} collectie bij Teddy's Hondenshop`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 text-gray-600 hover:text-gray-900 flex items-center gap-2 group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Terug
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {collection?.title}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block lg:w-72 flex-shrink-0">
            {isLoadingAll ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <SearchFilters
                availableTags={availableTags}
                availableBrands={availableBrands}
                selectedTags={selectedTags}
                selectedBrands={selectedBrands}
                selectedPriceRanges={selectedPriceRanges}
                productTypes={category === 'hondenvoeding' ? categoryData.productTypes : undefined}
                selectedTypes={selectedTypes}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
              />
            )}
          </aside>

          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-500">
                {isLoadingAll ? (
                  <div className="animate-pulse h-4 w-24 bg-gray-200 rounded"></div>
                ) : (
                  `${filteredProducts.length} producten gevonden`
                )}
              </div>
              
              <button
                onClick={() => setIsFilterMenuOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>

            {isLoadingAll ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <SearchResults
                products={displayedProducts}
                collection={collection}
                filteredProducts={filteredProducts}
                loadMoreRef={loadMoreRef}
                isFetching={isFetching}
              />
            )}

            {(collection?.descriptionHtml || collection?.description) && (
              <div className="mt-16 bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Teddy's {collection?.title}
                </h2>
                {collection.descriptionHtml ? (
                  <div
                    className="prose prose-blue max-w-none"
                    dangerouslySetInnerHTML={{ __html: collection.descriptionHtml }}
                  />
                ) : (
                  <p className="text-gray-600">{collection.description}</p>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <MobileFilterMenu
        isOpen={isFilterMenuOpen}
        onClose={() => setIsFilterMenuOpen(false)}
        availableTags={availableTags}
        availableBrands={availableBrands}
        selectedTags={selectedTags}
        selectedBrands={selectedBrands}
        selectedPriceRanges={selectedPriceRanges}
        productTypes={category === 'hondenvoeding' ? categoryData.productTypes : undefined}
        selectedTypes={selectedTypes}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      <BackToTop />
    </div>
  );
}