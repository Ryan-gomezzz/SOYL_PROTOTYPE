import React from 'react';
import './TemplateSelector.css';

interface Template {
  id: string;
  name: string;
  category: 'shirt' | 'jacket' | 'pants';
  icon: string;
  thumbnail: string;
}

const templates: Template[] = [
  {
    id: 'shirt-basic',
    name: 'Basic Shirt',
    category: 'shirt',
    icon: '👔',
    thumbnail: '/templates/shirt-basic.jpg'
  },
  {
    id: 'shirt-casual',
    name: 'Casual Shirt',
    category: 'shirt',
    icon: '👕',
    thumbnail: '/templates/shirt-casual.jpg'
  },
  {
    id: 'jacket-blazer',
    name: 'Blazer',
    category: 'jacket',
    icon: '🤵',
    thumbnail: '/templates/jacket-blazer.jpg'
  },
  {
    id: 'jacket-leather',
    name: 'Leather Jacket',
    category: 'jacket',
    icon: '🧥',
    thumbnail: '/templates/jacket-leather.jpg'
  },
  {
    id: 'pants-jeans',
    name: 'Jeans',
    category: 'pants',
    icon: '👖',
    thumbnail: '/templates/pants-jeans.jpg'
  },
  {
    id: 'pants-chinos',
    name: 'Chinos',
    category: 'pants',
    icon: '👔',
    thumbnail: '/templates/pants-chinos.jpg'
  },
];

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template) => void;
  selectedTemplateId?: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelectTemplate, selectedTemplateId }) => {
  const categories = ['shirt', 'jacket', 'pants'] as const;
  const [selectedCategory, setSelectedCategory] = React.useState<'shirt' | 'jacket' | 'pants'>('shirt');

  const filteredTemplates = templates.filter(t => t.category === selectedCategory);

  return (
    <div className="template-selector glass">
      <div className="template-selector-header">
        <h3 className="template-selector-title">🎨 Garment Templates</h3>
        <p className="template-selector-subtitle">Choose a template to start designing</p>
      </div>

      {/* Category Tabs */}
      <div className="template-category-tabs">
        {categories.map((category) => (
          <button
            key={category}
            className={`template-category-tab ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="template-grid">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={`template-card ${selectedTemplateId === template.id ? 'selected' : ''}`}
            onClick={() => onSelectTemplate(template)}
          >
            <div className="template-icon">{template.icon}</div>
            <div className="template-name">{template.name}</div>
            <div className="template-overlay">
              <span className="template-overlay-text">Use Template</span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="template-empty">
          <p>No templates available in this category yet.</p>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
