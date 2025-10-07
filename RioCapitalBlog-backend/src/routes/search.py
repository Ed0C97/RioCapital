from flask import Blueprint, jsonify
from src.models.article import Article

search_bp = Blueprint('search_bp', __name__)


@search_bp.route('/search-data', methods=['GET'])
def get_search_data():
    """
    Questo endpoint restituisce una lista di tutti gli articoli pubblicati
    in un formato ottimizzato per la ricerca fuzzy nel frontend.
    """
    try:
        # --- CORREZIONE DEFINITIVA: Usa l'operatore 'is_' per un confronto booleano robusto ---
        articles = Article.query.filter(Article.published.is_(True)).all()

        searchable_items = []
        for article in articles:
            article_content = article.content if article.content else ""

            if article.excerpt:
                snippet = article.excerpt
            else:
                snippet = (article_content[:150] + '...') if len(article_content) > 150 else article_content

            item = {
                "type": "article",
                "title": article.title,
                "slug": f"/article/{article.slug}",
                "category": article.category.name if article.category else "Uncategorized",
                "content_snippet": snippet
            }
            searchable_items.append(item)

        return jsonify(searchable_items)

    except Exception as e:
        print(f"Error in /api/search-data: {e}")
        return jsonify({"error": "An error occurred while fetching search data."}), 500