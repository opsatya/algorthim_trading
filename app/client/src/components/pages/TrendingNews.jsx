import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosConfig from '../utils/axiosConfig';

const TrendingNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Modified endpoint to match what the server expects
        const response = await axiosConfig.get("/news/trending");
        setNews(response.data.news || []);
      } catch (error) {
        console.error("Failed to fetch news:", error);
        setError("Failed to load news");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleViewAll = () => {
    navigate('/resources');
  };

  return (
    <div className="mt-4 w-full px-8 flex justify-center">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center py-2 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Trending News</h2>
          <button
            onClick={handleViewAll}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
          >
            View all
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center space-x-2 py-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-400 text-center py-4">{error}</div>
        ) : news.length === 0 ? (
          <div className="text-gray-400 text-center py-4">No recent news available</div>
        ) : (
          <div className="grid grid-cols-3 gap-6 py-4">
            {news.slice(0, 6).map((article, index) => (
              <a
                key={index}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 rounded-lg shadow-md p-6 h-32 hover:bg-gray-700 transition-colors flex flex-col justify-between"
              >
                <span className="text-sm text-white truncate">{article.title}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingNews;