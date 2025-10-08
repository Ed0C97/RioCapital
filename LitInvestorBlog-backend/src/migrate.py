# RioCapitalBlog-backend/src/migrate.py

import sqlite3

DB_PATH = "/home/ubuntu/RioCapitalBlog-backend/src/RioCapitalBlog.db"

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    article_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    parent_id INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    moderation_reason TEXT,
    reported BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES article (id),
    FOREIGN KEY (user_id) REFERENCES user (id),
    FOREIGN KEY (parent_id) REFERENCES comments (id)
);

CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user (id),
    FOREIGN KEY (article_id) REFERENCES article (id),
    UNIQUE(user_id, article_id)
);

CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user (id),
    FOREIGN KEY (article_id) REFERENCES article (id),
    UNIQUE(user_id, article_id)
);

CREATE TABLE IF NOT EXISTS shares (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    article_id INTEGER NOT NULL,
    platform VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user (id),
    FOREIGN KEY (article_id) REFERENCES article (id)
);

CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_name VARCHAR(100),
    donor_email VARCHAR(255),
    amount REAL NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    message TEXT,
    anonymous BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
"""

ALTER_COMMANDS = [
    "ALTER TABLE user ADD COLUMN role VARCHAR(20) DEFAULT 'user';",
    "ALTER TABLE user ADD COLUMN bio TEXT;",
    "ALTER TABLE user ADD COLUMN avatar_url VARCHAR(255);",
    "ALTER TABLE article ADD COLUMN featured BOOLEAN DEFAULT FALSE;",
    "ALTER TABLE article ADD COLUMN cover_image VARCHAR(255);",
    "ALTER TABLE article ADD COLUMN tags TEXT;",
]


def migrate():
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        print("Connesso al database...")

        print("Creazione/verifica nuove tabelle...")
        cursor.executescript(CREATE_TABLE_SQL)
        print("Tabelle create/verificate con successo.")

        print("Aggiornamento tabelle esistenti...")
        for command in ALTER_COMMANDS:
            try:
                cursor.execute(command)
                print(f"Eseguito: {command}")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e):
                    print(f"Colonna già esistente, comando saltato: {command}")
                else:
                    raise e
        print("Tabelle aggiornate con successo.")

        conn.commit()
        print("Migrazione completata!")

    except sqlite3.Error as e:
        print(f"Errore durante la migrazione: {e}")
    finally:
        if conn:
            conn.close()
            print("Connessione al database chiusa.")


if __name__ == "__main__":
    migrate()
