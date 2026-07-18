import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Article() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchArticle = async () => {
    try {
      const res = await client.get(`/articles/${slug}`);
      setArticle(res.data.article);
    } catch (err) {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await client.get(`/articles/${slug}/comments`);
      setComments(res.data.comments);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchArticle();
    fetchComments();
  }, [slug]);

  const handleFavorite = async () => {
    if (!user) return navigate('/login');
    try {
      const res = article.favorited
        ? await client.delete(`/articles/${slug}/favorite`)
        : await client.post(`/articles/${slug}/favorite`);
      setArticle(res.data.article);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async () => {
    if (!user) return navigate('/login');
    try {
      const res = article.author.following
        ? await client.delete(`/profiles/${article.author.username}/follow`)
        : await client.post(`/profiles/${article.author.username}/follow`);
      setArticle({ ...article, author: { ...article.author, following: res.data.profile.following } });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await client.delete(`/articles/${slug}`);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    try {
      const res = await client.post(`/articles/${slug}/comments`, { comment: { body: commentBody } });
      setComments([...comments, res.data.comment]);
      setCommentBody('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await client.delete(`/articles/${slug}/comments/${id}`);
      setComments(comments.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="container page">Loading...</div>;
  if (!article) return null;

  const date = new Date(article.createdAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const isAuthor = user && user.username === article.author.username;

  return (
    <div className="article-page">
      <div className="banner">
        <div className="container">
          <h1>{article.title}</h1>
          <div className="article-meta">
            <Link to={`/profile/${article.author.username}`}>
              <img src={article.author.image || 'https://i.stack.imgur.com/xHWG8.jpg'} alt="" />
            </Link>
            <div className="info">
              <Link to={`/profile/${article.author.username}`} className="author">{article.author.username}</Link>
              <span className="date">{date}</span>
            </div>
            {isAuthor ? (
              <>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(`/editor/${article.slug}`)}>
                  <i className="ion-edit"></i> Edit Article
                </button>
                &nbsp;&nbsp;
                <button className="btn btn-sm btn-outline-danger" onClick={handleDelete}>
                  <i className="ion-trash-a"></i> Delete Article
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-sm btn-outline-secondary" onClick={handleFollow}>
                  <i className="ion-plus-round"></i>
                  &nbsp; {article.author.following ? 'Unfollow' : 'Follow'} {article.author.username}
                </button>
                &nbsp;&nbsp;
                <button className="btn btn-sm btn-outline-primary" onClick={handleFavorite}>
                  <i className="ion-heart"></i>
                  &nbsp; {article.favorited ? 'Unfavorite' : 'Favorite'} Article <span className="counter">({article.favoritesCount})</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            <div dangerouslySetInnerHTML={{ __html: article.body.replace(/\n/g, '<br />') }} />
            {article.tagList && article.tagList.length > 0 && (
              <ul className="tag-list">
                {article.tagList.map((tag) => (
                  <li key={tag} className="tag-default tag-pill tag-outline">{tag}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <hr />
        <div className="article-actions">
          <div className="article-meta">
            <Link to={`/profile/${article.author.username}`}>
              <img src={article.author.image || 'https://i.stack.imgur.com/xHWG8.jpg'} alt="" />
            </Link>
            <div className="info">
              <Link to={`/profile/${article.author.username}`} className="author">{article.author.username}</Link>
              <span className="date">{date}</span>
            </div>
            {isAuthor ? (
              <>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(`/editor/${article.slug}`)}>
                  <i className="ion-edit"></i> Edit Article
                </button>
                &nbsp;
                <button className="btn btn-sm btn-outline-danger" onClick={handleDelete}>
                  <i className="ion-trash-a"></i> Delete Article
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-sm btn-outline-secondary" onClick={handleFollow}>
                  <i className="ion-plus-round"></i> &nbsp; {article.author.following ? 'Unfollow' : 'Follow'} {article.author.username}
                </button>
                &nbsp;
                <button className="btn btn-sm btn-outline-primary" onClick={handleFavorite}>
                  <i className="ion-heart"></i> &nbsp; Favorite Article <span className="counter">({article.favoritesCount})</span>
                </button>
              </>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-md-8 offset-md-2">
            {user ? (
              <form className="card comment-form" onSubmit={handlePostComment}>
                <div className="card-block">
                  <textarea className="form-control" placeholder="Write a comment..." rows="3" value={commentBody} onChange={(e) => setCommentBody(e.target.value)}></textarea>
                </div>
                <div className="card-footer">
                  <img src={user.image || 'https://i.stack.imgur.com/xHWG8.jpg'} className="comment-author-img" alt="" />
                  <button className="btn btn-sm btn-primary" type="submit">Post Comment</button>
                </div>
              </form>
            ) : (
              <p><Link to="/login">Sign in</Link> or <Link to="/register">sign up</Link> to add comments on this article.</p>
            )}
            {comments.map((comment) => {
              const commentDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              });
              return (
                <div className="card" key={comment.id}>
                  <div className="card-block">
                    <p className="card-text">{comment.body}</p>
                  </div>
                  <div className="card-footer">
                    <Link to={`/profile/${comment.author.username}`} className="comment-author">
                      <img src={comment.author.image || 'https://i.stack.imgur.com/xHWG8.jpg'} className="comment-author-img" alt="" />
                    </Link>
                    &nbsp;
                    <Link to={`/profile/${comment.author.username}`} className="comment-author">{comment.author.username}</Link>
                    <span className="date-posted">{commentDate}</span>
                    {user && user.username === comment.author.username && (
                      <span className="mod-options">
                        <i className="ion-trash-a" onClick={() => handleDeleteComment(comment.id)}></i>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
