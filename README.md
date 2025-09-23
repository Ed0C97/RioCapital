<!-- README.md

# FinBlog - Blog Finanziario Completo

Un blog finanziario moderno e completo con UI/UX ispirata a jethr.com, sviluppato con React (frontend) e Flask (backend).

## 🚀 Caratteristiche Principali

### ✅ **Design e UI/UX**
- Design moderno e professionale ispirato a jethr.com
- Layout completamente responsivo (desktop, tablet, mobile)
- Palette colori finanziaria professionale
- Componenti UI riutilizzabili con shadcn/ui
- Animazioni e transizioni fluide

### ✅ **Sistema di Autenticazione**
- Registrazione e login utenti
- Sistema di ruoli (utente, collaboratore, amministratore)
- Autenticazione sicura con sessioni
- Gestione profili utente

### ✅ **Gestione Articoli**
- Dashboard amministratore per gestire articoli
- Editor per creare e modificare articoli
- Sistema di categorie personalizzabili
- Pubblicazione e gestione bozze
- Upload immagini per articoli

### ✅ **Funzionalità Social**
- Sistema di like per articoli
- Commenti con registrazione obbligatoria
- Condivisione articoli (Web Share API + fallback)
- Salvataggio articoli preferiti
- Contatore visualizzazioni

### ✅ **Newsletter e Notifiche**
- Sistema newsletter completamente funzionante
- Notifiche personalizzate per:
  - Nuovi articoli pubblicati
  - Articoli di categorie specifiche
  - Articoli di autori specifici
  - Notifiche generali

### ✅ **Sistema Donazioni**
- Pagina donazioni professionale
- Importi predefiniti e personalizzati
- Donazioni anonime o con nome
- Messaggi di supporto
- Integrazione metodi di pagamento (Carta/PayPal)

### ✅ **Funzionalità Avanzate**
- Ricerca articoli in tempo reale
- Filtri per categoria e autore
- Statistiche dashboard amministratore
- Sistema di tag e categorizzazione
- SEO ottimizzato

## 🛠️ Tecnologie Utilizzate

### Frontend (React)
- **React 19** con Vite
- **Tailwind CSS** per lo styling
- **shadcn/ui** per i componenti UI
- **Lucide React** per le icone
- **React Router** per la navigazione
- **date-fns** per la gestione date

### Backend (Flask)
- **Flask** con SQLAlchemy
- **SQLite** database (facilmente sostituibile)
- **Flask-CORS** per le richieste cross-origin
- **Werkzeug** per la sicurezza password
- **API RESTful** complete

## 📦 Installazione e Setup

### Prerequisiti
- Node.js 18+ e pnpm
- Python 3.8+
- Git

### 1. Clona il repository
```bash
git clone <repository-url>
cd finblog-complete
```

### 2. Setup Backend (Flask)
```bash
cd finblog-backend

# Crea virtual environment
python -m venv venv

# Attiva virtual environment
# Su Linux/Mac:
source venv/bin/activate
# Su Windows:
# venv\Scripts\activate

# Installa dipendenze
pip install -r requirements.txt

# Avvia il server
python src/main.py
```
Il backend sarà disponibile su `http://localhost:5000`

### 3. Setup Frontend (React)
```bash
cd finblog-frontend

# Installa dipendenze
pnpm install

# Avvia il server di sviluppo
pnpm run dev
```
Il frontend sarà disponibile su `http://localhost:5173`

### 4. Build per produzione
```bash
# Frontend
cd finblog-frontend
pnpm run build

# Il build sarà nella cartella dist/
```

## 🎯 Utilizzo

### Per Utenti Normali
1. **Registrazione**: Crea un account dalla pagina di registrazione
2. **Navigazione**: Esplora articoli per categoria o ricerca
3. **Interazione**: Metti like, commenta e salva articoli preferiti
4. **Newsletter**: Iscriviti per ricevere aggiornamenti
5. **Donazioni**: Supporta il blog tramite la pagina donazioni

### Per Autori/Amministratori
1. **Login**: Accedi con account amministratore
2. **Dashboard**: Vai su `/admin/dashboard` per gestire articoli
3. **Creazione**: Crea nuovi articoli e categorie
4. **Gestione**: Modifica, pubblica o elimina articoli esistenti
5. **Statistiche**: Monitora visualizzazioni, like e commenti

## 🔧 Configurazione

### Variabili d'Ambiente Backend
Crea un file `.env` in `finblog-backend/`:
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///database/app.db
FLASK_ENV=development
```

### Configurazione Database
Il database SQLite viene creato automaticamente al primo avvio. Per utilizzare PostgreSQL o MySQL, modifica la `DATABASE_URL` nel file di configurazione.

## 📁 Struttura del Progetto

```
finblog-complete/
├── finblog-frontend/          # Frontend React
│   ├── src/
│   │   ├── components/        # Componenti riutilizzabili
│   │   ├── pages/            # Pagine dell'applicazione
│   │   ├── assets/           # Immagini e asset statici
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── finblog-backend/           # Backend Flask
│   ├── src/
│   │   ├── models/           # Modelli database
│   │   ├── routes/           # Route API
│   │   ├── database/         # File database
│   │   └── main.py           # Entry point
│   └── requirements.txt
├── design_notes.md           # Note di design e analisi UI/UX
├── selected_images.txt       # Lista immagini utilizzate
├── todo.md                   # Checklist sviluppo
└── README.md                 # Questo file
```

## 🚀 Deploy in Produzione

### Frontend (Netlify/Vercel)
1. Build del progetto: `pnpm run build`
2. Upload della cartella `dist/` al servizio di hosting
3. Configura le variabili d'ambiente per l'API backend

### Backend (Heroku/Railway/DigitalOcean)
1. Configura le variabili d'ambiente
2. Installa dipendenze: `pip install -r requirements.txt`
3. Avvia con: `python src/main.py`
4. Configura CORS per il dominio frontend

## 🎨 Personalizzazione

### Colori e Tema
Modifica i colori in `finblog-frontend/src/App.css`:
```css
:root {
  --finblog-primary: #007BFF;
  --finblog-secondary: #28A745;
  /* ... altri colori */
}
```

### Logo e Branding
Sostituisci il logo e le immagini in `finblog-frontend/src/assets/`

### Categorie Predefinite
Modifica le categorie in `finblog-frontend/src/pages/HomePage.jsx`

## 🐛 Troubleshooting

### Errori Comuni
1. **CORS Error**: Verifica che Flask-CORS sia configurato correttamente
2. **Database Error**: Controlla che il file database esista e sia accessibile
3. **Build Error**: Verifica che tutte le dipendenze siano installate

### Debug
- Backend: Controlla i log del server Flask
- Frontend: Usa gli strumenti di sviluppo del browser
- Database: Verifica la struttura delle tabelle

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file LICENSE per i dettagli.

## 🤝 Contributi

I contributi sono benvenuti! Per contribuire:
1. Fork del repository
2. Crea un branch per la tua feature
3. Commit delle modifiche
4. Push del branch
5. Apri una Pull Request

## 📞 Supporto

Per supporto o domande:
- Apri un issue su GitHub
- Contatta il team di sviluppo
- Consulta la documentazione

---

**FinBlog** - Il tuo blog finanziario di fiducia 💰📈
