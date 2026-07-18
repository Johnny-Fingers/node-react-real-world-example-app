import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import ArticlePreview from '../components/ArticlePreview';

export default function Profile() {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [activeTab, setActiveTab] = useState('author');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await client.get(`/profiles/${username}`);
        setProfile(res.data.profile);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [username]);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const params = activeTab === 'author'
          ? { author: username }
          : { favorited: username };
        const res = await client.get('/articles', { params });
        setArticles(res.data.articles);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [username, activeTab]);

  const handleFollow = async () => {
    if (!user) return;
    try {
      const res = profile.following
        ? await client.delete(`/profiles/${username}/follow`)
        : await client.post(`/profiles/${username}/follow`);
      setProfile(res.data.profile);
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) return <div className="container page">Loading...</div>;

  const isOwnProfile = user && user.username === username;

  return (
    <div className="profile-page">
      <div className="user-info">
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              <img src={profile.image || 'https://i.stack.imgur.com/xHWG8.jpg'} className="user-img" alt="" />
              <h4>{profile.username}</h4>
              <p>{profile.bio}</p>
              {isOwnProfile ? (
                <Link to="/settings" className="btn btn-sm btn-outline-secondary action-btn">
                  <i className="ion-gear-a"></i> &nbsp; Edit Profile Settings
                </Link>
              ) : user && (
                <button className="btn btn-sm btn-outline-secondary action-btn" onClick={handleFollow}>
                  <i className="ion-plus-round"></i> &nbsp; {profile.following ? 'Unfollow' : 'Follow'} {profile.username}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <div className="articles-toggle">
              <ul className="nav nav-pills outline-active">
                <li className="nav-item">
                  <button className={`nav-link${activeTab === 'author' ? ' active' : ''}`} onClick={() => setActiveTab('author')}>My Articles</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link${activeTab === 'favorited' ? ' active' : ''}`} onClick={() => setActiveTab('favorited')}>Favorited Articles</button>
                </li>
              </ul>
            </div>
            {loading ? (
              <div>Loading articles...</div>
            ) : articles.length === 0 ? (
              <div className="article-preview">No articles are here... yet.</div>
            ) : (
              articles.map((article) => (
                <ArticlePreview key={article.slug} article={article} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
