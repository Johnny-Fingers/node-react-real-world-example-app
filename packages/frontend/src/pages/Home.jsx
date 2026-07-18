import { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import ArticlePreview from '../components/ArticlePreview';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 10;

export default function Home() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [articlesCount, setArticlesCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState(user ? 'your' : 'global');
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/tags').then((res) => setTags(res.data.tags)).catch(() => {});
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, activeTag]);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const offset = (currentPage - 1) * PAGE_SIZE;
      try {
        let res;
        if (activeTag) {
          res = await client.get(`/articles?tag=${activeTag}&limit=${PAGE_SIZE}&offset=${offset}`);
        } else if (activeTab === 'your' && user) {
          res = await client.get(`/articles/feed?limit=${PAGE_SIZE}&offset=${offset}`);
        } else {
          res = await client.get(`/articles?limit=${PAGE_SIZE}&offset=${offset}`);
        }
        setArticles(res.data.articles);
        setArticlesCount(res.data.articlesCount);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [activeTab, activeTag, currentPage, user]);

  const handleTagClick = (tag) => {
    setActiveTag(tag === activeTag ? null : tag);
    setActiveTab(null);
  };

  const totalPages = Math.ceil(articlesCount / PAGE_SIZE);

  return (
    <div className="home-page">
      <div className="banner">
        <div className="container">
          <h1 className="logo-font">conduit</h1>
          <p>A place to share your knowledge.</p>
        </div>
      </div>
      <div className="container page">
        <div className="row">
          <div className="col-md-9">
            <div className="feed-toggle">
              <ul className="nav nav-pills outline-active">
                {user && (
                  <li className="nav-item">
                    <button
                      className={`nav-link${activeTab === 'your' ? ' active' : ''}`}
                      onClick={() => { setActiveTab('your'); setActiveTag(null); }}
                    >
                      Your Feed
                    </button>
                  </li>
                )}
                <li className="nav-item">
                  <button
                    className={`nav-link${activeTab === 'global' ? ' active' : ''}`}
                    onClick={() => { setActiveTab('global'); setActiveTag(null); }}
                  >
                    Global Feed
                  </button>
                </li>
                {activeTag && (
                  <li className="nav-item">
                    <button className="nav-link active">#{activeTag}</button>
                  </li>
                )}
              </ul>
            </div>
            {loading ? (
              <div>Loading articles...</div>
            ) : articles.length === 0 ? (
              <div className="article-preview">No articles are here... yet.</div>
            ) : (
              articles.map((article) => (
                <ArticlePreview
                  key={article.slug}
                  article={article}
                  onFavoriteToggle={(updated) => {
                    setArticles(articles.map((a) => a.slug === updated.slug ? updated : a));
                  }}
                />
              ))
            )}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
          <div className="col-md-3">
            <div className="sidebar">
              <p>Popular Tags</p>
              <div className="tag-list">
                {tags.map((tag) => (
                  <button key={tag} className="tag-pill tag-default" onClick={() => handleTagClick(tag)}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
