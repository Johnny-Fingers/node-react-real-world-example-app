import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';

export default function Editor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEdit = !!slug;

  const [form, setForm] = useState({ title: '', description: '', body: '', tagList: [] });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (slug) {
      client.get(`/articles/${slug}`)
        .then((res) => {
          const a = res.data.article;
          setForm({ title: a.title, description: a.description, body: a.body, tagList: a.tagList });
        })
        .catch(() => navigate('/'));
    }
  }, [slug, navigate]);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tagList.includes(tag)) {
      setForm({ ...form, tagList: [...form.tagList, tag] });
    }
    setTagInput('');
  };

  const removeTag = (tag) => {
    setForm({ ...form, tagList: form.tagList.filter((t) => t !== tag) });
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const payload = { article: { ...form } };
      if (isEdit) {
        await client.put(`/articles/${slug}`, payload);
        navigate(`/article/${slug}`);
      } else {
        const res = await client.post('/articles', payload);
        navigate(`/article/${res.data.article.slug}`);
      }
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
    }
  };

  return (
    <div className="editor-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            {Object.keys(errors).length > 0 && (
              <ul className="error-messages">
                {Object.entries(errors).map(([key, msgs]) =>
                  msgs.map((msg, i) => <li key={`${key}-${i}`}>{msg}</li>)
                )}
              </ul>
            )}
            <form onSubmit={handleSubmit}>
              <fieldset>
                <fieldset className="form-group">
                  <input type="text" className="form-control form-control-lg" placeholder="Article Title" value={form.title} onChange={handleChange('title')} />
                </fieldset>
                <fieldset className="form-group">
                  <input type="text" className="form-control" placeholder="What's this article about?" value={form.description} onChange={handleChange('description')} />
                </fieldset>
                <fieldset className="form-group">
                  <textarea className="form-control" rows="8" placeholder="Write your article (in markdown)" value={form.body} onChange={handleChange('body')}></textarea>
                </fieldset>
                <fieldset className="form-group">
                  <input type="text" className="form-control" placeholder="Enter tags" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} onBlur={addTag} />
                  <div className="tag-list">
                    {form.tagList.map((tag) => (
                      <span key={tag} className="tag-default tag-pill">
                        <i className="ion-close-round" onClick={() => removeTag(tag)}></i> {tag}
                      </span>
                    ))}
                  </div>
                </fieldset>
                <button className="btn btn-lg pull-xs-right btn-primary" type="submit">
                  {isEdit ? 'Update Article' : 'Publish Article'}
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
