<!-- README_AGGIORNATO.md

# Rio Capital Blog - Blog Finanziario Completo

## 🚀 Versione 1.1.0 - Aggiornamenti Implementati

### ✅ Problemi Risolti

1. **✅ Pagine 404 Mancanti**
   - Creata pagina Categorie (`/categorie`)
   - Creata pagina Chi Siamo (`/chi-siamo`)
   - Creata pagina Contatti (`/contatti`)
   - Creata pagina 404 personalizzata

2. **✅ Errore di Connessione Registrazione**
   - Configurato proxy Vite per comunicazione frontend-backend
   - Abilitato CORS nel backend Flask
   - Aggiunto endpoint per form contatti

3. **✅ Dimensioni Schede Articoli**
   - Implementato layout flexbox per altezze uniformi
   - Migliorata struttura CSS delle card

4. **✅ Carosello Automatico**
   - Creato componente `ArticleCarousel`
   - Scorrimento automatico ogni 6 secondi
   - Controlli manuali (play/pause, navigazione)
   - Design completamente responsivo

## 🛠️ Installazione e Avvio

### Prerequisiti
- Node.js 18+
- Python 3.11+
- npm o yarn

### Backend (Flask)
```bash
cd Rio Capital Blog-backend
pip install -r requirements.txt
cd src
python main.py
```
Il backend sarà disponibile su `http://localhost:5000`

### Frontend (React + Vite)
```bash
cd Rio Capital Blog-frontend
npm install --legacy-peer-deps
npm run dev
```
Il frontend sarà disponibile su `http://localhost:5173`

## 📱 Nuove Funzionalità

### Pagina Categorie
- Visualizzazione di tutte le categorie con icone
- Contatore articoli per categoria
- Design responsive con grid layout
- Categorie predefinite se il database è vuoto

### Pagina Chi Siamo
- Presentazione del team con foto e ruoli
- Sezione missione e valori aziendali
- Statistiche del blog
- Call-to-action per registrazione

### Pagina Contatti
- Form completo con validazione
- Tipi di richiesta (Generale, Partnership, Supporto, Stampa)
- Informazioni di contatto
- Link ai social media
- Conferma di invio messaggio

### Carosello Articoli Recenti
- Scorrimento automatico configurabile
- Controlli manuali (precedente/successivo)
- Pulsante play/pause
- Indicatori di posizione
- Barra di progresso
- Completamente responsivo (1-4 articoli per vista)

## 🎨 Miglioramenti UI/UX

### Design Consistente
- Utilizzo uniforme dei componenti shadcn/ui
- Palette colori coerente
- Tipografia migliorata
- Icone Lucide React

### Responsività
- Layout adattivo per mobile, tablet, desktop
- Carosello che si adatta al dispositivo
- Menu di navigazione ottimizzato

### Accessibilità
- Attributi ARIA per screen reader
- Contrasti colori conformi WCAG
- Navigazione da tastiera
- Focus management

## 🔧 Architettura Tecnica

### Frontend (React)
```
src/
├── components/
│   ├── ui/                 # Componenti shadcn/ui
│   ├── ArticleCard.jsx     # Card articolo migliorata
│   ├── ArticleCarousel.jsx # Nuovo carosello
│   ├── Header.jsx
│   └── Footer.jsx
├── pages/
│   ├── HomePage.jsx        # Con carosello integrato
│   ├── CategoriesPage.jsx  # NUOVO
│   ├── AboutPage.jsx       # NUOVO
│   ├── ContactPage.jsx     # NUOVO
│   ├── NotFoundPage.jsx    # NUOVO
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DonatePage.jsx
│   └── AdminDashboard.jsx
└── App.jsx                 # Routing aggiornato
```

### Backend (Flask)
```
src/
├── routes/
│   ├── auth.py
│   ├── articles.py
│   ├── categories.py
│   ├── newsletter.py
│   ├── user.py
│   └── contact.py          # NUOVO
├── models/
│   ├── user.py
│   ├── article.py
│   ├── category.py
│   └── newsletter.py
└── main.py                 # CORS configurato
```

## 🔗 API Endpoints

### Nuovi Endpoint
- `POST /api/contact` - Invio messaggi di contatto

### Endpoint Esistenti
- `GET /api/categories` - Lista categorie
- `POST /api/auth/register` - Registrazione utente
- `POST /api/auth/login` - Login utente
- `GET /api/articles` - Lista articoli

## 🚦 Testing

### Test Funzionalità
1. **Navigazione**: Tutte le pagine sono raggiungibili
2. **Carosello**: Scorrimento automatico e controlli manuali
3. **Form Contatti**: Validazione e invio messaggi
4. **Responsive**: Layout corretto su tutti i dispositivi
5. **API**: Comunicazione frontend-backend funzionante

### Browser Supportati
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📦 Deployment

### Produzione
1. Build frontend: `npm run build`
2. Configurare server Flask per produzione
3. Servire file statici dal build
4. Configurare database PostgreSQL/MySQL

### Variabili Ambiente
```env
# Backend
FLASK_ENV=production
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key

# Frontend
VITE_API_URL=your_api_url
```

## 🐛 Troubleshooting

### Problemi Comuni

**Frontend non si connette al backend**
- Verificare che il backend sia in esecuzione su porta 5000
- Controllare configurazione proxy in `vite.config.js`

**Errori di dipendenze npm**
- Usare `npm install --legacy-peer-deps`
- Verificare versione Node.js

**Carosello non funziona**
- Verificare che ci siano articoli nel mock data
- Controllare console browser per errori JavaScript

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT.

## 👥 Contributi

Per contribuire al progetto:
1. Fork del repository
2. Creare branch feature
3. Commit delle modifiche
4. Push e Pull Request

## 📞 Supporto

Per supporto tecnico:
- Email: info@Rio Capital Blog.it
- GitHub Issues: [Repository Issues]
- Documentazione: [Wiki del progetto]
