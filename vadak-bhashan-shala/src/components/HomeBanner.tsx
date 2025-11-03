import React from 'react';
import { useQuery } from '@tanstack/react-query';

const BACKEND_API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

interface Banner {
  _id: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
}

const HomeBanner = () => {
  const { data, isLoading, error } = useQuery<Banner | null>({
    queryKey: ['activeBanner'],
    queryFn: async () => {
      const res = await fetch(`${BACKEND_API_URL}/api/banners/active`);
      if (!res.ok) {
        console.error('Banner fetch failed:', res.status);
        return null;
      }
      const json = await res.json();
      console.log('🟢 Active banner response:', json);
      return json;
    },
  });

  if (isLoading) return <div className="h-48 bg-gray-100 animate-pulse rounded-xl my-6"></div>;
  if (error || !data) return null;

  return (
    <div className="py-6">
      <a
        href={data.link || '#'}
        target={data.link?.startsWith('http') ? '_blank' : '_self'}
        rel={data.link?.startsWith('http') ? 'noopener noreferrer' : ''}
        className="block w-full overflow-hidden rounded-xl shadow-lg hover:scale-[1.005] transition-transform"
      >
        <img
          src={data.imageUrl}
          alt="Promotional Banner"
          className="w-full h-auto object-cover max-h-96"
          onError={(e) => console.error('❌ Image failed to load:', e.currentTarget.src)}
        />
      </a>
    </div>
  );
};

export default HomeBanner;
