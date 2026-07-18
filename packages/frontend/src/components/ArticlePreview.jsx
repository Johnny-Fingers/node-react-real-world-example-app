import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ArticlePreview({ article, onFavoriteToggle }) {
  const { user } = useAuth();

  const handleFavorite = async () => {
    if (!user) return;
    try {
      const res = article.favorited
        ? await client.delete(`/articles/${article.slug}/favorite`)
        : await client.post(`/articles/${article.slug}/favorite`);
      if (onFavoriteToggle) onFavoriteToggle(res.data.article);
    } catch (err) {
      console.error(err);
    }
  };

  const date = new Date(article.createdAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="article-preview">
      <div className="article-meta">
        <Link to={`/profile/${article.author.username}`}>
          <img src={article.author.image || 'https://i.stack.imgur.com/xHWG8.jpg'} alt="" />
        </Link>
        <div className="info">
          <Link to={`/profile/${article.author.username}`} className="author">{article.author.username}</Link>
          <span className="date">{date}</span>
        </div>
        <button className="btn btn-outline-primary btn-sm pull-xs-right" onClick={handleFavorite}>
          <i className="ion-heart"></i> {article.favoritesCount}
        </button>
      </div>
      <Link to={`/article/${article.slug}`} className="preview-link">
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <span>Read more...</span>
        {article.tagList && article.tagList.length > 0 && (
          <ul className="tag-list">
            {article.tagList.map((tag) => (
              <li key={tag} className="tag-default tag-pill tag-outline">{tag}</li>
            ))}
          </ul>
        )}
      </Link>
    </div>
  );
}
